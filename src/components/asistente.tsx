'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { getDictionary, type Lang } from '@/lib/i18n';

interface Fuente {
  marker: number;
  slug: string;
  title: string;
  section: string;
  chunkId: number;
}

interface Respuesta {
  answer: string;
  sources: Fuente[];
  cached: boolean;
  latencyMs: number;
  refused: boolean;
}

/**
 * Convierte los marcadores [1], [2] del texto en referencias pulsables.
 */
function conCitas(texto: string, fuentes: readonly Fuente[], lang: Lang): React.ReactNode[] {
  const porMarcador = new Map(fuentes.map((f) => [f.marker, f]));

  return texto.split(/(\[\d+\])/g).map((parte, indice) => {
    const coincide = /^\[(\d+)\]$/.exec(parte);
    if (!coincide) return <span key={indice}>{parte}</span>;

    const fuente = porMarcador.get(Number(coincide[1]));
    if (!fuente) return <span key={indice}>{parte}</span>;

    return (
      <Link
        key={indice}
        href={`/${lang}/${fuente.slug}`}
        title={`${fuente.title}${fuente.section ? ` › ${fuente.section}` : ''}`}
        className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-sm bg-accent-soft px-1 align-super text-[10px] font-medium text-accent transition-colors hover:bg-accent hover:text-ground"
      >
        {fuente.marker}
      </Link>
    );
  });
}

export function Asistente({ lang = 'es' }: { lang?: Lang }) {
  const dict = getDictionary(lang);
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversacion = useRef<string | undefined>(undefined);
  const campo = useRef<HTMLInputElement>(null);

  async function preguntar(texto: string) {
    const limpia = texto.trim();
    if (!limpia || cargando) return;

    setCargando(true);
    setError(null);
    setRespuesta(null);

    try {
      const peticion = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: limpia, lang, conversationId: conversacion.current }),
      });

      const datos = (await peticion.json()) as Respuesta & { error?: string };

      if (datos.error) {
        setError(datos.error);
        return;
      }
      setRespuesta(datos);
    } catch {
      setError(dict.chat.networkError);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div id="asistente" className="scroll-mt-24">
      <label
        htmlFor="pregunta"
        className="mb-3 block text-center text-[13px] font-medium tracking-tight text-ink-muted sm:text-[14px]"
      >
        {dict.chat.prompt}
      </label>

      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          void preguntar(pregunta);
        }}
        className="group relative"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="pointer-events-none absolute left-4 sm:left-4.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-accent"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>

        <input
          id="pregunta"
          ref={campo}
          value={pregunta}
          onChange={(evento) => setPregunta(evento.target.value)}
          placeholder={dict.chat.placeholder}
          autoComplete="off"
          maxLength={500}
          className="w-full rounded-2xl border border-line-strong bg-surface-raised/90 py-4 sm:py-4.5 pl-12 sm:pl-13 pr-28 sm:pr-32 text-[15px] sm:text-[16px] text-ink placeholder:text-ink-faint shadow-sm transition-all focus:border-accent focus:shadow-[0_0_24px_-4px_rgba(225,93,59,0.18)] focus:outline-none"
        />

        <button
          type="submit"
          disabled={cargando || !pregunta.trim()}
          className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 rounded-xl border border-line-strong bg-surface px-3.5 sm:px-4 py-2 text-xs sm:text-[13px] font-medium text-ink-muted transition-all hover:border-accent hover:bg-accent hover:text-ground disabled:pointer-events-none disabled:opacity-40"
        >
          {cargando ? (lang === 'en' ? 'Searching…' : 'Buscando…') : dict.chat.submit}
        </button>
      </form>

      {!respuesta && !cargando && !error ? (
        <div className="mt-3.5 flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {dict.chat.suggestions.map((sugerencia) => (
            <button
              key={sugerencia}
              type="button"
              onClick={() => {
                setPregunta(sugerencia);
                void preguntar(sugerencia);
              }}
              className="rounded-full border border-line bg-surface/50 px-3 py-1.5 text-[11px] sm:text-[12px] text-ink-faint transition-all duration-200 hover:border-accent/40 hover:bg-surface hover:text-ink"
            >
              {sugerencia}
            </button>
          ))}
        </div>
      ) : null}

      {cargando ? (
        <p className="mt-5 animate-pulse text-center text-[13px] text-ink-faint">
          {dict.chat.loading}
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-lg border border-line bg-surface px-4 py-3 text-[13px] text-ink-muted">
          {error}
        </p>
      ) : null}

      {respuesta ? (
        <article className="mt-5 rounded-xl border border-line bg-surface/70 p-5 text-left">
          <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
            {conCitas(respuesta.answer, respuesta.sources, lang)}
          </div>

          {respuesta.sources.length > 0 ? (
            <ul className="mt-4 space-y-1 border-t border-line pt-3">
              {respuesta.sources.map((fuente) => (
                <li key={fuente.chunkId} className="text-[11px] text-ink-faint">
                  <span className="mr-1.5 text-accent">[{fuente.marker}]</span>
                  <Link href={`/${lang}/${fuente.slug}`} className="transition-colors hover:text-ink-muted">
                    {fuente.title}
                    {fuente.section ? <span className="text-ink-faint"> › {fuente.section}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 flex items-center gap-3 text-[10px] text-ink-faint">
            <span>{respuesta.cached ? (lang === 'en' ? 'cached answer' : 'respuesta en caché') : `${respuesta.latencyMs} ms`}</span>
            <button
              type="button"
              onClick={() => {
                setRespuesta(null);
                setPregunta('');
                campo.current?.focus();
              }}
              className="transition-colors hover:text-ink-muted"
            >
              {dict.chat.clear}
            </button>
          </div>
        </article>
      ) : null}
    </div>
  );
}
