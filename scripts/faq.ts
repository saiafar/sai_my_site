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
import { buildContext, buildUserMessage, SYSTEM_PROMPT } from '../src/lib/rag/prompt.ts';
import { retrieve, type RetrievedChunk } from '../src/lib/rag/retrieve.ts';
import { closePool } from '../src/lib/db/index.ts';
import {
  parsearPreguntas,
  serializarPreguntas,
  RUTA_PREGUNTAS,
  type EntradaPregunta,
} from '../src/lib/site/preguntas.ts';


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
 *
 * El prompt del asistente manda hablar de Rafaías en tercera persona, y para el
 * asistente es lo correcto: es un sistema hablando de alguien. Pero estas
 * respuestas se publican en su propia web, bajo su nombre, y ahí la tercera
 * persona suena a currículum escrito por otro.
 *
 * También se desactivan las coletillas sobre disponibilidad y expectativas
 * salariales. En una conversación tienen sentido —quien pregunta puede estar
 * tanteando una contratación—, pero apareciendo al final de una respuesta sobre
 * sectores, sin que nadie haya preguntado, suenan a la defensiva.
 *
 * Va como añadido y no como prompt aparte para que las reglas que de verdad
 * importan —no inventar, citar cada afirmación, admitir los huecos— sigan
 * siendo exactamente las mismas y en un único sitio.
 */
const VOZ_DE_LA_PAGINA = `

AJUSTE PARA ESTA PÁGINA
Estas respuestas NO las lee un visitante en un chat: se publican en la página de preguntas frecuentes del propio sitio de ${env.siteOwner}, bajo su nombre y escritas por él.

Por tanto, y sustituyendo a la regla de tercera persona: escribe en PRIMERA PERSONA del singular —«trabajé», «diseñé», «llevo diecinueve años»—. No escribas su nombre para referirte a ti mismo ni empieces las respuestas nombrándolo.

No añadas avisos sobre disponibilidad, expectativas salariales ni datos de contacto a menos que la pregunta trate exactamente de eso: la página ya tiene su propio formulario de contacto.

El resto de reglas siguen vigentes sin excepción, en especial no afirmar nada que no esté en los fragmentos y citar cada afirmación con su marcador.`;

const PREAMBULO = `# Preguntas frecuentes

Las respuestas salen de la misma base de conocimiento que consulta el asistente
del sitio, y cada afirmación enlaza al documento que la respalda. Si lo que
buscas no está aquí, pregúntaselo directamente al asistente en la portada.
`;

/**
 * Genera una respuesta componiendo la recuperación y la generación del
 * asistente, sin pasar por answerQuestion().
 *
 * Esa función hace además tres cosas que aquí estorban: consume el límite por
 * visitante, escribe en response_cache y crea filas en conversations/messages.
 * Un generador de contenido no debe aparecer en el historial de consultas del
 * panel como si fuera una visita, ni gastar la cuota de alguien real.
 */
async function generar(pregunta: string): Promise<string | null> {
  // Diez preguntas amplias en lugar de veintiséis estrechas: cada una abarca
  // ahora varios proyectos y etapas, así que se recuperan más fragmentos. El
  // tope de contexto de buildContext sigue decidiendo cuántos caben.
  const chunks = await retrieve(pregunta, { matchCount: 12 });
  const contexto = buildContext(chunks);

  if (contexto.used.length === 0) return null;

  const { text } = await getLLMProvider().generate({
    system: SYSTEM_PROMPT + VOZ_DE_LA_PAGINA,
    user: buildUserMessage(pregunta, contexto),
    maxOutputTokens: 1024,
  });

  return enlazarCitas(text.trim(), contexto.used);
}

