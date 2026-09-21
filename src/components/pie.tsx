import Link from 'next/link';
import type { Lang } from '@/lib/i18n';

/**
 * Pie.
 *
 * Reproduce el bloque de preguntas frecuentes de la referencia con <details>
 * nativo: sin JavaScript, accesible por teclado de serie y con el contenido
 * presente en el HTML, de modo que un buscador lo indexa aunque esté plegado.
 */

const PREGUNTAS_ES = [
  {
    pregunta: '¿De dónde salen las respuestas del asistente?',
    respuesta:
      'De una base de conocimiento propia escrita en Markdown, troceada por secciones y convertida en vectores que se almacenan en PostgreSQL con pgvector. Cada respuesta cita los fragmentos concretos en los que se apoya, y si la documentación no cubre la pregunta el asistente lo dice en lugar de improvisar.',
  },
  {
    pregunta: '¿Puede inventarse cosas sobre mi experiencia?',
    respuesta:
      'El modelo solo recibe los fragmentos recuperados y tiene prohibido completar con conocimiento general. Cada afirmación va marcada con la fuente que la respalda, así que cualquier dato es verificable pulsando la cita.',
  },
  {
    pregunta: '¿Qué tecnología hay detrás?',
    respuesta:
      'Next.js sobre Node, PostgreSQL 17 con pgvector para la búsqueda híbrida (vectorial y full-text fusionadas con Reciprocal Rank Fusion), embeddings generados en local con ONNX y un proveedor externo solo para redactar la respuesta. Todo en contenedores Docker sobre un servidor propio.',
  },
];

const PREGUNTAS_EN = [
  {
    pregunta: 'Where do the assistant’s answers come from?',
    respuesta:
      'From a curated Markdown knowledge base, split into semantic sections and vectorized in PostgreSQL with pgvector. Each response cites the exact chunks it relies upon, and if the documentation does not cover the question, the assistant admits it instead of improvising.',
  },
  {
    pregunta: 'Can it hallucinate details about experience?',
    respuesta:
      'The model only receives retrieved chunks and is explicitly forbidden from using general knowledge. Every statement is flagged with the backing source marker, making every detail verifiable by clicking the citation.',
  },
  {
    pregunta: 'What technology powers this website?',
    respuesta:
      'Next.js on Node, PostgreSQL 17 with pgvector for hybrid search (vector + full-text combined via Reciprocal Rank Fusion), quantized local embeddings via ONNX, and Google Gemini strictly for answer generation. Everything runs in Docker on a self-hosted server.',
  },
];

export function Pie({
  github,
  linkedin,
  ano,
  lang = 'es',
}: {
  github?: string;
  linkedin?: string;
  ano: number;
  lang?: Lang;
}) {
  const preguntas = lang === 'en' ? PREGUNTAS_EN : PREGUNTAS_ES;

  return (
    <footer className="mt-20 border-t border-line pt-10">
      <h2 className="text-[15px] font-medium text-ink">
        {lang === 'en' ? 'About this website' : 'Sobre este sitio'}
      </h2>

      <div className="mt-4 divide-y divide-line border-y border-line">
        {preguntas.map((entrada) => (
          <details key={entrada.pregunta} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center gap-2.5 text-[13px] text-ink-muted transition-colors hover:text-ink">
              <span className="font-mono text-[14px] leading-none text-accent transition-transform duration-200 group-open:rotate-45 select-none">
                +
              </span>
              {entrada.pregunta}
            </summary>
            <p className="mt-2 pl-5 text-[13px] leading-relaxed text-ink-muted">
              {entrada.respuesta}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pb-12 text-[11px] text-ink-faint">
        <p>© {ano} Rafaías Villán</p>
        <div className="flex gap-4">
          <Link href={`/${lang}/preguntas`} className="transition-colors hover:text-ink-muted">
            {lang === 'en' ? 'Frequently asked questions' : 'Preguntas frecuentes'}
          </Link>
          <Link href={`/${lang}#asistente`} className="transition-colors hover:text-ink-muted">
            {lang === 'en' ? 'Ask the assistant' : 'Preguntar al asistente'}
          </Link>
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-ink-muted"
            >
              LinkedIn
            </a>
          ) : null}

          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-ink-muted"
            >
              {lang === 'en' ? 'Source code' : 'Código del sitio'}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
