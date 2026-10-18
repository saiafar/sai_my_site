import Link from 'next/link';
import { getDictionary, type Lang } from '@/lib/i18n';

/**
 * Pie.
 *
 * Es también la navegación de salida: la cabecera vive dentro del hero y se va
 * con él, así que quien llega abajo tiene aquí los destinos del sitio, el
 * cambio de idioma y los perfiles externos. Un pie que solo pone el año obliga
 * a volver arriba.
 */
export function Pie({
  github,
  linkedin,
  behance,
  ano,
  lang = 'es',
  currentSlug,
}: {
  github?: string;
  linkedin?: string;
  behance?: string;
  ano: number;
  lang?: Lang;
  currentSlug?: string;
}) {
  const dict = getDictionary(lang);
  const otroIdioma = currentSlug ? `/${dict.otherLang}/${currentSlug}` : `/${dict.otherLang}`;

  const internos = [
    { texto: dict.nav.work, href: `/${lang}#trabajo` },
    { texto: dict.nav.lab, href: `/${lang}#lab` },
    { texto: dict.nav.journey, href: `/${lang}#trayectoria` },
    { texto: dict.nav.faq, href: `/${lang}/preguntas` },
    { texto: dict.nav.ask, href: `/${lang}#preguntar` },
  ];

  const externos = [
    { texto: 'LinkedIn', href: linkedin },
    { texto: 'Behance', href: behance },
    { texto: 'GitHub', href: github },
  ].filter((enlace): enlace is { texto: string; href: string } => Boolean(enlace.href));

  return (
    <footer className="bg-noche text-ink-inverso">
      <div className="mx-auto flex max-w-ancho flex-wrap items-center justify-between gap-x-8 gap-y-6 px-6 py-10 font-mono text-[12px] sm:px-8 sm:text-[13px]">
        <nav aria-label={dict.nav.about} className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {internos.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="text-ink-inverso-muted hover:text-ink-inverso">
              {enlace.texto}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-inverso-muted">
          {externos.map((enlace) => (
            <a
              key={enlace.texto}
              href={enlace.href}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-ink-inverso"
            >
              {enlace.texto}
            </a>
          ))}
          <Link href={otroIdioma} lang={dict.otherLang} className="hover:text-ink-inverso">
            {dict.otherLangLabel}
          </Link>
          <span className="text-ink-inverso-faint">© {ano} Rafaías Villán</span>
        </div>
      </div>
    </footer>
  );
}
