import Link from 'next/link';
import { getDictionary, type Lang } from '@/lib/i18n';

/**
 * Barra de navegación mínima con soporte multilingüe.
 */
export function BarraSuperior({
  github,
  linkedin,
  sobreImagen = false,
  lang = 'es',
  currentSlug,
}: {
  github?: string;
  linkedin?: string;
  /**
   * La barra empieza transparente, sobre la imagen del hero, y recupera su fondo
   * al hacer scroll. Solo en la portada: escena-hero.tsx es quien actualiza --p.
   */
  sobreImagen?: boolean;
  lang?: Lang;
  currentSlug?: string;
}) {
  const dict = getDictionary(lang);
  const otherLang = dict.otherLang;
  const targetHref = currentSlug ? `/${otherLang}/${currentSlug}` : `/${otherLang}`;

  const enlaces = [
    { texto: dict.nav.projects, href: `/${lang}#proyectos` },
    { texto: dict.nav.experience, href: `/${lang}#experiencia` },
    { texto: dict.nav.stack, href: `/${lang}#stack` },
    { texto: dict.nav.ask, href: `/${lang}#asistente` },
  ];

  return (
    <header
      data-escena-barra={sobreImagen ? '' : undefined}
      style={sobreImagen ? ({ '--p': 0 } as React.CSSProperties) : undefined}
      className="sticky top-0 z-50 h-[var(--altura-barra)]"
    >
      <div
        aria-hidden
        className="barra-fondo absolute inset-0 border-b border-line/60 bg-ground/70 backdrop-blur-md"
      />
      <nav className="relative mx-auto flex h-full max-w-lectura items-center justify-between px-6">
        <Link href={`/${lang}`} aria-label={dict.nav.ask} className="transition-opacity hover:opacity-80">
          <img src="/logo.svg" alt="" width={24} height={24} className="size-6" />
        </Link>

        <div className="flex items-center gap-4 text-xs text-ink-muted sm:gap-5">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="hidden transition-colors hover:text-ink sm:inline"
            >
              {enlace.texto}
            </Link>
          ))}

          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-ink"
            >
              LinkedIn
            </a>
          ) : null}

          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden transition-colors hover:text-ink sm:inline"
            >
              GitHub
            </a>
          ) : null}

          <Link
            href={`/${lang}#contacto`}
            className="rounded-md border border-line-strong px-3 py-1.5 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {dict.nav.contact}
          </Link>

          {/* Selector de idioma */}
          <Link
            href={targetHref}
            aria-label={`Cambiar idioma a ${dict.otherLangLabel}`}
            className="rounded border border-line px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted transition-colors hover:border-accent hover:text-accent"
          >
            {dict.otherLangLabel}
          </Link>
        </div>
      </nav>
    </header>
  );
}
