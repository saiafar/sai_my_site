'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { MapaRag, type FaseRag, type SeccionCorpus } from './mapa-rag';
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

/** Convierte los marcadores [1], [2] del texto en referencias pulsables. */
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
        className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-lila px-1.5 align-super font-mono text-[11px] font-bold text-tinta transition-colors hover:bg-naranja"
      >
        {fuente.marker}
      </Link>
    );
  });
}

/**
 * El asistente, con el mapa del corpus detrás.
 *
 * Es una sola pieza y no dos porque la demostración es que la caja y el mapa
 * están conectados: al preguntar, el recorrido sale del borde de la caja, cruza
 * el índice y vuelve. Separarlos en dos componentes obligaría a sincronizar su
 * estado por fuera para conseguir exactamente lo mismo.
 *
 * Las tres líneas de estado no son decorado: son las tres cosas que el servidor
 * hace mientras tanto —vectorizar la pregunta, fusionar los dos rankings y
 * redactar con lo recuperado—, y se van mostrando por tiempo porque la petición
 * es una sola y no informa de su progreso. Lo que no se inventa es el final: el
 * número de fuentes y los milisegundos salen de la respuesta.
 */
export function Asistente({
  secciones,
  lang = 'es',
}: {
  secciones: readonly SeccionCorpus[];
  lang?: Lang;
}) {
  const dict = getDictionary(lang);
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [fase, setFase] = useState<FaseRag>('reposo');
  const [estado, setEstado] = useState(dict.chat.idle);
  const [error, setError] = useState<string | null>(null);
  const conversacion = useRef<string | undefined>(undefined);
  const campo = useRef<HTMLInputElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const relojes = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => relojes.current.forEach(clearTimeout), []);

  async function preguntar(texto: string) {
    const limpia = texto.trim();
    if (!limpia || fase === 'buscando') return;

    relojes.current.forEach(clearTimeout);
    setFase('buscando');
    setError(null);
    setRespuesta(null);
    setEstado(dict.chat.steps.vector);
    relojes.current = [
      setTimeout(() => setEstado(dict.chat.steps.search), 900),
      setTimeout(() => setEstado(dict.chat.steps.write), 1800),
    ];

    try {
      const peticion = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: limpia, lang, conversationId: conversacion.current }),
      });

      const datos = (await peticion.json()) as Respuesta & { error?: string };
      relojes.current.forEach(clearTimeout);

      if (datos.error) {
        setError(datos.error);
        setFase('reposo');
        setEstado(dict.chat.idle);
        return;
      }

      setRespuesta(datos);
      setFase('listo');
      setEstado(
        dict.chat.done
          .replace('{n}', String(datos.sources.length))
          .replace('{ms}', String(datos.latencyMs)),
      );
    } catch {
      relojes.current.forEach(clearTimeout);
      setError(dict.chat.networkError);
      setFase('reposo');
      setEstado(dict.chat.idle);
    }
  }

  const colorEstado =
    fase === 'listo' ? 'text-verde' : fase === 'buscando' ? 'text-naranja-claro' : 'text-ink-inverso-faint';

  return (
    <>
      <MapaRag
        secciones={secciones}
        fase={fase}
        objetivos={respuesta?.sources.map((fuente) => fuente.title) ?? []}
        anclaRef={caja}
      />

      {/* El contenido no captura el ratón salvo donde hay algo que pulsar: así
          el mapa de detrás se puede seleccionar y no queda sepultado. */}
      <div className="pointer-events-none relative flex min-h-[720px] items-center">
        <div
          id="asistente"
          className="pointer-events-auto flex w-full max-w-[36rem] scroll-mt-6 flex-col gap-5 rounded-bloque border border-crema/12 bg-tinta/72 p-7 backdrop-blur-md sm:p-10"
        >
          <span className="inline-flex items-center gap-2.5 self-start font-mono text-[13px] text-lila">
            <span aria-hidden className="size-2 rounded-full bg-lila" />
            {dict.sections.assistant.kicker}
          </span>

          <h2 className="text-[clamp(36px,5.6vw,80px)] font-extrabold leading-[0.86] tracking-[-0.05em]">
            {dict.sections.assistant.title}
            <span className="text-naranja">.</span>
          </h2>

          <p className="text-[17px] leading-relaxed text-ink-inverso-muted sm:text-[18px]">
            {dict.sections.assistant.desc}
          </p>

          <form
            onSubmit={(evento) => {
              evento.preventDefault();
              void preguntar(pregunta);
            }}
            className="flex flex-col gap-5"
          >
            <div>
              <label htmlFor="pregunta" className="font-mono text-[13px] text-ink-inverso-faint">
                {dict.chat.prompt}
              </label>

              <div ref={caja} className="mt-3 flex flex-wrap gap-2">
                <input
                  id="pregunta"
                  ref={campo}
                  value={pregunta}
                  onChange={(evento) => setPregunta(evento.target.value)}
                  placeholder={dict.chat.placeholder}
                  autoComplete="off"
                  maxLength={500}
                  className="h-14 min-w-0 flex-[1_1_15rem] rounded-[14px] border-[1.5px] border-noche-line-strong bg-noche-raised px-4.5 text-[17px] text-ink-inverso placeholder:text-ink-inverso-faint focus:border-naranja focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={fase === 'buscando' || !pregunta.trim()}
                  className="h-14 shrink-0 cursor-pointer rounded-[14px] bg-naranja px-6 text-[17px] font-extrabold text-tinta transition-colors hover:bg-naranja-honda hover:text-crema disabled:pointer-events-none disabled:opacity-40"
                >
                  {fase === 'buscando' ? dict.chat.searching : dict.chat.submit}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {dict.chat.suggestions.slice(0, 3).map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => {
                    setPregunta(sugerencia);
                    void preguntar(sugerencia);
                  }}
                  className="min-h-10 cursor-pointer rounded-full border border-noche-line-strong px-3.5 font-mono text-[13px] text-ink-inverso-muted transition-colors hover:border-naranja hover:text-ink-inverso"
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          </form>

          <p aria-live="polite" className={`min-h-5 font-mono text-[13px] ${colorEstado}`}>
            {error ?? estado}
          </p>

          {respuesta ? (
            <article className="flex flex-col gap-3.5 rounded-[18px] bg-crema p-5.5 text-tinta">
              <div className="whitespace-pre-wrap text-[16px] leading-relaxed sm:text-[17px]">
                {conCitas(respuesta.answer, respuesta.sources, lang)}
              </div>

              {respuesta.sources.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {respuesta.sources.map((fuente) => (
                    <li key={fuente.chunkId}>
                      <Link
                        href={`/${lang}/${fuente.slug}`}
                        className="inline-block rounded-lg bg-lila px-2.5 py-1.5 font-mono text-[12px] text-tinta transition-colors hover:bg-naranja"
                      >
                        {fuente.title}
                        {fuente.section ? ` › ${fuente.section}` : ''}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex items-center gap-4 font-mono text-[11px] text-ink-faint">
                <span>
                  {respuesta.cached
                    ? lang === 'en'
                      ? 'cached answer'
                      : 'respuesta en caché'
                    : `${respuesta.latencyMs} ms`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRespuesta(null);
                    setPregunta('');
                    setFase('reposo');
                    setEstado(dict.chat.idle);
                    campo.current?.focus();
                  }}
                  className="cursor-pointer hover:text-ink"
                >
                  {dict.chat.clear}
                </button>
              </div>
            </article>
          ) : null}
        </div>
      </div>

      {/* Leyenda del mapa. Solo en ancho: en móvil el grafo queda detrás del
          panel y explicar sus símbolos no ayudaría a nadie. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-8 hidden flex-wrap gap-4.5 font-mono text-[12px] text-ink-inverso-faint lg:flex"
      >
        <span>
          <span className="mr-1.5 inline-block size-2.5 rounded-full bg-crema" />
          {dict.sections.assistant.mapSectionsLegend}
        </span>
        <span>
          <span className="mr-1.5 inline-block size-2 rounded-full bg-lila" />
          {dict.sections.assistant.mapDocumentsLegend}
        </span>
        <span>
          <span className="mr-1.5 inline-block size-1 rounded-full bg-crema align-[2px]" />
          {dict.sections.assistant.mapFragmentsLegend}
        </span>
        <span>
          <span className="mr-1.5 inline-block h-0.5 w-3.5 bg-naranja align-[3px]" />
          {dict.sections.assistant.mapPath}
        </span>
      </div>
    </>
  );
}
