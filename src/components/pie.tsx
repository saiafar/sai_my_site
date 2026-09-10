import Link from 'next/link';

/**
 * Pie.
 *
 * Reproduce el bloque de preguntas frecuentes de la referencia con <details>
 * nativo: sin JavaScript, accesible por teclado de serie y con el contenido
 * presente en el HTML, de modo que un buscador lo indexa aunque esté plegado.
 */
const PREGUNTAS = [
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

export function Pie({ github, ano }: { github?: string; ano: number }) {
  return (
    <footer className="mt-20 border-t border-line pt-10">
      <h2 className="text-[15px] font-medium text-ink">Preguntas frecuentes</h2>

      <div className="mt-4 divide-y divide-line border-y border-line">
        {PREGUNTAS.map((entrada) => (
          <details key={entrada.pregunta} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px] text-ink-muted transition-colors hover:text-ink">
              <span className="text-ink-faint transition-transform group-open:rotate-90">›</span>
              {entrada.pregunta}
            </summary>
            <p className="mt-2 pl-4 text-[13px] leading-relaxed text-ink-muted">
              {entrada.respuesta}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pb-12 text-[11px] text-ink-faint">
        <p>© {ano} Rafaias Villán</p>
        <div className="flex gap-4">
          <Link href="/#asistente" className="transition-colors hover:text-ink-muted">
            Preguntar al asistente
          </Link>
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-ink-muted"
            >
              Código del sitio
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
