import Link from 'next/link';
import { Pildora } from './pildora';
import { getDictionary, type Lang } from '@/lib/i18n';
import type { Tono } from '@/lib/site/tonos';

/**
 * Cabecera.
 *
 * En la portada vive dentro del escenario del hero, sobre la ilustración: se ve
 * mientras la escena dura y se va con ella. No es una barra fija. Un sitio cuyo
 * primer gesto es una ilustración a pantalla completa no debería tener una barra
 * tapándola a lo largo de toda la página, y los destinos vuelven a estar al
 * alcance en el pie.
 *
 * El menú de móvil es un `<details>` y no un estado de React: se abre y se
 * cierra sin JavaScript, el navegador se encarga del teclado y la cabecera
 * entera sigue siendo un componente de servidor.
 */
export function BarraSuperior({
  github,
  linkedin,
  lang = 'es',
  currentSlug,
  tono = 'crema',
  disponible = false,
}: {
  github?: string;
  linkedin?: string;
  lang?: Lang;
  /** Ficha abierta: el selector de idioma salta a la misma ficha en el otro. */
  currentSlug?: string;
  tono?: Tono;
  /** Muestra el distintivo de disponibilidad. Solo en la portada. */
  disponible?: boolean;
}) {
  const dict = getDictionary(lang);
  const sobreOscuro = tono === 'noche';
  const otroIdioma = currentSlug ? `/${dict.otherLang}/${currentSlug}` : `/${dict.otherLang}`;

  const destinos = [
    { texto: dict.nav.work, href: `/${lang}#trabajo` },
    { texto: dict.nav.creative, href: `/${lang}#creativo` },
    { texto: dict.nav.lab, href: `/${lang}#lab` },
    { texto: dict.nav.journey, href: `/${lang}#trayectoria` },
  ];

  const base = sobreOscuro
    ? 'border-crema/20 bg-tinta/60 text-ink-inverso'
    : 'border-tinta/20 bg-crema/70 text-ink';

  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/${lang}`}
          aria-label={dict.nav.about}
          className="transition-opacity hover:opacity-80"
        >
          <img
            src="/logo.svg"
            alt=""
            width={32}
            height={32}
            className={`size-8 ${sobreOscuro ? 'brightness-0 invert' : ''}`}
          />
        </Link>

        {disponible ? (
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[12px] backdrop-blur-sm sm:text-[13px] ${base}`}
          >
            <span aria-hidden className="size-2 rounded-full bg-verde" />
            {dict.hero.badge}
          </span>
        ) : null}

        {/* Selector de idioma: el idioma actual no es un enlace a sí mismo. */}
        <div
          role="group"
          aria-label={dict.langLabel}
          className={`inline-flex overflow-hidden rounded-full border font-mono text-[12px] backdrop-blur-sm sm:text-[13px] ${base}`}
        >
          <span aria-current="true" className="bg-crema px-3 py-2 font-bold text-tinta">
            {dict.langLabel}
          </span>
          <Link href={otroIdioma} lang={dict.otherLang} className="px-3 py-2 hover:underline">
            {dict.otherLangLabel}
          </Link>
        </div>
      </div>

      {/* Navegación completa a partir de pantalla ancha. */}
      <nav aria-label={dict.nav.about} className="hidden flex-wrap items-center gap-2 lg:flex">
        {destinos.map((destino) => (
          <Pildora key={destino.href} href={destino.href} variante="crema">
            {destino.texto}
          </Pildora>
        ))}
        <Pildora href={`/${lang}#preguntar`} variante="lila">
          {dict.nav.askSite}
        </Pildora>
        <Pildora href={`/${lang}#contacto`} variante="naranja">
          {dict.nav.contact} →
        </Pildora>
      </nav>

      {/* Y hasta ahí, a pantalla completa.

          Sigue siendo un `<details>`: se abre y se cierra sin JavaScript y el
          navegador se encarga del teclado. Lo único que cambia es que el panel
          se fija a toda la ventana, que es donde un menú de móvil se lee —los
          destinos a cuerpo de titular, numerados— en lugar de en una cajita en
          una esquina. El propio resumen hace de botón de cerrar, por encima del
          panel. */}
      <details className="acordeon group lg:hidden">
        <summary
          className={`relative z-50 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[13px] font-bold backdrop-blur-sm ${base}`}
        >
          <span aria-hidden className="acordeon-signo text-[15px] leading-none">
            +
          </span>
          <span className="group-open:hidden">{dict.nav.menu}</span>
          <span className="hidden group-open:inline">{dict.nav.close}</span>
        </summary>

        <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-noche px-6 pb-8 pt-24 text-ink-inverso">
          <nav aria-label={dict.nav.menu} className="flex flex-col border-t border-noche-line-strong">
            {[
              ...destinos,
              { texto: dict.nav.askSite, href: `/${lang}#preguntar` },
              { texto: dict.nav.about, href: `/${lang}#sobre` },
            ].map((destino, indice) => (
              <Link
                key={destino.href}
                href={destino.href}
                className="flex items-baseline justify-between gap-4 border-b border-noche-line-strong py-4 text-[32px] font-extrabold leading-none tracking-[-0.035em] sm:text-[38px]"
              >
                <span>{destino.texto}</span>
                <span aria-hidden className="font-mono text-[12px] font-normal text-ink-inverso-faint">
                  {String(indice + 1).padStart(2, '0')}
                </span>
              </Link>
            ))}
          </nav>

          <Link
            href={`/${lang}#contacto`}
            className="mt-7 rounded-full bg-naranja px-6 py-4 text-center text-[17px] font-extrabold text-tinta"
          >
            {dict.nav.contact} →
          </Link>

          <div className="mt-auto flex gap-4 pt-10 font-mono text-[13px] text-ink-inverso-faint">
            {linkedin ? (
              <a href={linkedin} target="_blank" rel="noreferrer noopener">
                LinkedIn
              </a>
            ) : null}
            {github ? (
              <a href={github} target="_blank" rel="noreferrer noopener">
                GitHub
              </a>
            ) : null}
          </div>
        </div>
      </details>

    </header>
  );
}
