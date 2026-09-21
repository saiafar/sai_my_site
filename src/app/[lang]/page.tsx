import type { Metadata } from 'next';
import { FondoHero } from '@/components/fondo-hero';
import { BarraSuperior } from '@/components/barra-superior';
import { Asistente } from '@/components/asistente';
import { Seccion, SeccionVacia } from '@/components/seccion';
import { TarjetaProyecto, EntradaExperiencia } from '@/components/tarjetas';
import { Etiqueta } from '@/components/etiqueta';
import { Pie } from '@/components/pie';
import { EscenaHero } from '@/components/escena-hero';
import { FormularioContacto } from '@/components/formulario-contacto';
import { Telemetria } from '@/components/telemetria';
import { VerMas } from '@/components/ver-mas';
import { DatosEstructurados } from '@/components/datos-estructurados';
import * as jsonLd from '@/lib/site/datos-estructurados';
import { getByKind, getStats, getTechnologies } from '@/lib/site/queries';
import { ENLACES } from '@/lib/site/enlaces';
import { env } from '@/lib/env';
import { getDictionary, isValidLang, DEFAULT_LANG, type Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

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

function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export default async function HomePage({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang: Lang = isValidLang(rawLang) ? rawLang : DEFAULT_LANG;
  const dict = getDictionary(lang);

  const [perfil, experiencias, proyectos, notas, tecnologias, stats] = await Promise.all([
    getByKind('perfil', lang),
    getByKind('experiencia', lang),
    getByKind('proyecto', lang),
    getByKind('nota', lang),
    getTechnologies(lang),
    getStats(lang),
  ]);

  const presentacion = perfil[0];

  const delPerfil = (clave: string): string | null => {
    const valor = presentacion?.metadata[clave];
    return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
  };
  const titular = delPerfil('titular');
  const subtitulo = delPerfil('subtitulo') ?? presentacion?.summary ?? null;

  const destacados = proyectos.filter((p) => p.metadata['destacado'] === true);
  const proyectosVisibles = destacados.length > 0 ? destacados : proyectos;
  const proyectosOcultos = proyectos.filter((p) => !proyectosVisibles.includes(p));

  const ETAPAS_VISIBLES = 3;
  const experienciasVisibles = experiencias.slice(0, ETAPAS_VISIBLES);
  const experienciasOcultas = experiencias.slice(ETAPAS_VISIBLES);

  const metaDestacadas =
    presentacion?.metadata['destacadas'] ??
    presentacion?.metadata['tecnologias'] ??
    presentacion?.metadata['technologies'];

  const slugsDestacados = new Set(
    (Array.isArray(metaDestacadas)
      ? metaDestacadas
      : presentacion?.technologies.map((t) => t.slug) ?? []
    ).map((s) => String(s).toLowerCase().trim()),
  );

  const tecnologiasVisibles =
    slugsDestacados.size > 0
      ? tecnologias.filter((t) => slugsDestacados.has(t.slug.toLowerCase()))
      : tecnologias.slice(0, 14);
  const tecnologiasOcultas = tecnologias.filter((t) => !tecnologiasVisibles.includes(t));

  const cifrasPerfil = presentacion?.metadata['cifras'];
  const cifras = Array.isArray(cifrasPerfil)
    ? cifrasPerfil.filter((c): c is string => typeof c === 'string' && c.trim() !== '')
    : [
        `${stats.proyectos} ${stats.proyectos === 1 ? (lang === 'en' ? 'project' : 'proyecto') : (lang === 'en' ? 'projects' : 'proyectos')}`,
        `${stats.tecnologias} ${stats.tecnologias === 1 ? (lang === 'en' ? 'technology' : 'tecnología') : (lang === 'en' ? 'technologies' : 'tecnologías')}`,
        ...(stats.primerAno ? [lang === 'en' ? `since ${stats.primerAno}` : `desde ${stats.primerAno}`] : []),
      ];

  return (
    <>
      <BarraSuperior github={ENLACES.github} linkedin={ENLACES.linkedin} sobreImagen lang={lang} />
      <EscenaHero />

      <noscript>
        <style>{'[data-escena],[data-escena-barra]{--p:1!important}'}</style>
      </noscript>

      <div data-escena className="relative" style={{ '--p': 0 } as React.CSSProperties}>
        <div className="relative">
          <FondoHero />

          <div aria-hidden className="escena-entrada" />

          <div className="escena-bloque flex flex-col items-center px-6 text-center">
            <span className="escena-logo relative block">
              <img
                src="/logo.svg"
                alt=""
                width={72}
                height={72}
                className="escena-logo-blanco absolute inset-0 size-full brightness-0 invert"
              />
              <img
                src="/logo.svg"
                alt=""
                width={72}
                height={72}
                className="escena-logo-color relative size-full"
              />
            </span>
            <h1 className="escena-nombre font-brand font-semibold uppercase leading-none tracking-[0.14em] text-ink">
              {env.siteOwner}
            </h1>
          </div>

          <div aria-hidden data-recorrido className="escena-recorrido" />
        </div>

        <section className="mx-auto max-w-lectura px-6 pb-24 pt-6 text-center sm:pb-32">
          {titular ? (
            <p
              className="escena-sube mx-auto max-w-2xl text-[24px] font-medium leading-snug tracking-tight text-ink sm:text-[28px]"
              style={{ '--desde': 0.3 } as React.CSSProperties}
            >
              {titular}
            </p>
          ) : null}

          <p
            className={`escena-sube mx-auto max-w-md text-[14px] leading-relaxed text-ink-muted${
              titular ? ' mt-4' : ''
            }`}
            style={{ '--desde': 0.38 } as React.CSSProperties}
          >
            {subtitulo ?? dict.hero.fallbackSubtitle}
          </p>

          <ul
            className="escena-sube mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-ink-muted"
            style={{ '--desde': 0.45 } as React.CSSProperties}
          >
            {cifras.map((cifra, idx) => (
              <li key={cifra} className="inline-flex items-center gap-4">
                {idx > 0 ? (
                  <span aria-hidden className="select-none text-accent/60">
                    •
                  </span>
                ) : null}
                <span>{cifra}</span>
              </li>
            ))}
          </ul>

          <div
            className="escena-sube mx-auto mt-14 max-w-2xl sm:mt-18"
            style={{ '--desde': 0.55 } as React.CSSProperties}
          >
            <Asistente lang={lang} />
          </div>
        </section>
      </div>

      <main className="mx-auto max-w-lectura space-y-14 px-6 pb-4">
        <Seccion
          id="experiencia"
          titulo={dict.sections.experience.title}
          descripcion={dict.sections.experience.desc}
          recuento={plural(
            experiencias.length,
            dict.sections.experience.singular,
            dict.sections.experience.plural,
          )}
        >
          {experiencias.length > 0 ? (
            <>
              <div className="space-y-6">
                {experienciasVisibles.map((documento) => (
                  <EntradaExperiencia key={documento.slug} documento={documento} lang={lang} />
                ))}
              </div>

              {experienciasOcultas.length > 0 ? (
                <VerMas
                  texto={dict.sections.experience.seeMore.replace(
                    '{n}',
                    String(experienciasOcultas.length),
                  )}
                  textoCerrar={lang === 'en' ? 'Show less' : 'Ver menos'}
                >
                  <div className="space-y-6">
                    {experienciasOcultas.map((documento) => (
                      <EntradaExperiencia key={documento.slug} documento={documento} lang={lang} />
                    ))}
                  </div>
                </VerMas>
              ) : null}
            </>
          ) : (
            <SeccionVacia mensaje={dict.sections.experience.empty} />
          )}
        </Seccion>

        <Seccion
          id="proyectos"
          titulo={dict.sections.projects.title}
          descripcion={dict.sections.projects.desc}
        >
          {proyectosVisibles.length > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {proyectosVisibles.map((documento) => (
                  <TarjetaProyecto key={documento.slug} documento={documento} lang={lang} />
                ))}
              </div>

              {proyectosOcultos.length > 0 ? (
                <VerMas
                  texto={dict.sections.projects.seeMore.replace(
                    '{n}',
                    String(proyectosOcultos.length),
                  )}
                  textoCerrar={lang === 'en' ? 'Show less' : 'Ver menos'}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {proyectosOcultos.map((documento) => (
                      <TarjetaProyecto key={documento.slug} documento={documento} lang={lang} />
                    ))}
                  </div>
                </VerMas>
              ) : null}
            </>
          ) : (
            <SeccionVacia mensaje={dict.sections.projects.empty} />
          )}
        </Seccion>

        <Seccion
          id="stack"
          titulo={dict.sections.stack.title}
          descripcion={dict.sections.stack.desc}
          recuento={plural(
            tecnologias.length,
            dict.sections.stack.singular,
            dict.sections.stack.plural,
          )}
        >
          {tecnologiasVisibles.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {tecnologiasVisibles.map((tecnologia) => (
                  <span
                    key={tecnologia.slug}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink-muted transition-all duration-200 hover:border-accent/35 hover:text-ink"
                  >
                    {tecnologia.name}
                    <span className="font-mono text-[10px] text-accent/80 transition-colors group-hover:text-accent">
                      +{tecnologia.documentCount}
                    </span>
                  </span>
                ))}
              </div>

              {tecnologiasOcultas.length > 0 ? (
                <VerMas
                  texto={dict.sections.stack.seeMore.replace(
                    '{n}',
                    String(tecnologiasOcultas.length),
                  )}
                  textoCerrar={lang === 'en' ? 'Show less' : 'Ver menos'}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {tecnologiasOcultas.map((tecnologia) => (
                      <span
                        key={tecnologia.slug}
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink-muted transition-all duration-200 hover:border-accent/35 hover:text-ink"
                      >
                        {tecnologia.name}
                        <span className="font-mono text-[10px] text-accent/80 transition-colors group-hover:text-accent">
                          +{tecnologia.documentCount}
                        </span>
                      </span>
                    ))}
                  </div>
                </VerMas>
              ) : null}
            </>
          ) : (
            <SeccionVacia mensaje={dict.sections.stack.empty} />
          )}
        </Seccion>

        {notas.length > 0 ? (
          <Seccion
            id="notas"
            titulo={dict.sections.notes.title}
            descripcion={dict.sections.notes.desc}
            recuento={plural(
              notas.length,
              dict.sections.notes.singular,
              dict.sections.notes.plural,
            )}
          >
            <ul className="divide-y divide-line border-y border-line">
              {notas.map((nota) => (
                <li key={nota.slug}>
                  <a
                    href={`/${lang}/${nota.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-3"
                  >
                    <span className="text-[13px] text-ink-muted transition-colors group-hover:text-ink">
                      {nota.title}
                    </span>
                    {nota.technologies[0] ? (
                      <Etiqueta>{nota.technologies[0].name}</Etiqueta>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </Seccion>
        ) : null}

        <section
          id="contacto"
          data-aparecer
          className="scroll-mt-20 border-t border-line pt-10"
        >
          <h2 className="text-[22px] font-medium leading-snug tracking-tight text-ink sm:text-[26px]">
            {dict.sections.contact.title}
          </h2>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-muted">
            {dict.sections.contact.desc}
          </p>

          <div className="mt-7">
            <FormularioContacto lang={lang} />
          </div>
        </section>

        <Pie
          github={ENLACES.github}
          linkedin={ENLACES.linkedin}
          ano={new Date().getFullYear()}
          lang={lang}
        />
      </main>

      <Telemetria />

      <DatosEstructurados
        datos={jsonLd.persona({ perfil: presentacion, tecnologias, experiencias })}
      />
      <DatosEstructurados datos={jsonLd.sitioWeb(lang)} />
    </>
  );
}
