import Link from 'next/link';
import { Etiqueta } from './etiqueta';
import { Onda } from './onda';
import { ConversacionLucIA } from './conversacion-luc-ia';
import { formatPeriod, shortName, type SiteDocument } from '@/lib/site/queries';
import { getDictionary, type Lang } from '@/lib/i18n';
import { TONOS, type Tono } from '@/lib/site/tonos';
import { getGuionConversacion } from '@/lib/site/conversacion';
import type { Testimonio } from '@/lib/site/testimonios';

/** Cuántas etiquetas caben antes de que la fila deje de leerse. */
const MAX_ETIQUETAS = 5;

function texto(documento: SiteDocument, clave: string): string | null {
  const valor = documento.metadata[clave];
  return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
}

function Etiquetas({
  tecnologias,
  tono,
}: {
  tecnologias: SiteDocument['technologies'];
  tono: Tono;
}) {
  if (tecnologias.length === 0) return null;
  const visibles = tecnologias.slice(0, MAX_ETIQUETAS);
  const restantes = tecnologias.length - visibles.length;

  return (
    <div className="flex flex-wrap gap-2">
      {visibles.map((tecnologia) => (
        <Etiqueta key={tecnologia.slug} tono={tono}>
          {tecnologia.name}
        </Etiqueta>
      ))}
      {restantes > 0 ? (
        <Etiqueta tono={tono} destacada>
          +{restantes}
        </Etiqueta>
      ) : null}
    </div>
  );
}

/**
 * Ficha del proyecto, para cuando todavía no hay imagen.
 *
 * La mitad derecha de cada banda es una captura o una pieza gráfica. Mientras no
 * exista —hoy no hay ninguna, y las de un proyecto no se pueden publicar porque
 * llevan datos de otros empleados— el hueco no se deja vacío ni se rellena con
 * una imagen inventada: se muestran los datos que la ficha sí tiene. Es una
 * pieza de diseño hecha con información verdadera, y el día que haya captura se
 * sustituye sin tocar la banda.
 */
