import Link from 'next/link';
import { Pildora } from './pildora';
import { Punto } from './seccion';
import { Etiqueta } from './etiqueta';
import { Pie } from './pie';
import { ConversacionLucIA } from './conversacion-luc-ia';
import { partirEnCapitulos } from '@/lib/site/markdown';
import { getGuionConversacion } from '@/lib/site/conversacion';
import { formatPeriod, shortName, type SiteDocument } from '@/lib/site/queries';
import { ENLACES } from '@/lib/site/enlaces';
import { getDictionary, type Lang } from '@/lib/i18n';

function texto(documento: SiteDocument, clave: string): string | null {
  const valor = documento.metadata[clave];
  return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
}

/**
 * Las imágenes que no son la portada.
 *
 * Admite `portada_2` —la segunda pieza que ya usa la banda de la portada— y una
 * lista `galeria` de `{ src, alt }`. El texto alternativo es obligatorio en la
 * lista y no opcional: una captura sin describir deja fuera a quien no la ve, y
 * el frontmatter es justo donde se escribe sin que cueste nada.
 */
function galeria(documento: SiteDocument): { src: string; alt: string }[] {
  const piezas: { src: string; alt: string }[] = [];

  const segunda = texto(documento, 'portada_2');
  if (segunda) {
    piezas.push({ src: segunda, alt: texto(documento, 'portada_2_alt') ?? documento.title });
  }

  const lista = documento.metadata['galeria'];
  if (Array.isArray(lista)) {
    for (const entrada of lista) {
      if (typeof entrada !== 'object' || entrada === null) continue;
      const { src, alt } = entrada as { src?: unknown; alt?: unknown };
      if (typeof src === 'string' && src.trim() !== '') {
        piezas.push({ src: src.trim(), alt: typeof alt === 'string' ? alt : documento.title });
      }
    }
  }

  return piezas;
}

/** Cifras del bloque de resultado, si la ficha las declara. */
function resultados(documento: SiteDocument): { dato: string; etiqueta: string }[] {
  const lista = documento.metadata['resultados'];
  if (!Array.isArray(lista)) return [];

  return lista.flatMap((entrada) => {
    if (typeof entrada !== 'object' || entrada === null) return [];
    const { dato, etiqueta } = entrada as { dato?: unknown; etiqueta?: unknown };
    if (typeof dato !== 'string' || typeof etiqueta !== 'string') return [];
    return [{ dato, etiqueta }];
  });
}

/**
 * Ficha de proyecto.
 *
 * La portada manda el nombre a cuerpo de titular sobre naranja, con la ficha
 * técnica en una fila de celdas y la imagen asomando por abajo hasta invadir la
 * sección siguiente. Después, el documento: cada `##` del Markdown es un
 * capítulo numerado, con el título a un lado y el texto al otro.
 *
 * Los capítulos no están declarados en ninguna plantilla: son los del propio
 * documento (ver `partirEnCapitulos`). Es lo que permite que las dieciséis
 * fichas estrenen esta página sin reescribir ninguna, y que la que se escriba
 * mañana la herede sola.
 *
 * Los bloques que dependen de datos que no todas las fichas tienen —la galería
 * y las cifras de resultado— no se pintan vacíos: desaparecen. Una plantilla
 * que reserva hueco para lo que falta convierte cada ficha incompleta en una
 * página rota.
 */
