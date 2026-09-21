/**
 * Genera los borradores de la página de preguntas frecuentes.
 *
 *   contenido/preguntas.md  →  Gemini rellena los huecos  →  /preguntas
 *
 * Por qué existe esta página: el corpus está escrito para responder preguntas
 * en lenguaje natural, pero solo se llega a él por POST /api/chat. Ningún
 * rastreador —ni el de Google, ni GPTBot, ni ClaudeBot— verá jamás esas
 * respuestas. Esta página las pone en HTML servido, que es lo único que esos
 * sistemas pueden leer y citar.
 *
 * DOS REGLAS QUE GOBIERNAN EL SCRIPT
 *
 * 1. El Markdown es la fuente de verdad, y lo es del todo: las preguntas se
 *    escriben ahí y el script solo rellena las que estén sin respuesta. No las
 *    inventa ni las reordena.
 *
 *    Al principio se sembraban desde eval/questions.json, pero las dos listas
 *    quieren cosas opuestas. El arnés necesita preguntas estrechas —«¿ha
 *    trabajado con Laravel?»— porque comprueba que la búsqueda encuentra un
 *    término concreto. Esta página necesita pocas y amplias, porque un visitante
 *    no lee veintiséis epígrafes que se solapan. Sembrar de una lista a la otra
 *    reintroducía las estrechas en cada ejecución.
 *
 *    Una respuesta que ya tiene texto NO se toca nunca: reescribirla borraría
 *    las correcciones a mano, que son el motivo de que el fichero exista y esté
 *    versionado. Para regenerar una, se vacía su texto y se vuelve a pasar.
 *
 * 2. Nada se publica sin leerlo. El script deja borradores; lo que llega a
 *    producción es lo que Rafaías revisa y commitea. Es texto público sobre su
 *    trayectoria profesional, en la página que precisamente van a citar los
 *    buscadores con IA.
 *
 * Uso:  npm run faq
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../src/lib/env.ts';
import { getLLMProvider, providerIsReal } from '../src/lib/llm/index.ts';
import { buildContext, buildUserMessage, getSystemPrompt } from '../src/lib/rag/prompt.ts';
import { retrieve, type RetrievedChunk } from '../src/lib/rag/retrieve.ts';
import { closePool } from '../src/lib/db/index.ts';
import {
  parsearPreguntas,
  serializarPreguntas,
  rutaPreguntas,
  type EntradaPregunta,
} from '../src/lib/site/preguntas.ts';
import type { Lang } from '../src/lib/i18n/types.ts';

/**
 * Pausa entre llamadas.
 *
 * El nivel gratuito de Gemini admite 15 peticiones por minuto, y con 26
 * preguntas se alcanza a mitad de recorrido. Cuatro segundos y medio dejan
 * margen suficiente; el script tarda unos dos minutos en total, que para algo
 * que se ejecuta cuando cambia el corpus es irrelevante.
 */
const PAUSA_MS = 4_500;

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Ajuste de voz para esta página, añadido al prompt del asistente.
 */
const VOZ_DE_LA_PAGINA_ES = `

AJUSTE PARA ESTA PÁGINA
Estas respuestas NO las lee un visitante en un chat: se publican en la página de preguntas frecuentes del propio sitio de ${env.siteOwner}, bajo su nombre y escritas por él.

Por tanto, y sustituyendo a la regla de tercera persona: escribe en PRIMERA PERSONA del singular —«trabajé», «diseñé», «llevo diecinueve años»—. No escribas su nombre para referirte a ti mismo ni empieces las respuestas nombrándolo.

No añadas avisos sobre disponibilidad, expectativas salariales ni datos de contacto a menos que la pregunta trate exactamente de eso: la página ya tiene su propio formulario de contacto.

El resto de reglas siguen vigentes sin excepción, en especial no afirmar nada que no esté en los fragmentos y citar cada afirmación con su marcador.`;

const VOZ_DE_LA_PAGINA_EN = `

PAGE ADJUSTMENT
These answers are NOT read by a visitor in a chat: they are published on the FAQ page of ${env.siteOwner}'s own website, under his name and written by him.

Therefore, overriding the third-person rule: write in FIRST PERSON singular —"I worked", "I designed", "I have nineteen years of experience". Do not write his name to refer to yourself or begin answers by naming him.

Do not add notes about availability, salary expectations, or contact details unless the question is specifically about that: the page already has its own contact form.

All other rules remain strictly in effect, especially making no claims not supported by the excerpts and citing every statement with its marker.`;

const PREAMBULO_ES = `# Preguntas frecuentes

Las respuestas salen de la misma base de conocimiento que consulta el asistente
del sitio, y cada afirmación enlaza al documento que la respalda. Si lo que
buscas no está aquí, pregúntaselo directamente al asistente en la portada.
`;

