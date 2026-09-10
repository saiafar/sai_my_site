import Link from 'next/link';
import { Etiqueta } from './etiqueta';
import { formatPeriod, type SiteDocument } from '@/lib/site/queries';

/** Cuántas etiquetas caben antes de que la fila deje de leerse. */
const MAX_ETIQUETAS = 6;

function Etiquetas({ tecnologias }: { tecnologias: SiteDocument['technologies'] }) {
  if (tecnologias.length === 0) return null;
  const visibles = tecnologias.slice(0, MAX_ETIQUETAS);
  const restantes = tecnologias.length - visibles.length;

  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {visibles.map((tecnologia) => (
        <Etiqueta key={tecnologia.slug}>{tecnologia.name}</Etiqueta>
      ))}
      {restantes > 0 ? <Etiqueta>+{restantes}</Etiqueta> : null}
    </div>
  );
}

/**
 * Tarjeta de proyecto.
 *
 * Más grande que las de la referencia, y a dos columnas en lugar de tres. Allí
 * la densidad funciona porque hay 179 elementos y la abundancia es el mensaje;
 * con ocho proyectos la misma rejilla no se lee como densa sino como escasa.
 * El resumen tiene sitio para una frase completa, que es lo que convierte la
 * tarjeta en algo informativo y no en un simple enlace con título.
 */
export function TarjetaProyecto({ documento }: { documento: SiteDocument }) {
  const periodo = formatPeriod(documento.startsOn, documento.endsOn);
  const rol = typeof documento.metadata['rol'] === 'string' ? documento.metadata['rol'] : null;

  return (
    <Link
      href={`/${documento.slug}`}
      className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
          {documento.title}
        </h3>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="mt-1 h-3 w-3 shrink-0 text-ink-faint transition-colors group-hover:text-accent"
        >
          <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {periodo || rol ? (
        <p className="mt-1 text-[11px] text-ink-faint">
          {[periodo, rol].filter(Boolean).join(' · ')}
        </p>
      ) : null}

      {documento.summary ? (
        <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">{documento.summary}</p>
      ) : null}

      <div className="mt-auto">
        <Etiquetas tecnologias={documento.technologies} />
      </div>
    </Link>
  );
}

/**
 * Entrada de experiencia.
 *
 * En lista y no en rejilla: una trayectoria se lee en orden cronológico, y una
 * rejilla obliga a reconstruir mentalmente ese orden en zigzag. El periodo va
 * en una columna propia para que la secuencia se pueda recorrer de un vistazo
 * por el margen izquierdo.
 */
export function EntradaExperiencia({ documento }: { documento: SiteDocument }) {
  const periodo = formatPeriod(documento.startsOn, documento.endsOn);
  const organizacion =
    typeof documento.metadata['organizacion'] === 'string'
      ? documento.metadata['organizacion']
      : null;

  return (
    <article className="grid gap-x-6 gap-y-1 border-b border-line pb-6 last:border-0 sm:grid-cols-[9rem_1fr]">
      <p className="pt-0.5 text-[11px] text-ink-faint">{periodo ?? '—'}</p>

      <div>
        <h3 className="text-[15px] font-medium text-ink">{documento.title}</h3>
        {organizacion ? (
          <p className="mt-0.5 text-[12px] text-ink-muted">{organizacion}</p>
        ) : null}
        {documento.summary ? (
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{documento.summary}</p>
        ) : null}
        <Etiquetas tecnologias={documento.technologies} />
      </div>
    </article>
  );
}
