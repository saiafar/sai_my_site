import type { Metadata } from 'next';
import Link from 'next/link';
import { marked } from 'marked';
import { BarraSuperior } from '@/components/barra-superior';
import { Pie } from '@/components/pie';
import { Telemetria } from '@/components/telemetria';
import { DatosEstructurados } from '@/components/datos-estructurados';
import * as jsonLd from '@/lib/site/datos-estructurados';
import { leerPreguntas } from '@/lib/site/preguntas';
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
  const titulo = lang === 'en' ? 'Frequently asked questions — Rafaías Villán' : 'Preguntas frecuentes — Rafaías Villán';
  const desc =
    lang === 'en'
      ? 'Answers regarding experience, technologies, and projects, with backing documentation for every statement.'
      : 'Respuestas sobre experiencia, tecnologías y proyectos, con el documento que respalda cada afirmación.';

  return {
    title: titulo,
    description: desc,
    alternates: {
      canonical: `${env.siteUrl}/${lang}/preguntas`,
      languages: {
        es: `${env.siteUrl}/es/preguntas`,
        en: `${env.siteUrl}/en/preguntas`,
        'x-default': `${env.siteUrl}/es/preguntas`,
      },
    },
    openGraph: {
      type: 'article',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      url: `${env.siteUrl}/${lang}/preguntas`,
      title: titulo,
      description: desc,
    },
  };
}

export default async function PreguntasPage({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang: Lang = isValidLang(rawLang) ? rawLang : DEFAULT_LANG;
  const dict = getDictionary(lang);
  const { preambulo, entradas } = await leerPreguntas(lang);

  const intro = await marked.parse(preambulo.replace(/^#\s+.*\n?/, ''));
  const respuestas = await Promise.all(
    entradas.map(async (entrada) => ({
      pregunta: entrada.pregunta,
      html: await marked.parse(entrada.respuesta),
    })),
  );

  return (
    <>
      <BarraSuperior github={ENLACES.github} linkedin={ENLACES.linkedin} lang={lang} />

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
          <h1 className="font-display text-4xl leading-tight tracking-tight text-ink">
            {lang === 'en' ? 'Frequently asked questions' : 'Preguntas frecuentes'}
          </h1>
          {intro ? (
            <div
              className="prose-sitio mt-3 max-w-2xl"
              dangerouslySetInnerHTML={{ __html: intro }}
            />
          ) : null}
        </header>

        {respuestas.length === 0 ? (
          <p className="mt-8 text-[13px] text-ink-faint">
            {lang === 'en' ? (
              <>
                No published answers yet. They are generated with <code>npm run faq -- --lang en</code> and manually reviewed before committing.
              </>
            ) : (
              <>
                Todavía no hay respuestas publicadas. Se generan con <code>npm run faq</code> y se revisan antes de commitearlas.
              </>
            )}
          </p>
        ) : (
          <div className="mt-10 space-y-10">
            {respuestas.map((entrada) => (
              <section key={entrada.pregunta}>
                <h2 className="font-display text-2xl leading-snug tracking-tight text-ink">
                  {entrada.pregunta}
                </h2>
                <div
                  className="prose-sitio mt-3 max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: entrada.html }}
                />
              </section>
            ))}
          </div>
        )}

        <Pie
          github={ENLACES.github}
          linkedin={ENLACES.linkedin}
          ano={new Date().getFullYear()}
          lang={lang}
        />
      </main>

      <Telemetria />
      <DatosEstructurados
        datos={jsonLd.preguntasFrecuentes(
          respuestas.map((r) => ({ pregunta: r.pregunta, respuestaHtml: r.html })),
          lang,
        )}
      />
    </>
  );
}
