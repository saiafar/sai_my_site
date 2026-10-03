import Link from 'next/link';
import { Etiqueta } from './etiqueta';
import { formatPeriod, type SiteDocument } from '@/lib/site/queries';
import type { Lang } from '@/lib/i18n';
import type { Testimonio } from '@/lib/site/testimonios';

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
      {restantes > 0 ? (
        <Etiqueta destacada>
          <span className="mr-0.5 font-semibold text-accent">+</span>
          {restantes}
        </Etiqueta>
      ) : null}
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
export function TarjetaProyecto({
  documento,
  lang = 'es',
}: {
  documento: SiteDocument;
  lang?: Lang;
}) {
  const elementId = documento.slug.replace(/\//g, '-');
  const periodo = formatPeriod(documento.startsOn, documento.endsOn, lang);
  const rol = typeof documento.metadata['rol'] === 'string' ? documento.metadata['rol'] : null;
  const portada =
    typeof documento.metadata['portada'] === 'string'
      ? (documento.metadata['portada'] as string)
      : typeof documento.metadata['imagen'] === 'string'
        ? (documento.metadata['imagen'] as string)
        : typeof documento.metadata['cover'] === 'string'
          ? (documento.metadata['cover'] as string)
          : null;
  const portadaAlt =
    typeof documento.metadata['portada_alt'] === 'string'
      ? (documento.metadata['portada_alt'] as string)
      : typeof documento.metadata['alt'] === 'string'
        ? (documento.metadata['alt'] as string)
        : documento.title;

  return (
    <Link
      id={elementId}
      href={`/${lang}/${documento.slug}`}
      className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-all duration-200 hover:border-accent/35 hover:shadow-[0_4px_24px_-6px_rgba(225,93,59,0.08)] scroll-mt-24"
    >
      {portada ? (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg border border-line/60 bg-ground/50">
          <img
            src={portada}
            alt={portadaAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {documento.title}
        </h3>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="mt-1 h-3.5 w-3.5 shrink-0 text-accent/75 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        >
          <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {periodo || rol ? (
        <p className="font-heading mt-1 text-[11px] text-ink-faint">
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
 */
export function EntradaExperiencia({
  documento,
  lang = 'es',
}: {
  documento: SiteDocument;
  lang?: Lang;
}) {
  const elementId = documento.slug.replace(/\//g, '-');
  const periodo = formatPeriod(documento.startsOn, documento.endsOn, lang);
  const organizacion =
    typeof documento.metadata['organizacion'] === 'string'
      ? documento.metadata['organizacion']
      : null;

  return (
    <Link
      id={elementId}
      href={`/${lang}/${documento.slug}`}
      className="group grid gap-x-6 gap-y-1 border-b border-line pb-6 last:border-0 sm:grid-cols-[9rem_1fr] scroll-mt-24"
    >
      <p className="pt-0.5 text-[11px] text-ink-faint">{periodo ?? '—'}</p>

      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-[15px] font-semibold text-ink transition-colors group-hover:text-accent">
            {documento.title}
          </h3>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="mt-1 h-3.5 w-3.5 shrink-0 text-accent/75 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
          >
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {organizacion ? (
          <p className="font-heading mt-0.5 text-[12px] text-ink-muted">{organizacion}</p>
        ) : null}
        {documento.summary ? (
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{documento.summary}</p>
        ) : null}
        <Etiquetas tecnologias={documento.technologies} />
      </div>
    </Link>
  );
}

/**
 * Tarjeta de recomendación / testimonio de LinkedIn.
 *
 * Muestra la empresa donde coincidieron, el cargo y especialidad, la relación
 * profesional y fecha, y el texto íntegro en citas, manteniendo el anonimato
 * del autor según lo solicitado.
 */
export function TarjetaTestimonio({ testimonio }: { testimonio: Testimonio }) {
  const parrafos = testimonio.contenido.split('\n\n');

  return (
    <article className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface/60 p-5 transition-all duration-200 hover:border-accent/40 hover:bg-surface hover:shadow-[0_4px_24px_-6px_rgba(225,93,59,0.08)]">
      <div>
        <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3">
          <div>
            <span className="font-heading block text-[14px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
              {testimonio.empresa}
            </span>
            <span className="font-heading mt-0.5 block text-[11px] leading-tight text-accent/90">
              {testimonio.cargo}
            </span>
          </div>

          <div
            title="Recomendación verificada en LinkedIn"
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface-raised/80 px-2 py-0.5 font-mono text-[10px] text-ink-faint"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-3 text-[#0a66c2]"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
            </svg>
            <span>{testimonio.fecha}</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
          <span className="size-1.5 rounded-full bg-accent/70" />
          <span>{testimonio.relacion}</span>
        </div>

        <blockquote className="mt-3.5 space-y-2 text-[13px] leading-relaxed text-ink-muted italic select-text">
          {parrafos.map((p, idx) => (
            <p key={idx}>
              {idx === 0 ? '“' : ''}
              {p}
              {idx === parrafos.length - 1 ? '”' : ''}
            </p>
          ))}
        </blockquote>
      </div>
    </article>
  );
}

