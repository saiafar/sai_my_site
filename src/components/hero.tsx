import { FondoHero } from './fondo-hero';
import { BarraSuperior } from './barra-superior';
import { Punto } from './seccion';
import { ENLACES } from '@/lib/site/enlaces';
import { env } from '@/lib/env';
import { getDictionary, type Lang } from '@/lib/i18n';

/**
 * Portada.
 *
 * Un escenario fijo del alto de la ventana dentro de una pista más larga: la
 * página se desplaza, el escenario se queda, y lo que hay dentro —las capas de
 * la ilustración, el logo, el nombre y el texto— se mueve en función de cuánto
 * se ha recorrido. Las tres variables del recorrido las escribe escena-hero.tsx
 * y todo lo que ocurre con ellas está declarado en globals.css.
 *
 * El nombre entra grande y blanco sobre la ilustración, y a medida que la imagen
 * se oscurece el logo recupera su color y el bloque se asienta para dejar sitio
 * a la frase. Es la misma idea del sitio anterior, con un cambio: antes el
 * bloque salía del hero y se unía al contenido de la página; ahora la escena
 * empieza y acaba dentro del hero, y lo que sigue —la cinta— entra ya en otro
 * color. Un hero que se resuelve solo no obliga al resto de la página a
 * conocer su animación.
 */
export function Hero({
  lang = 'es',
  titular,
  subtitulo,
}: {
  lang?: Lang;
  /** Del frontmatter del perfil: la tesis y su desarrollo. */
  titular?: string | null;
  subtitulo?: string | null;
}) {
  const dict = getDictionary(lang);
  // La frase del hero es una afirmación sobre su trabajo, así que vive en el
  // corpus y no en el diccionario: se edita donde está escrita la trayectoria.
  const frase = titular?.trim() ?? null;

  return (
    <section
      data-escena
      className="hero-pista relative bg-noche"
      style={{ '--p': 0, '--m': 0, '--i': 0 } as React.CSSProperties}
    >
      {/* Sin JavaScript la escena se queda en su estado final, que es el legible:
          imagen velada, logo en color y la frase visible. */}
      <noscript>
        <style>{'[data-escena]{--p:1!important;--m:1!important;--i:1!important}'}</style>
      </noscript>

      <div className="hero-escenario flex flex-col text-ink-inverso">
        <FondoHero />

        <BarraSuperior
          github={ENLACES.github}
          linkedin={ENLACES.linkedin}
          lang={lang}
          tono="noche"
          disponible
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <div className="hero-bloque flex flex-col items-center">
            <span className="hero-logo relative block">
              {/* Dos copias del mismo logo: la blanca encima mientras la imagen
                  está clara, la de color debajo. Se cruzan a mitad del recorrido. */}
              <img
                src="/logo.svg"
                alt=""
                aria-hidden
                className="hero-logo-blanco absolute inset-0 size-full brightness-0 invert"
              />
              <img
                src="/logo.svg"
                alt=""
                aria-hidden
                className="hero-logo-color relative size-full"
              />
            </span>

            <h1 className="hero-nombre mt-7 text-portada font-extrabold sm:mt-8">
              {env.siteOwner}
              <Punto tono="noche" />
            </h1>
          </div>

          <div className="hero-intro mt-6 max-w-2xl">
            {frase ? (
              <p className="text-[22px] font-semibold leading-tight tracking-[-0.01em] sm:text-[30px]">
                {frase.replace(/\.$/, '')}
                <Punto tono="noche" />
              </p>
            ) : null}
            <p
              className={`text-[15px] leading-relaxed text-ink-inverso-muted sm:text-[17px]${
                frase ? ' mt-4' : ''
              }`}
            >
              {subtitulo?.trim() ?? dict.hero.fallbackSubtitle}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="hero-desliza absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em] sm:text-[12px]"
        >
          <span>{dict.hero.scroll}</span>
          <span className="hero-desliza-linea block h-7 w-px bg-crema" />
        </div>
      </div>
    </section>
  );
}
