import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/hero';
import { Cinta } from '@/components/cinta';
import { Banda, Titular, Punto, SeccionVacia } from '@/components/seccion';
import { BandaProyecto, TarjetaProyectoBreve, EtapaTrayectoria, TarjetaTestimonio } from '@/components/tarjetas';
import { SeccionCreativo } from '@/components/seccion-creativo';
import { SeccionLab } from '@/components/seccion-lab';
import { SobreElSitio } from '@/components/sobre-el-sitio';
import type { SeccionCorpus } from '@/components/mapa-rag';
import { Asistente } from '@/components/asistente';
import { Etiqueta } from '@/components/etiqueta';
import { Pie } from '@/components/pie';
import { Pildora } from '@/components/pildora';
import { TextoDestacado } from '@/components/texto-destacado';
import { EscenaHero } from '@/components/escena-hero';
import { RestauradorScroll } from '@/components/restaurador-scroll';
import { FormularioContacto } from '@/components/formulario-contacto';
import { Telemetria } from '@/components/telemetria';
import { VerMas } from '@/components/ver-mas';
import { DatosEstructurados } from '@/components/datos-estructurados';
import * as jsonLd from '@/lib/site/datos-estructurados';
import { getByKind, getMapaCorpus, getStats, getTechnologies } from '@/lib/site/queries';
import { getTestimonios } from '@/lib/site/testimonios';
import { getExperimentos } from '@/lib/site/lab';
import { getPiezasCreativas } from '@/lib/site/creativo';
import { getPreguntasSitio } from '@/lib/site/sobre-el-sitio';
import { CICLO_TONOS } from '@/lib/site/tonos';
import { ENLACES } from '@/lib/site/enlaces';
import { env } from '@/lib/env';
import { getDictionary, isValidLang, DEFAULT_LANG, type Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/** Proyectos que tienen banda propia. */
const BANDAS = 4;
/** Y los que van en la rejilla de debajo. Los demás, en el índice completo. */
const EN_REJILLA = 6;
/** Etapas visibles antes del desplegable. */
const ETAPAS_VISIBLES = 4;
/** Recomendaciones visibles: una entera y tres en extracto. */
const TESTIMONIOS_VISIBLES = 4;

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Lang = isValidLang(rawLang) ? rawLang : DEFAULT_LANG;
  const dict = getDictionary(lang);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `${env.siteUrl}/${lang}`,
      languages: {
        es: `${env.siteUrl}/es`,
        en: `${env.siteUrl}/en`,
        'x-default': `${env.siteUrl}/es`,
      },
    },
    openGraph: {
      type: 'website',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      url: `${env.siteUrl}/${lang}`,
      siteName: env.siteOwner,
      title: dict.meta.title,
      description: dict.meta.description,
      images: ['/og.jpg'],
    },
  };
}

/** Año de inicio y de fin de un grupo de etapas, para el texto del desplegable. */
function tramo(fechas: readonly (string | null)[]): { desde: string; hasta: string } {
  const anos = fechas
    .filter((fecha): fecha is string => Boolean(fecha))
    .map((fecha) => new Date(fecha).getUTCFullYear())
    .sort((a, b) => a - b);
  return {
    desde: String(anos[0] ?? ''),
    hasta: String(anos[anos.length - 1] ?? ''),
  };
}