function FichaVisual({ documento, lang }: { documento: SiteDocument; lang: Lang }) {
  const dict = getDictionary(lang);
  const filas = [
    { clave: dict.detail.role, valor: texto(documento, 'rol') },
    { clave: dict.detail.organization, valor: texto(documento, 'organizacion') },
    { clave: dict.detail.period, valor: formatPeriod(documento.startsOn, documento.endsOn, lang) },
  ].filter((fila): fila is { clave: string; valor: string } => Boolean(fila.valor));

  return (
    <div className="rotate-[1.5deg]">
      <div className="overflow-hidden rounded-tarjeta bg-crema text-tinta shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 border-b border-line bg-crema-honda px-5 py-4">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full bg-naranja font-extrabold text-tinta"
          >
            {documento.title.slice(0, 1)}
          </span>
          <span className="truncate text-[15px] font-semibold">{documento.title}</span>
          <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-faint">
            {documento.slug}
          </span>
        </div>

        <dl className="grid gap-x-6 gap-y-5 px-5 py-6 sm:grid-cols-2">
          {filas.map((fila) => (
            <div key={fila.clave}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                {fila.clave}
              </dt>
              <dd className="mt-1.5 text-[16px] font-semibold leading-snug">{fila.valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/**
 * El lado visual de una banda.
 *
 * Con una sola imagen, basta girarla un par de grados: el giro es lo que evita
 * que una captura rectangular dentro de una banda rectangular parezca un hueco
 * de maqueta. Con dos, la segunda se monta sobre la primera girada al contrario
 * y con un filo grueso del color de la tinta, que es lo que la separa de la de
 * abajo sin necesidad de sombra.
 */
function VisualProyecto({ documento, portada }: { documento: SiteDocument; portada: string }) {
  const segunda = texto(documento, 'portada_2');
  const alt = texto(documento, 'portada_alt') ?? documento.title;

  if (!segunda) {
    return (
      <img
        src={portada}
        alt={alt}
        loading="lazy"
        className="block aspect-4/3 w-full -rotate-2 rounded-tarjeta object-cover shadow-[0_30px_60px_rgba(20,16,18,0.35)]"
      />
    );
  }

  return (
    <div className="relative pb-8">
      <img
        src={portada}
        alt={alt}
        loading="lazy"
        className="block aspect-4/3 w-[78%] -rotate-3 rounded-tarjeta object-cover shadow-[0_30px_60px_rgba(20,16,18,0.35)]"
      />
      <img
        src={segunda}
        alt={texto(documento, 'portada_2_alt') ?? ''}
        loading="lazy"
        className="absolute -bottom-1 right-0 block aspect-4/3 w-[46%] rotate-[4deg] rounded-2xl border-[6px] border-tinta object-cover shadow-[0_30px_60px_rgba(20,16,18,0.35)]"
      />
    </div>
  );
}

/**
 * Banda de proyecto destacado.
 *
 * Cada proyecto destacado ocupa una franja entera de la página con su propio
 * color, el nombre a cuerpo de titular y el detalle al lado. No es una tarjeta
 * más grande: es la diferencia entre una lista de proyectos y cuatro proyectos
 * que se leen uno detrás de otro. Los demás quedan debajo, en rejilla.
 *
 * El lado del visual se alterna con el índice para que dos bandas seguidas no
 * tengan la misma composición.
 */
export function BandaProyecto({
  documento,
  indice,
  tono,
  onda,
  lang = 'es',
}: {
  documento: SiteDocument;
  /** Empezando en 0: se pinta como 01, 02, 03… */
  indice: number;
  tono: Tono;
  onda?: { hacia: Tono; forma?: number };
  lang?: Lang;
}) {
  const dict = getDictionary(lang);
  const t = TONOS[tono];
  const periodo = formatPeriod(documento.startsOn, documento.endsOn, lang);
  const dominio = texto(documento, 'dominio') ?? texto(documento, 'organizacion');
  const portada = texto(documento, 'portada') ?? texto(documento, 'imagen');
  const visualPrimero = indice % 2 === 1;

  const kicker = [String(indice + 1).padStart(2, '0'), periodo, dominio]
    .filter(Boolean)
    .join(' · ');

  return (
    <section data-aparecer className={t.fondo}>
      <div
        className={`mx-auto flex max-w-ancho flex-wrap items-center gap-12 px-6 py-24 sm:gap-16 sm:px-8 sm:py-32 ${
          visualPrimero ? 'flex-wrap-reverse' : ''
        }`}
      >
        <div className="flex min-w-0 flex-[1_1_22rem] flex-col gap-5">
          <p className={`font-mono text-[13px] ${t.acento}`}>{kicker}</p>

          <h3 className="text-[clamp(32px,6.4vw,96px)] font-extrabold leading-[0.85] tracking-[-0.05em]">
            {shortName(documento)}
          </h3>

          {documento.summary ? (
            <p className={`max-w-xl text-[17px] leading-relaxed sm:text-[21px] ${t.apagado}`}>
              {documento.summary}
            </p>
          ) : null}

          <Etiquetas tecnologias={documento.technologies} tono={tono} />

          <Link
            href={`/${lang}/${documento.slug}`}
            className={`font-mono text-[14px] hover:underline sm:text-[15px] ${t.acento}`}
          >
            {dict.sections.work.cardCta}
          </Link>
        </div>

        <div className="min-w-0 flex-[1_1_26rem]">
          {/* Qué se enseña al lado: la captura si la hay, la conversación
              recreada si el documento la pide, y si no, su propia ficha. */}
          {portada ? (
            <VisualProyecto documento={documento} portada={portada} />
          ) : texto(documento, 'visual') === 'conversacion' ? (
            <ConversacionLucIA guion={getGuionConversacion(lang)} />
          ) : (
            <FichaVisual documento={documento} lang={lang} />
          )}
        </div>
      </div>

      {onda ? <Onda hacia={onda.hacia} forma={onda.forma ?? 0} /> : null}
    </section>
  );
}

/**
 * Tarjeta breve: los proyectos que no tienen banda propia.
 *
 * Van en tinta sobre la banda crema. Es lo que las separa de las cuatro
 * destacadas sin hacerlas más pequeñas: las bandas son del color de la página y
 * estas son bloques dentro de ella.
 */
export function TarjetaProyectoBreve({
  documento,
  lang = 'es',
}: {
  documento: SiteDocument;
  lang?: Lang;
}) {
  // Dos tecnologías separadas por una barra, como una ruta: dice de qué tipo es
  // el proyecto en menos sitio que una frase.
  const etiqueta = documento.technologies
    .slice(0, 2)
    .map((tecnologia) => tecnologia.slug)
    .join('/');

  return (
    <Link
      href={`/${lang}/${documento.slug}`}
      className="group flex flex-col gap-3.5 rounded-xl bg-noche p-5.5 text-ink-inverso transition-colors hover:bg-noche-raised"
    >
      {etiqueta ? <span className="font-mono text-[12px] text-lila">{etiqueta}</span> : null}

      <strong className="text-[22px] font-extrabold leading-tight tracking-[-0.02em] group-hover:underline">
        {shortName(documento)}
      </strong>

      {documento.summary ? (
        <span className="text-[15px] leading-relaxed text-ink-inverso-muted">
          {documento.summary}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Etapa de la trayectoria.
 *
 * Los años a la izquierda, en monoespaciado, y el nombre a cuerpo de titular: la
 * trayectoria se lee bajando por la columna de fechas, y lo que cambia de una
 * etapa a otra es el nombre, no la descripción.
 */
export function EtapaTrayectoria({
  documento,
  lang = 'es',
  tono = 'crema',
}: {
  documento: SiteDocument;
  lang?: Lang;
  tono?: Tono;
}) {
  const dict = getDictionary(lang);
  const t = TONOS[tono];
  const periodo = formatPeriod(documento.startsOn, documento.endsOn, lang);
  const rol = texto(documento, 'rol');
  const organizacion = texto(documento, 'organizacion');

  return (
    <article className={`grid gap-x-10 gap-y-4 border-t py-10 sm:grid-cols-[10rem_1fr] ${t.linea}`}>
      <p className={`font-mono text-[13px] ${t.acento}`}>{periodo ?? '—'}</p>

      <div className="min-w-0">
        <h3 className="text-subtitular font-extrabold">{organizacion ?? documento.title}</h3>

        {rol ? <p className="mt-2 text-[17px] font-semibold">{rol}</p> : null}

        {documento.summary ? (
          <p className={`mt-3 max-w-2xl text-[15px] leading-relaxed sm:text-[17px] ${t.apagado}`}>
            {documento.summary}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={`/${lang}/${documento.slug}`}
            className={`font-mono text-[14px] hover:underline ${t.acento}`}
          >
            {dict.sections.journey.cardCta}
          </Link>
          <Etiquetas tecnologias={documento.technologies.slice(0, 4)} tono={tono} />
        </div>
      </div>
    </article>
  );
}

/** Primera frase completa de un texto largo, para los extractos. */
function extracto(contenido: string, minimo = 80): string {
  const plano = contenido.replace(/\s+/g, ' ').trim();
  // El primer punto que cierre una frase lo bastante larga para valerse sola:
  // cortar por número de caracteres parte palabras y deja la cita a medias.
  const corte = plano.indexOf('. ', minimo);
  return corte === -1 ? plano : plano.slice(0, corte + 1);
}

/** Los tres colores que se van turnando en las recomendaciones cortas. */
const COLORES_TESTIMONIO = ['bg-lila', 'bg-naranja', 'bg-crema-honda'] as const;

/**
 * Recomendación de LinkedIn.
 *
 * Dos tamaños. La destacada va sola, en tinta y a cuerpo de titular, porque es
 * la que una persona que llega al sitio se va a leer entera; las demás van en
 * extracto —la primera frase completa— sobre los colores de la casa, turnándose,
 * de modo que la fila se lee como un muestrario y no como una lista.
 *
 * El autor no se nombra: se identifican por cargo y empresa, que es lo que hace
 * comprobable la cita sin publicar el nombre de quien la escribió.
 */
export function TarjetaTestimonio({
  testimonio,
  lang = 'es',
  tamano = 'normal',
  indice = 0,
}: {
  testimonio: Testimonio;
  lang?: Lang;
  tamano?: 'grande' | 'normal';
  /** Posición en la fila: decide el color de la tarjeta corta. */
  indice?: number;
}) {
  const dict = getDictionary(lang);
  const parrafos = testimonio.contenido.split('\n\n');
  const resumen = extracto(parrafos[0] ?? '');
  const cargo = testimonio.cargo.split('|')[0]?.trim();
  const hayMas = resumen !== testimonio.contenido.replace(/\s+/g, ' ').trim();

  if (tamano === 'grande') {
    return (
      <article className="rounded-bloque bg-noche p-8 text-ink-inverso sm:p-16">
        <blockquote className="text-[clamp(24px,3.9vw,56px)] font-bold leading-[1.02] tracking-[-0.03em]">
          “{resumen}”
        </blockquote>

        <p className="mt-7 text-[15px] sm:text-[16px]">
          <strong className="font-semibold">
            {cargo} · {testimonio.empresa}
          </strong>{' '}
          <span className="text-ink-inverso-faint">
            · {testimonio.relacion.toLowerCase()} · {testimonio.fecha.toLowerCase()}
          </span>
        </p>

        {hayMas ? (
          <details className="acordeon mt-5">
            <summary className="font-mono text-[14px] text-lila">
              <span aria-hidden className="acordeon-signo mr-2 inline-block">
                +
              </span>
              {dict.sections.testimonials.readFull}
            </summary>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-inverso-muted sm:text-[17px]">
              {parrafos.map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
            </div>
          </details>
        ) : null}

      </article>
    );
  }

  return (
    <figure
      className={`m-0 flex h-full flex-col justify-between gap-4 rounded-[22px] p-7 text-tinta ${
        COLORES_TESTIMONIO[indice % COLORES_TESTIMONIO.length]
      }`}
    >
      <blockquote className="text-[18px] font-semibold leading-snug sm:text-[21px]">
        “{resumen}”
      </blockquote>
      <figcaption className="font-mono text-[12px]">
        {cargo} · {testimonio.empresa} · {testimonio.fecha}
      </figcaption>
    </figure>
  );
}
