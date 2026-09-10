'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

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

const SUGERENCIAS = [
  '¿Qué experiencia tiene con PostgreSQL?',
  '¿Qué retos técnicos ha afrontado?',
  '¿Cómo aborda el diseño de una arquitectura?',
  '¿En qué proyectos ha trabajado?',
];

/**
 * Convierte los marcadores [1], [2] del texto en referencias pulsables.
 *
 * Las citas son la diferencia entre un asistente que se puede creer y uno que
 * no: cada afirmación queda ligada al documento del que sale, y el visitante
 * puede ir a comprobarlo. Un marcador que no corresponde a ninguna fuente se
 * deja como texto plano en lugar de romper el renderizado.
 */
function conCitas(texto: string, fuentes: readonly Fuente[]): React.ReactNode[] {
  const porMarcador = new Map(fuentes.map((f) => [f.marker, f]));

  return texto.split(/(\[\d+\])/g).map((parte, indice) => {
    const coincide = /^\[(\d+)\]$/.exec(parte);
    if (!coincide) return <span key={indice}>{parte}</span>;

    const fuente = porMarcador.get(Number(coincide[1]));
    if (!fuente) return <span key={indice}>{parte}</span>;

    return (
      <Link
        key={indice}
        href={`/${fuente.slug}`}
        title={`${fuente.title}${fuente.section ? ` › ${fuente.section}` : ''}`}
        className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-sm bg-accent-soft px-1 align-super text-[10px] font-medium text-accent transition-colors hover:bg-accent hover:text-ground"
      >
        {fuente.marker}
      </Link>
    );
  });
}

export function Asistente() {
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
        body: JSON.stringify({ question: limpia, conversationId: conversacion.current }),
      });

      const datos = (await peticion.json()) as Respuesta & { error?: string };

      if (datos.error) {
        setError(datos.error);
        return;
      }
      setRespuesta(datos);
    } catch {
      setError('No se ha podido contactar con el asistente. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div id="asistente" className="scroll-mt-24">
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          void preguntar(pregunta);
        }}
        className="relative"
      >
        <label htmlFor="pregunta" className="sr-only">
          Pregunta sobre la trayectoria profesional
        </label>

        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>

        <input
          id="pregunta"
          ref={campo}
          value={pregunta}
          onChange={(evento) => setPregunta(evento.target.value)}
          placeholder="Pregunta sobre proyectos, tecnologías o decisiones técnicas…"
          autoComplete="off"
          maxLength={500}
          className="w-full rounded-xl border border-line-strong bg-surface-raised/80 py-3.5 pl-11 pr-24 text-[14px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />

        <button
          type="submit"
          disabled={cargando || !pregunta.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-line-strong px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
        >
          {cargando ? 'Buscando…' : 'Preguntar'}
        </button>
      </form>

      {!respuesta && !cargando && !error ? (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {SUGERENCIAS.map((sugerencia) => (
            <button
              key={sugerencia}
              type="button"
              onClick={() => {
                setPregunta(sugerencia);
                void preguntar(sugerencia);
              }}
              className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-faint transition-colors hover:border-line-strong hover:text-ink-muted"
            >
              {sugerencia}
            </button>
          ))}
        </div>
      ) : null}

      {cargando ? (
        <p className="mt-5 animate-pulse text-center text-[13px] text-ink-faint">
          Buscando en la documentación…
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
            {conCitas(respuesta.answer, respuesta.sources)}
          </div>

          {respuesta.sources.length > 0 ? (
            <ul className="mt-4 space-y-1 border-t border-line pt-3">
              {respuesta.sources.map((fuente) => (
                <li key={fuente.chunkId} className="text-[11px] text-ink-faint">
                  <span className="mr-1.5 text-accent">[{fuente.marker}]</span>
                  <Link href={`/${fuente.slug}`} className="transition-colors hover:text-ink-muted">
                    {fuente.title}
                    {fuente.section ? <span className="text-ink-faint"> › {fuente.section}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 flex items-center gap-3 text-[10px] text-ink-faint">
            <span>{respuesta.cached ? 'respuesta en caché' : `${respuesta.latencyMs} ms`}</span>
            <button
              type="button"
              onClick={() => {
                setRespuesta(null);
                setPregunta('');
                campo.current?.focus();
              }}
              className="transition-colors hover:text-ink-muted"
            >
              preguntar otra cosa
            </button>
          </div>
        </article>
      ) : null}
    </div>
  );
}
