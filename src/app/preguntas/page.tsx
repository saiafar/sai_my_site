import type { Metadata } from 'next';
import Link from 'next/link';
import { marked } from 'marked';
import { BarraSuperior } from '@/components/barra-superior';
import { Pie } from '@/components/pie';
import { Telemetria } from '@/components/telemetria';
import { DatosEstructurados } from '@/components/datos-estructurados';
import * as jsonLd from '@/lib/site/datos-estructurados';
import { leerPreguntas } from '@/lib/site/preguntas';
import { ENLACES } from '@/lib/site/enlaces';

/**
 * Preguntas frecuentes.
 *
 * Existe por los buscadores con IA. El corpus está escrito para responder
 * preguntas en lenguaje natural, pero solo se llega a él por POST /api/chat, y
 * ningún rastreador hace eso: para GPTBot o ClaudeBot, ese contenido no existe.
 * Aquí las mismas respuestas están en HTML servido, que es lo único que pueden
 * leer y citar.
 *
 * El texto no se genera al vuelo: vive en contenido/preguntas.md, generado con
 * `npm run faq` y revisado a mano antes de commitearse. Una página que un motor
 * de respuestas va a citar como la voz de alguien no puede contener texto que
 * esa persona no haya leído.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes — Rafaías Villán',
  description:
    'Respuestas sobre experiencia, tecnologías y proyectos, con el documento que respalda cada afirmación.',
  openGraph: {
    type: 'article',
    url: '/preguntas',
    title: 'Preguntas frecuentes — Rafaías Villán',
    description:
      'Respuestas sobre experiencia, tecnologías y proyectos, con el documento que respalda cada afirmación.',
  },
};

export default async function Preguntas() {
  const { preambulo, entradas } = await leerPreguntas();

  // El Markdown procede del repositorio, revisado y versionado: es contenido
  // propio, no una entrada de usuario, así que no hay inyección que sanear.
  const intro = await marked.parse(preambulo.replace(/^#\s+.*\n?/, ''));
  const respuestas = await Promise.all(
    entradas.map(async (entrada) => ({
      pregunta: entrada.pregunta,
      html: await marked.parse(entrada.respuesta),
    })),
  );

  return (
    <>
      <BarraSuperior github={ENLACES.github} linkedin={ENLACES.linkedin} />

      <main className="mx-auto max-w-lectura px-6 pb-24 pt-12">
        <Link
          href="/"
          className="text-[11px] text-ink-faint transition-colors hover:text-ink-muted"
        >
          ← Volver
        </Link>

        <header className="mt-6 border-b border-line pb-6">
          <h1 className="font-display text-4xl leading-tight tracking-tight text-ink">
            Preguntas frecuentes
          </h1>
          <div
            className="prose-sitio mt-3 max-w-2xl"
            dangerouslySetInnerHTML={{ __html: intro }}
          />
        </header>

        {respuestas.length === 0 ? (
          <p className="mt-8 text-[13px] text-ink-faint">
            Todavía no hay respuestas publicadas. Se generan con{' '}
            <code>npm run faq</code> y se revisan antes de commitearlas.
          </p>
        ) : (
          <div className="mt-10 space-y-10">
            {respuestas.map((entrada) => (
              <section key={entrada.pregunta}>
                <h2 className="font-display text-2xl leading-snug tracking-tight text-ink">
                  {entrada.pregunta}
                </h2>
                <div
                  className="prose-sitio mt-3 max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: entrada.html }}
                />
              </section>
            ))}
          </div>
        )}

        <Pie github={ENLACES.github} linkedin={ENLACES.linkedin} ano={new Date().getFullYear()} />
      </main>

      <Telemetria />

      {respuestas.length > 0 ? (
        <DatosEstructurados
          datos={jsonLd.preguntasFrecuentes(
            respuestas.map((e) => ({ pregunta: e.pregunta, respuestaHtml: e.html })),
          )}
        />
      ) : null}
    </>
  );
}
