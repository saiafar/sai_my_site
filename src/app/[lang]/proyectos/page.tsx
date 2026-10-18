import type { Metadata } from 'next';
import { BarraSuperior } from '@/components/barra-superior';
import { Banda, Titular } from '@/components/seccion';
import { TarjetaProyectoBreve } from '@/components/tarjetas';
import { Pie } from '@/components/pie';
import { Telemetria } from '@/components/telemetria';
import { getByKind } from '@/lib/site/queries';
import { ENLACES } from '@/lib/site/enlaces';
import { env } from '@/lib/env';
import { getDictionary, isValidLang, DEFAULT_LANG, type Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ lang: string }>;
}

function textos(lang: Lang) {
  return lang === 'en'
    ? {
        titulo: 'Projects — Rafaías Villán',
        desc: 'Every documented project: context, technical decisions and what went wrong.',
        lead: 'Each card opens the full write-up.',
      }
    : {
        titulo: 'Proyectos — Rafaías Villán',
        desc: 'Todos los proyectos documentados: contexto, decisiones técnicas y lo que salió mal.',
        lead: 'Cada ficha abre el relato completo.',
      };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Lang = isValidLang(rawLang) ? rawLang : DEFAULT_LANG;
  const t = textos(lang);

  return {
    title: t.titulo,
    description: t.desc,
    alternates: {
      canonical: `${env.siteUrl}/${lang}/proyectos`,
      languages: {
        es: `${env.siteUrl}/es/proyectos`,
        en: `${env.siteUrl}/en/proyectos`,
        'x-default': `${env.siteUrl}/es/proyectos`,
      },
    },
    openGraph: {
      type: 'website',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      url: `${env.siteUrl}/${lang}/proyectos`,
      title: t.titulo,
      description: t.desc,
      images: ['/og.jpg'],
    },
  };
}

/**
 * Índice de proyectos.
 *
 * La portada enseña cuatro en banda y seis en rejilla; aquí están los
 * dieciséis. Existe porque la portada tiene que elegir —una lista de dieciséis
 * tarjetas seguidas no es una selección, es un listado— y porque el enlace
 * «ver los N proyectos» tiene que llevar a algún sitio.
 *
 * Ordena por fecha y no por el `destacado` del frontmatter: ahí la pregunta es
 * «qué enseño primero», y aquí es «qué hay», que se responde cronológicamente.
 */
export default async function ProyectosPage({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang: Lang = isValidLang(rawLang) ? rawLang : DEFAULT_LANG;
  const dict = getDictionary(lang);
  const t = textos(lang);

  const proyectos = await getByKind('proyecto', lang);

  return (
    <>
      <div className="bg-crema">
        <BarraSuperior
          github={ENLACES.github}
          linkedin={ENLACES.linkedin}
          lang={lang}
          tono="crema"
        />
      </div>

      <main>
        <Banda tono="crema">
          <Titular
            titulo={dict.sections.work.title}
            tamano="gigante"
            lead={`${proyectos.length} · ${t.lead}`}
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proyectos.map((proyecto) => (
              <TarjetaProyectoBreve key={proyecto.slug} documento={proyecto} lang={lang} />
            ))}
          </div>
        </Banda>
      </main>

      <Pie
        github={ENLACES.github}
        linkedin={ENLACES.linkedin}
        behance={ENLACES.behance}
        ano={new Date().getFullYear()}
        lang={lang}
        currentSlug="proyectos"
      />

      <Telemetria />
    </>
  );
}