export default async function HomePage({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang: Lang = isValidLang(rawLang) ? rawLang : DEFAULT_LANG;
  const dict = getDictionary(lang);

  const [perfil, experiencias, proyectos, notas, tecnologias, stats, mapa] = await Promise.all([
    getByKind('perfil', lang),
    getByKind('experiencia', lang),
    getByKind('proyecto', lang),
    getByKind('nota', lang),
    getTechnologies(lang),
    getStats(lang),
    getMapaCorpus(lang),
  ]);

  const presentacion = perfil[0];
  const delPerfil = (clave: string): string | null => {
    const valor = presentacion?.metadata[clave];
    return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
  };

  // Los años no se escriben en ningún sitio: se cuentan desde la primera fecha
  // del corpus, así que el 1 de enero el sitio dice uno más sin tocar nada.
  const anos = stats.primerAno ? new Date().getFullYear() - stats.primerAno : null;
  const conAnos = (texto: string): string => texto.replace('{n}', String(anos ?? ''));

  // La cinta son las cuatro líneas del diccionario y las cifras de carrera que
  // el perfil declara en su frontmatter. Las segundas son afirmaciones sobre su
  // trabajo, así que viven en el corpus y no aquí.
  const cifras = Array.isArray(presentacion?.metadata['cifras'])
    ? (presentacion.metadata['cifras'] as unknown[]).filter(
        (cifra): cifra is string => typeof cifra === 'string' && cifra.trim() !== '',
      )
    : [];
  const cinta = [
    ...dict.hero.ticker.filter((texto) => anos !== null || !texto.includes('{n}')).map(conAnos),
    ...cifras,
  ];

  // `destacado` en el frontmatter admite un número —la posición dentro de la
  // sección de trabajo— o `true`, que vale «destácalo, donde quepa». Los cuatro
  // primeros abren banda propia y los seis siguientes van en la rejilla; el
  // resto vive en el índice completo. El orden no es el de las fechas: alterna
  // dominios, y eso lo decide quien escribe el corpus, no la consulta. Los que
  // no llevan número quedan detrás, ya ordenados por fecha, porque Array.sort
  // es estable.
  const posicion = (proyecto: (typeof proyectos)[number]): number => {
    const valor = proyecto.metadata['destacado'];
    if (typeof valor === 'number') return valor;
    return Number.MAX_SAFE_INTEGER;
  };
  const ordenados = [...proyectos].sort((a, b) => posicion(a) - posicion(b));
  const conBanda = ordenados.slice(0, BANDAS);
  const enRejilla = ordenados.slice(BANDAS, BANDAS + EN_REJILLA);

  const etapasVisibles = experiencias.slice(0, ETAPAS_VISIBLES);
  const etapasOcultas = experiencias.slice(ETAPAS_VISIBLES);
  const tramoOculto = tramo(etapasOcultas.flatMap((etapa) => [etapa.startsOn, etapa.endsOn]));

  // Tecnologías que el perfil destaca; si no declara ninguna, las más escritas.
  const metaDestacadas =
    presentacion?.metadata['destacadas'] ??
    presentacion?.metadata['tecnologias'] ??
    presentacion?.metadata['technologies'];
  const slugsDestacados = new Set(
    (Array.isArray(metaDestacadas) ? metaDestacadas : []).map((slug) =>
      String(slug).toLowerCase().trim(),
    ),
  );
  const stack =
    slugsDestacados.size > 0
      ? tecnologias.filter((tecnologia) => slugsDestacados.has(tecnologia.slug.toLowerCase()))
      : tecnologias.slice(0, 14);

  const testimonios = getTestimonios(lang);
  const [destacado, ...otrosTestimonios] = testimonios;
  const pequenos = otrosTestimonios.slice(0, TESTIMONIOS_VISIBLES - 1);
  const testimoniosOcultos = otrosTestimonios.slice(TESTIMONIOS_VISIBLES - 1);

  // Cada empresa una vez, en el orden en que aparecen las recomendaciones.
  const empresas = [...new Set(testimonios.map((testimonio) => testimonio.empresa))].slice(0, 6);

  const experimentos = getExperimentos(lang);
  const piezas = getPiezasCreativas(lang);
  const preguntasSitio = getPreguntasSitio(lang);

  // El mapa que se dibuja detrás del asistente: las secciones del corpus con
  // sus documentos y el número real de fragmentos de cada uno. Son los mismos
  // que consulta la búsqueda, así que el grafo no ilustra el sistema: lo enseña.
  const ETIQUETAS: Partial<Record<(typeof mapa)[number]['kind'], string>> = {
    experiencia: dict.sections.experience.title,
    proyecto: dict.sections.work.title,
    perfil: dict.sections.assistant.mapProfile,
    nota: dict.sections.notes.title,
  };
  const secciones: SeccionCorpus[] = (['experiencia', 'proyecto', 'perfil', 'nota'] as const)
    .map((kind) => ({
      etiqueta: ETIQUETAS[kind] ?? kind,
      documentos: mapa
        .filter((nodo) => nodo.kind === kind)
        .map((nodo) => ({ titulo: nodo.title, fragmentos: nodo.fragmentos })),
    }))
    .filter((seccion) => seccion.documentos.length > 0);

  return (
    <>
      <EscenaHero />
      <RestauradorScroll />

      <Hero lang={lang} titular={delPerfil('titular')} subtitulo={delPerfil('subtitulo')} />

      <Cinta textos={cinta} />

      {/* Presentación: la foto y la tesis. */}
      <Banda tono="crema">
        <div className="flex flex-wrap items-center gap-12 sm:gap-16">
          <div className="relative min-w-0 flex-[1_1_18rem]">
            <img
              src="/imagenes/perfil/rafaias-villan.webp"
              alt={dict.intro.photoAlt}
              width={800}
              height={1000}
              className="block aspect-4/5 w-full -rotate-2 rounded-bloque object-cover shadow-[12px_12px_0_var(--color-tinta)]"
            />
            {/* La chapa va girada al contrario que la foto: es lo que hace que
                se lea como una pegatina encima y no como parte del marco. */}
            <span className="absolute -right-3 bottom-8 rotate-[4deg] rounded-full bg-lila px-4 py-2.5 font-mono text-[13px] font-bold text-tinta">
              {dict.intro.kicker}
            </span>
          </div>

          <div className="flex min-w-0 flex-[999_1_32rem] flex-col gap-7">
            <h2 className="text-[clamp(38px,7.2vw,104px)] font-extrabold uppercase leading-[0.88] tracking-[-0.045em]">
              {dict.intro.title.split('|').map((linea, indice, lineas) => (
                <span key={linea} className={indice === lineas.length - 1 ? 'text-naranja' : ''}>
                  {linea}
                  {indice < lineas.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>

            <p className="max-w-3xl text-[19px] font-medium leading-[1.45] sm:text-[26px]">
              <TextoDestacado
                texto={conAnos(dict.intro.body)}
                clases={['bg-naranja', 'bg-tinta text-crema', 'bg-lila']}
              />
            </p>
          </div>
        </div>
      </Banda>

      {/* Proyectos: cuatro bandas y el resto en rejilla. */}
      <Banda id="trabajo" tono="crema" compacta>
        <Titular
          titulo={dict.sections.work.title}
          tamano="gigante"
          lead={dict.sections.work.lead
            .replace('{n}', String(conBanda.length).padStart(2, '0'))
            .replace('{total}', String(proyectos.length))}
        />
      </Banda>

      {conBanda.length > 0 ? (
        conBanda.map((proyecto, indice) => (
          <BandaProyecto
            key={proyecto.slug}
            documento={proyecto}
            indice={indice}
            lang={lang}
            tono={CICLO_TONOS[indice % CICLO_TONOS.length]!}
            onda={{
              hacia:
                indice === conBanda.length - 1
                  ? 'crema'
                  : CICLO_TONOS[(indice + 1) % CICLO_TONOS.length]!,
              forma: indice,
            }}
          />
        ))
      ) : (
        <Banda tono="crema">
          <SeccionVacia mensaje={dict.sections.work.empty} />
        </Banda>
      )}

      {enRejilla.length > 0 ? (
        <Banda tono="crema">
          <Titular
            titulo={dict.sections.work.moreTitle}
            tamano="normal"
            sinPunto
            derecha={
              <Link
                href={`/${lang}/proyectos`}
                className="mb-3 font-mono text-[13px] text-accent hover:underline sm:text-[14px]"
              >
                {dict.sections.work.moreCta.replace('{n}', String(proyectos.length))}
              </Link>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enRejilla.map((proyecto) => (
              <TarjetaProyectoBreve key={proyecto.slug} documento={proyecto} lang={lang} />
            ))}
          </div>
        </Banda>
      ) : null}

      {/* Trabajo gráfico. */}
      <Banda id="creativo" tono="noche" onda={{ hacia: 'crema', forma: 1 }}>
        <SeccionCreativo piezas={piezas} behance={ENLACES.behance} lang={lang} />
      </Banda>

      {/* Lab: la única sección con trama de fondo. */}
      <Banda id="lab" tono="crema" className="rejilla border-b-[1.5px] border-tinta">
        <SeccionLab experimentos={experimentos} lang={lang} />
      </Banda>

      {/* Trayectoria. */}
      <Banda id="trayectoria" tono="crema">
        <Titular titulo={dict.sections.journey.title} tamano="gigante" />

        {experiencias.length > 0 ? (
          <>
            <div className="mt-12 flex items-center gap-4 font-mono text-[12px] text-ink-faint">
              <span>
                {stats.primerAno ?? ''} · {dict.sections.journey.first}
              </span>
              <span aria-hidden className="h-px flex-1 bg-line" />
              <span>
                {new Date().getFullYear()} · {dict.sections.journey.now}
              </span>
            </div>

            <div className="mt-4">
              {etapasVisibles.map((etapa) => (
                <EtapaTrayectoria key={etapa.slug} documento={etapa} lang={lang} />
              ))}
            </div>

            {etapasOcultas.length > 0 ? (
              <VerMas
                id="etapas"
                texto={dict.sections.journey.seeMore
                  .replace('{n}', String(etapasOcultas.length))
                  .replace('{desde}', tramoOculto.desde)
                  .replace('{hasta}', tramoOculto.hasta)}
                textoCerrar={lang === 'en' ? 'Show less' : 'Ver menos'}
              >
                <div>
                  {etapasOcultas.map((etapa) => (
                    <EtapaTrayectoria key={etapa.slug} documento={etapa} lang={lang} />
                  ))}
                </div>
              </VerMas>
            ) : null}

            {stack.length > 0 ? (
              <div className="mt-16 border-t border-line pt-8">
                <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-faint">
                  {dict.sections.journey.stackTitle}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {stack.map((tecnologia) => (
                    <Etiqueta key={tecnologia.slug}>
                      {tecnologia.name}
                      <span className="font-mono text-[11px] text-accent">
                        +{tecnologia.documentCount}
                      </span>
                    </Etiqueta>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <SeccionVacia mensaje={dict.sections.journey.empty} />
        )}
      </Banda>

      {/* Recomendaciones. */}
      <Banda id="testimonios" tono="crema">
        {destacado ? (
          <>
            <Titular
              kicker={dict.sections.testimonials.kicker.replace('{n}', String(testimonios.length))}
              titulo={dict.sections.testimonials.title}
              tamano="gigante"
            />

            <div className="mt-12">
              <TarjetaTestimonio testimonio={destacado} lang={lang} tamano="grande" />
            </div>

            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4">
              {pequenos.map((testimonio, indice) => (
                <TarjetaTestimonio
                  key={testimonio.id}
                  testimonio={testimonio}
                  lang={lang}
                  indice={indice}
                />
              ))}
            </div>

            {/* Las empresas, en fila. Repetir aquí el nombre de quien ya firma
                cada cita no es redundante: juntas dicen de un vistazo en cuántos
                sitios distintos ha trabajado, que es lo que una cita suelta no
                puede decir. */}
            {empresas.length > 0 ? (
              <ul className="flex flex-wrap justify-around gap-x-11 gap-y-5 pt-12 text-[18px] font-bold tracking-[-0.01em] text-ink-faint sm:text-[22px]">
                {empresas.map((empresa) => (
                  <li key={empresa}>{empresa}</li>
                ))}
              </ul>
            ) : null}

            {testimoniosOcultos.length > 0 ? (
              <VerMas
                id="testimonios"
                texto={dict.sections.testimonials.readAll.replace(
                  '{n}',
                  String(testimonios.length),
                )}
                textoCerrar={lang === 'en' ? 'Show less' : 'Ver menos'}
              >
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4">
                  {testimoniosOcultos.map((testimonio, indice) => (
                    <TarjetaTestimonio
                      key={testimonio.id}
                      testimonio={testimonio}
                      lang={lang}
                      indice={indice + pequenos.length}
                    />
                  ))}
                </div>
              </VerMas>
            ) : null}
          </>
        ) : (
          <SeccionVacia mensaje={dict.sections.testimonials.empty} />
        )}
      </Banda>

      {/* El asistente. El componente trae el mapa, el panel y la leyenda: son
          una sola pieza porque el recorrido de la búsqueda sale de la caja de
          la pregunta y cruza el grafo. */}
      <Banda id="preguntar" tono="noche" className="relative min-h-[820px] overflow-hidden">
        <Asistente secciones={secciones} lang={lang} />
      </Banda>

      {/* Sobre este sitio. */}
      <Banda id="sobre" tono="crema">
        <SobreElSitio preguntas={preguntasSitio} github={ENLACES.github} lang={lang} />
      </Banda>

      {/* Contacto. */}
      <Banda id="contacto" tono="naranja">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <Titular
              tono="naranja"
              kicker={dict.sections.contact.badge}
              titulo={dict.sections.contact.title.replace(/\.$/, '')}
              descripcion={dict.sections.contact.desc}
            />
            <p className="mt-8 font-mono text-[13px] text-tinta/75">
              {dict.sections.contact.emailQuestion}
            </p>
            <div className="mt-3">
              <Pildora href={`mailto:${ENLACES.email}`} variante="tinta">
                {ENLACES.email} →
              </Pildora>
            </div>
          </div>

          <FormularioContacto lang={lang} />
        </div>
      </Banda>

      <Pie
        github={ENLACES.github}
        linkedin={ENLACES.linkedin}
        behance={ENLACES.behance}
        ano={new Date().getFullYear()}
        lang={lang}
      />

      <Telemetria />

      <DatosEstructurados
        datos={jsonLd.persona({ perfil: presentacion, tecnologias, experiencias })}
      />
      <DatosEstructurados datos={jsonLd.sitioWeb(lang)} />
    </>
  );
}
