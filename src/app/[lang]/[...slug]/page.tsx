import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BarraSuperior } from '@/components/barra-superior';
import { Etiqueta } from '@/components/etiqueta';
import { Telemetria } from '@/components/telemetria';
import { DatosEstructurados } from '@/components/datos-estructurados';
import * as jsonLd from '@/lib/site/datos-estructurados';
import { formatPeriod, getBySlug } from '@/lib/site/queries';
import { ENLACES } from '@/lib/site/enlaces';
import { env } from '@/lib/env';
import { getDictionary, isValidLang, DEFAULT_LANG, type Lang } from '@/lib/i18n';
import { renderMarkdown } from '@/lib/site/markdown';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ lang: string; slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang: Lang = isValidLang(rawLang) ? rawLang : DEFAULT_LANG;
  const slugStr = slug.join('/');
  const documento = await getBySlug(slugStr, lang);
  if (!documento) return { title: 'No encontrado' };

  const titulo = `${documento.title} — Rafaías Villán`;
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

  const imagenOg = portada
    ? portada.startsWith('http')
      ? portada
      : `${env.siteUrl}${portada.startsWith('/') ? '' : '/'}${portada}`
    : undefined;

  return {
    title: titulo,
    ...(documento.summary ? { description: documento.summary } : {}),
    alternates: {
      canonical: `${env.siteUrl}/${lang}/${documento.slug}`,
      languages: {
        es: `${env.siteUrl}/es/${documento.slug}`,
        en: `${env.siteUrl}/en/${documento.slug}`,
        'x-default': `${env.siteUrl}/es/${documento.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      url: `${env.siteUrl}/${lang}/${documento.slug}`,
      title: titulo,
      ...(documento.summary ? { description: documento.summary } : {}),
      ...(imagenOg ? { images: [{ url: imagenOg, alt: portadaAlt }] } : {}),
    },
    ...(imagenOg
      ? {
          twitter: {
            card: 'summary_large_image',
            title: titulo,
            ...(documento.summary ? { description: documento.summary } : {}),
            images: [imagenOg],
          },
        }
      : {}),
  };
}

export default async function Ficha({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang: Lang = isValidLang(rawLang) ? rawLang : DEFAULT_LANG;
  const dict = getDictionary(lang);
  const slugStr = slug.join('/');
  const documento = await getBySlug(slugStr, lang);
  if (!documento) notFound();

  const periodo = formatPeriod(documento.startsOn, documento.endsOn, lang);
  const organizacion =
    typeof documento.metadata['organizacion'] === 'string'
      ? documento.metadata['organizacion']
      : typeof documento.metadata['organization'] === 'string'
        ? (documento.metadata['organization'] as string)
        : null;
  const rol =
    typeof documento.metadata['rol'] === 'string'
      ? documento.metadata['rol']
      : typeof documento.metadata['role'] === 'string'
        ? (documento.metadata['role'] as string)
        : null;

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
  const portadaPie =
    typeof documento.metadata['portada_pie'] === 'string'
      ? (documento.metadata['portada_pie'] as string)
      : typeof documento.metadata['caption'] === 'string'
        ? (documento.metadata['caption'] as string)
        : null;

  const html = await renderMarkdown(documento.body);

  return (
    <>
      <BarraSuperior
        github={ENLACES.github}
        linkedin={ENLACES.linkedin}
        lang={lang}
        currentSlug={documento.slug}
      />

      <main className="mx-auto max-w-lectura px-6 pb-24 pt-12">
        <Link
          href={`/${lang}`}
          className="group inline-flex items-center gap-1.5 text-[11px] text-ink-muted transition-colors hover:text-ink"
        >
          <span className="text-accent transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          <span>{dict.detail.back}</span>
        </Link>

        <header className="mt-6 border-b border-line pb-6">
          <p className="text-[11px] uppercase tracking-wider text-ink-faint">{documento.kind}</p>

          <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink">
            {documento.title}
          </h1>

          {[periodo, organizacion, rol].some(Boolean) ? (
            <p className="mt-2 text-[12px] text-ink-muted">
              {[periodo, organizacion, rol].filter(Boolean).join(' · ')}
            </p>
          ) : null}

          {documento.summary ? (
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
              {documento.summary}
            </p>
          ) : null}

          {documento.technologies.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1">
              {documento.technologies.map((tecnologia) => (
                <Etiqueta key={tecnologia.slug}>{tecnologia.name}</Etiqueta>
              ))}
            </div>
          ) : null}
        </header>

        {portada ? (
          <figure className="mt-8 max-w-2xl overflow-hidden rounded-xl border border-line bg-surface">
            <img
              src={portada}
              alt={portadaAlt}
              className="max-h-[500px] w-full object-cover"
            />
            {portadaPie ? (
              <figcaption className="border-t border-line/60 bg-ground/50 px-4 py-2.5 text-center text-[12px] text-ink-muted">
                {portadaPie}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <article
          className="prose-sitio mt-8 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      <Telemetria documentSlug={documento.slug} />

      <DatosEstructurados datos={jsonLd.ficha(documento, lang)} />
      <DatosEstructurados datos={jsonLd.migas(documento, lang)} />
    </>
  );
}