const PREAMBULO_EN = `# Frequently Asked Questions

Answers are drawn from the same knowledge base consulted by the site's assistant,
and each statement links to the supporting document. If what you're looking for
isn't here, ask the assistant directly on the home page.
`;

/**
 * Genera una respuesta componiendo la recuperación y la generación del
 * asistente, sin pasar por answerQuestion().
 */
async function generar(pregunta: string, lang: Lang): Promise<string | null> {
  const chunks = await retrieve(pregunta, { matchCount: 12, lang });
  const contexto = buildContext(chunks);

  if (contexto.used.length === 0) return null;

  const basePrompt = getSystemPrompt(lang);
  const voiceAdjustment = lang === 'en' ? VOZ_DE_LA_PAGINA_EN : VOZ_DE_LA_PAGINA_ES;

  const { text } = await getLLMProvider().generate({
    system: basePrompt + voiceAdjustment,
    user: buildUserMessage(pregunta, contexto),
    maxOutputTokens: 1024,
  });

  return enlazarCitas(text.trim(), contexto.used, lang);
}

/**
 * Convierte los marcadores de cita en enlaces a la ficha que respalda la frase.
 */
function enlazarCitas(texto: string, usados: readonly RetrievedChunk[], lang: Lang): string {
  return texto.replace(/\[([\d\s,;yY]+)\](?!\()/g, (completo, dentro: string) => {
    const numeros = (dentro.match(/\d+/g) ?? [])
      .map(Number)
      .filter((n) => n >= 1 && n <= usados.length);

    if (numeros.length === 0) return completo;

    return numeros.map((n) => `[${n}](/${lang}/${usados[n - 1]!.slug})`).join(' ');
  });
}

async function main(): Promise<void> {
  const langIndex = process.argv.indexOf('--lang');
  const targetLang: Lang =
    langIndex !== -1 && process.argv[langIndex + 1] === 'en' ? 'en' : 'es';

  if (!providerIsReal()) {
    throw new Error(
      'No hay GEMINI_API_KEY: el proveedor simulado devuelve texto de muestra.\n' +
        'Escribir eso en la página de preguntas frecuentes sería publicar relleno.',
    );
  }

  const targetRuta = rutaPreguntas(targetLang);
  const existente = await readFile(targetRuta, 'utf8').catch(() => '');
  const preambuloPorDefecto = targetLang === 'en' ? PREAMBULO_EN : PREAMBULO_ES;
  const { preambulo, entradas } = existente
    ? parsearPreguntas(existente)
    : { preambulo: preambuloPorDefecto.trimEnd(), entradas: [] as EntradaPregunta[] };

  if (entradas.length === 0) {
    throw new Error(
      `No hay preguntas en ${targetRuta}.\n` +
        'Escríbelas como encabezados de nivel dos («## ...») y vuelve a ejecutar:\n' +
        'este script redacta respuestas, no decide qué se pregunta.',
    );
  }

  const guardar = (): Promise<void> =>
    writeFile(targetRuta, serializarPreguntas({ preambulo, entradas }));

  let generadas = 0;
  let sinFuente = 0;
  let interrumpido: string | null = null;

  for (const [indice, entrada] of entradas.entries()) {
    if (entrada.respuesta !== '') continue;

    // La pausa va antes y no después para no esperar tras la última.
    if (generadas > 0) await esperar(PAUSA_MS);

    let respuesta: string | null;
    try {
      respuesta = await generar(entrada.pregunta, targetLang);
    } catch (error) {
      interrumpido = error instanceof Error ? error.message : String(error);
      break;
    }

    if (respuesta === null) {
      console.log(`  ·  ${entrada.pregunta}  (sin fragmentos: se deja vacía)`);
      sinFuente += 1;
      continue;
    }

    entrada.respuesta = respuesta;
    generadas += 1;
    console.log(`  ✓  [${indice + 1}/${entradas.length}] ${entrada.pregunta}`);

    await guardar();
  }

  await guardar();

  const yaEscritas = entradas.length - generadas - sinFuente;
  console.log(
    `\n[${targetLang}] ${entradas.length} preguntas: ${generadas} generadas, ` +
      `${yaEscritas} ya escritas (intactas), ${sinFuente} sin fuente.`,
  );
  if (interrumpido !== null) {
    console.log(
      `\nInterrumpido, pero lo generado está guardado:\n  ${interrumpido}\n` +
        `Vuelve a ejecutar \`npm run faq -- --lang ${targetLang}\` para continuar donde se quedó.`,
    );
  }
  if (generadas > 0) {
    console.log(
      `\nLEE ${path.basename(targetRuta)} antes de commitear. Son borradores: el texto\n` +
        'es público y habla de tu trayectoria.',
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error('\n' + (error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  })
  .finally(closePool);