export async function FichaProyecto({
  documento,
  siguiente,
  lang = 'es',
}: {
  documento: SiteDocument;
  /** El proyecto que viene después, para el cierre. */
  siguiente?: SiteDocument | undefined;
  lang?: Lang;
}) {
  const dict = getDictionary(lang);
  const { capitulos } = await partirEnCapitulos(documento.body);

  const periodo = formatPeriod(documento.startsOn, documento.endsOn, lang);
  const rol = texto(documento, 'rol');
  const organizacion = texto(documento, 'organizacion');
  const dominio = texto(documento, 'dominio');
  const portada = texto(documento, 'portada') ?? texto(documento, 'imagen');
  const parteDe = texto(documento, 'parte_de');

  const nombre = shortName(documento);
  // Tres escalones y no uno: a 200 px caben diez caracteres, no cincuenta, y
  // un clamp no sabe cuánto mide el texto que le toca.
  const cuerpoTitular =
    nombre.length <= 14
      ? 'text-gigante'
      : nombre.length <= 28
        ? 'text-[clamp(44px,9vw,120px)] leading-[0.86] tracking-[-0.05em]'
        : 'text-[clamp(34px,5.6vw,76px)] leading-[0.92] tracking-[-0.04em]';

  const numero = typeof documento.metadata['destacado'] === 'number'
    ? String(documento.metadata['destacado']).padStart(2, '0')
    : null;
  const kicker = [numero ? `${dict.detail.caseLabel} ${numero}` : null, dominio]
    .filter(Boolean)
    .join(' · ');

  const fichaTecnica = [
    { clave: dict.detail.role, valor: rol, href: null },
    {
      clave: dict.detail.organization,
      valor: organizacion,
      href: parteDe ? `/${lang}/${parteDe}` : null,
    },
    { clave: dict.detail.period, valor: periodo, href: null },
  ].filter((celda): celda is { clave: string; valor: string; href: string | null } =>
    Boolean(celda.valor),
  );

  const imagenes = galeria(documento);
  const cifras = resultados(documento);

  return (
    <>
      <div className="bg-naranja text-tinta">
        <div className="mx-auto max-w-ancho">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5 sm:px-8">
            <Link
              href={`/${lang}/proyectos`}
              className="inline-flex items-center gap-3 font-mono text-[14px] font-bold hover:underline"
            >
              <img src="/logo.svg" alt="" aria-hidden className="size-8 brightness-0" />←{' '}
              {dict.detail.backToProjects}
            </Link>

            <nav aria-label={dict.nav.about} className="hidden flex-wrap gap-2 sm:flex">
              <Pildora href={`/${lang}#trabajo`} variante="crema">
                {dict.nav.work}
              </Pildora>
              <Pildora href={`/${lang}#trayectoria`} variante="crema">
                {dict.nav.journey}
              </Pildora>
              <Pildora href={`/${lang}#contacto`} variante="lila">
                {dict.nav.contact} →
              </Pildora>
            </nav>
          </div>
        </div>

        {/* Portada */}
        <header className="mx-auto max-w-ancho px-6 pt-16 sm:px-8">
          {kicker ? <p className="font-mono text-[14px]">{kicker}</p> : null}

          <h1 className={`mt-4 font-extrabold ${cuerpoTitular}`}>
            {nombre}
            <Punto tono="naranja" />
          </h1>

          {documento.summary ? (
            <p className="mt-8 max-w-3xl text-[20px] font-semibold leading-[1.35] sm:text-[28px]">
              {documento.summary}
            </p>
          ) : null}

          {fichaTecnica.length > 0 ? (
            <dl className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))] border-t-[1.5px] border-tinta">
              {fichaTecnica.map((celda) => (
                <div
                  key={celda.clave}
                  className="border-tinta px-5 py-5 first:pl-0 sm:border-r-[1.5px] sm:last:border-r-0"
                >
                  <dt className="font-mono text-[12px] uppercase tracking-[0.08em]">
                    {celda.clave}
                  </dt>
                  <dd className="mt-2 text-[19px] font-semibold">
                    {celda.href ? (
                      <Link href={celda.href} className="hover:underline">
                        {celda.valor} →
                      </Link>
                    ) : (
                      celda.valor
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </header>

        {/* La imagen asoma por debajo de la banda y entra en la sección
            siguiente: es lo que cose las dos mitades de la portada. */}
        {portada ? (
          <div className="mx-auto max-w-ancho px-6 pt-12 sm:px-8">
            <img
              src={portada}
              alt={texto(documento, 'portada_alt') ?? documento.title}
              className="block aspect-[16/8] w-full rounded-t-bloque object-cover shadow-[0_-20px_60px_rgba(20,16,18,0.25)]"
            />
          </div>
        ) : texto(documento, 'visual') === 'conversacion' ? (
          // Sin captura publicable, la portada es la conversación recreada.
          // Queda centrada y sin el sangrado de la imagen: es una pieza con su
          // propia forma, no un plano a toda anchura.
          <div className="mx-auto flex max-w-ancho justify-center px-6 pb-4 pt-16 sm:px-8">
            <div className="w-full max-w-xl">
              <ConversacionLucIA guion={getGuionConversacion(lang)} />
            </div>
          </div>
        ) : null}
      </div>

      <main className="bg-crema text-ink">
        {/* El documento, capítulo a capítulo. */}
        {capitulos.map((capitulo, indice) => (
          <section
            key={capitulo.titulo}
            data-aparecer
            className="mx-auto flex max-w-ancho flex-wrap gap-x-24 gap-y-8 px-6 pb-16 pt-24 sm:px-8"
          >
            <div className="flex-[1_1_18rem]">
              <span className="font-mono text-[13px] text-accent-strong">
                {String(indice + 1).padStart(2, '0')}
              </span>
              <h2 className="mt-3 text-titular font-extrabold">
                {capitulo.titulo}
                <Punto />
              </h2>
            </div>

            <div
              className="prose-ficha flex-[2_1_32rem] pt-2"
              dangerouslySetInnerHTML={{ __html: capitulo.html }}
            />
          </section>
        ))}

        {/* Galería */}
        {imagenes.length > 0 ? (
          <section data-aparecer className="mt-16 bg-noche text-ink-inverso">
            <div className="mx-auto max-w-ancho px-6 py-24 sm:px-8 sm:py-32">
              <span className="font-mono text-[13px] text-naranja-claro">
                {String(capitulos.length + 1).padStart(2, '0')}
              </span>
              <h2 className="mt-3 text-titular font-extrabold">
                {dict.detail.images}
                <Punto tono="noche" />
              </h2>

              <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,26rem),1fr))] gap-4">
                {imagenes.map((imagen) => (
                  <figure key={imagen.src} className="m-0">
                    <img
                      src={imagen.src}
                      alt={imagen.alt}
                      loading="lazy"
                      className="block aspect-4/3 w-full rounded-tarjeta object-cover"
                    />
                    <figcaption className="pt-2.5 font-mono text-[12px] text-ink-inverso-faint">
                      {imagen.alt}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Resultado */}
        {cifras.length > 0 ? (
          <section
            data-aparecer
            className="mx-auto flex max-w-ancho flex-wrap gap-x-24 gap-y-8 px-6 py-24 sm:px-8"
          >
            <div className="flex-[1_1_18rem]">
              <span className="font-mono text-[13px] text-accent-strong">
                {String(capitulos.length + (imagenes.length > 0 ? 2 : 1)).padStart(2, '0')}
              </span>
              <h2 className="mt-3 text-titular font-extrabold">
                {dict.detail.results}
                <Punto />
              </h2>
            </div>

            <div className="grid flex-[2_1_32rem] grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))] gap-4 pt-2">
              {cifras.map((cifra) => (
                <div key={cifra.etiqueta} className="border-t-[3px] border-tinta pt-4">
                  <p className="text-dato font-extrabold">{cifra.dato}</p>
                  <p className="text-[17px] text-ink-muted">{cifra.etiqueta}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Tecnologías */}
        {documento.technologies.length > 0 ? (
          <section className="mx-auto max-w-ancho px-6 pb-24 sm:px-8">
            <div className="flex flex-wrap gap-2.5">
              {documento.technologies.map((tecnologia) => (
                <span
                  key={tecnologia.slug}
                  className="rounded-full bg-tinta px-4 py-2.5 font-mono text-[14px] text-crema"
                >
                  {tecnologia.name}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {/* Siguiente caso */}
      {siguiente ? (
        <Link href={`/${lang}/${siguiente.slug}`} className="block bg-crema">
          <div className="rounded-t-[2.5rem] bg-noche text-ink-inverso">
            <div className="mx-auto flex max-w-ancho flex-wrap items-center justify-between gap-12 px-6 pb-28 pt-24 sm:px-8">
              <div>
                <span className="font-mono text-[14px] text-naranja-claro">
                  {dict.detail.nextCase}
                </span>
                <p className="mt-3 text-[clamp(34px,7.4vw,110px)] font-extrabold leading-[0.84] tracking-[-0.05em]">
                  {shortName(siguiente)} →
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {siguiente.technologies.slice(0, 3).map((tecnologia) => (
                  <Etiqueta key={tecnologia.slug} tono="noche">
                    {tecnologia.name}
                  </Etiqueta>
                ))}
              </div>
            </div>
          </div>
        </Link>
      ) : null}

      <Pie
        github={ENLACES.github}
        linkedin={ENLACES.linkedin}
        behance={ENLACES.behance}
        ano={new Date().getFullYear()}
        lang={lang}
        currentSlug={documento.slug}
      />
    </>
  );
}