/**
 * Convierte los marcadores de cita en enlaces a la ficha que respalda la frase.
 *
 * Es lo que hace la página útil para quien la lee y para quien la rastrea:
 * enlaces internos y una forma de comprobar cada afirmación, en lugar de un
 * número suelto sin destino.
 *
 * Se procesa el corchete entero y no cada número por separado porque el prompt
 * pide citar todas las fuentes de una frase, y el modelo las agrupa: escribe
 * «[1, 4]», no «[1][4]». Una sustitución de «[1]» por su enlace deja intactos
 * los agrupados, que era el veinte por ciento de las citas.
 */
function enlazarCitas(texto: string, usados: readonly RetrievedChunk[]): string {
  // El lookahead evita tocar algo que ya sea un enlace Markdown: sin él, un
  // segundo pase convertiría «[1](/a)» en «[1](/a)(/a)».
  return texto.replace(/\[([\d\s,;yY]+)\](?!\()/g, (completo, dentro: string) => {
    const numeros = (dentro.match(/\d+/g) ?? [])
      .map(Number)
      .filter((n) => n >= 1 && n <= usados.length);

    // Un marcador fuera de rango es una alucinación del modelo sobre sus
    // propias fuentes: se deja tal cual para que salte a la vista al revisar,
    // en lugar de enlazar a un documento que no dice eso.
    if (numeros.length === 0) return completo;

    return numeros.map((n) => `[${n}](/${usados[n - 1]!.slug})`).join(' ');
  });
}

async function main(): Promise<void> {
  if (!providerIsReal()) {
    throw new Error(
      'No hay GEMINI_API_KEY: el proveedor simulado devuelve texto de muestra.\n' +
        'Escribir eso en la página de preguntas frecuentes sería publicar relleno.',
    );
  }

  const existente = await readFile(RUTA_PREGUNTAS, 'utf8').catch(() => '');
  const { preambulo, entradas } = existente
    ? parsearPreguntas(existente)
    : { preambulo: PREAMBULO.trimEnd(), entradas: [] as EntradaPregunta[] };

  if (entradas.length === 0) {
    throw new Error(
      `No hay preguntas en ${RUTA_PREGUNTAS}.\n` +
        'Escríbelas como encabezados de nivel dos («## ¿…?») y vuelve a ejecutar:\n' +
        'este script redacta respuestas, no decide qué se pregunta.',
    );
  }

  const guardar = (): Promise<void> =>
    writeFile(RUTA_PREGUNTAS, serializarPreguntas({ preambulo, entradas }));

  let generadas = 0;
  let sinFuente = 0;
  let interrumpido: string | null = null;

  for (const [indice, entrada] of entradas.entries()) {
    if (entrada.respuesta !== '') continue;

    // La pausa va antes y no después para no esperar tras la última.
    if (generadas > 0) await esperar(PAUSA_MS);

    let respuesta: string | null;
    try {
      respuesta = await generar(entrada.pregunta);
    } catch (error) {
      // Se corta el recorrido pero se conserva lo generado hasta aquí: cada
      // respuesta ha costado una llamada de pago, y perderlas por un fallo en
      // la siguiente sería tirar ese trabajo. Volver a ejecutar el script
      // retoma donde se quedó, porque solo rellena las que están vacías.
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

    // Se guarda en cada vuelta, no al final. El fichero son unos kilobytes y
    // esto convierte cualquier interrupción —un límite de cuota, un Ctrl-C— en
    // una pausa en lugar de en una pérdida.
    await guardar();
  }

  await guardar();

  const yaEscritas = entradas.length - generadas - sinFuente;
  console.log(
    `\n${entradas.length} preguntas: ${generadas} generadas, ` +
      `${yaEscritas} ya escritas (intactas), ${sinFuente} sin fuente.`,
  );
  if (interrumpido !== null) {
    console.log(
      `\nInterrumpido, pero lo generado está guardado:\n  ${interrumpido}\n` +
        'Vuelve a ejecutar `npm run faq` para continuar donde se quedó.',
    );
  }
  if (generadas > 0) {
    console.log(
      '\nLEE contenido/preguntas.md antes de commitear. Son borradores: el texto\n' +
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
