import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { BarraSuperior } from '@/components/barra-superior';
import { Etiqueta } from '@/components/etiqueta';
import { formatPeriod, getBySlug } from '@/lib/site/queries';

/**
 * Ficha de detalle, común a proyectos, experiencias, tecnologías y notas.
 *
 * Una sola ruta comodín en lugar de cuatro carpetas porque el `slug` de un
 * documento ya es su ruta —«proyectos/migracion-erp»—, así que la URL cae por
 * su propio peso y no hay que mantener una tabla de correspondencias. Estas
 * URL son además las que el asistente enlaza al citar una fuente: cada
 * afirmación lleva a la página donde se puede comprobar.
 */
export const dynamic = 'force-dynamic';

const GITHUB = 'https://github.com/saiafar/sai_my_site';

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const documento = await getBySlug(slug.join('/'));
  if (!documento) return { title: 'No encontrado' };

  return {
    title: `${documento.title} — Rafaias Villán`,
    ...(documento.summary ? { description: documento.summary } : {}),
  };
}

export default async function Ficha({ params }: Props) {
  const { slug } = await params;
  const documento = await getBySlug(slug.join('/'));
  if (!documento) notFound();

  const periodo = formatPeriod(documento.startsOn, documento.endsOn);
  const organizacion =
    typeof documento.metadata['organizacion'] === 'string'
      ? documento.metadata['organizacion']
      : null;
  const rol = typeof documento.metadata['rol'] === 'string' ? documento.metadata['rol'] : null;

  // El Markdown procede del repositorio, no de una entrada de usuario: es
  // contenido propio y versionado, así que no hay superficie de inyección que
  // sanear aquí.
  const html = await marked.parse(documento.body);

  return (
    <>
      <BarraSuperior github={GITHUB} />

      <main className="mx-auto max-w-lectura px-6 pb-24 pt-12">
        <Link
          href="/"
          className="text-[11px] text-ink-faint transition-colors hover:text-ink-muted"
        >
          ← Volver
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

        {/* Los estilos del cuerpo se declaran aquí y no con un plugin de
            tipografía: son quince reglas, todas usan los mismos tokens que el
            resto del sitio y así no se introduce una segunda escala tipográfica
            que mantener en paralelo. */}
        <article
          className="prose-sitio mt-8 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </>
  );
}
