import { Titular } from './seccion';
import { Pildora } from './pildora';
import type { PreguntaSitio } from '@/lib/site/sobre-el-sitio';
import { getDictionary, type Lang } from '@/lib/i18n';

/**
 * «Sobre este sitio».
 *
 * Acordeón con `<details>`: el contenido viaja en el HTML aunque esté plegado,
 * así que un buscador —y un rastreador de IA, que no ejecuta JavaScript— lo lee
 * igual. Es justo lo que interesa de esta sección: es la que explica que las
 * respuestas del asistente son verificables.
 */
export function SobreElSitio({
  preguntas,
  github,
  lang = 'es',
}: {
  preguntas: readonly PreguntaSitio[];
  github?: string;
  lang?: Lang;
}) {
  const dict = getDictionary(lang);

  return (
    <>
      <Titular
        kicker={dict.sections.about.kicker}
        titulo={dict.sections.about.title}
        descripcion={dict.sections.about.desc}
      />

      <div className="mt-10 border-t border-line">
        {preguntas.map((entrada) => (
          <details key={entrada.pregunta} className="acordeon border-b border-line py-5">
            <summary className="flex items-baseline gap-4 text-[17px] font-semibold leading-snug sm:text-[19px]">
              <span aria-hidden className="acordeon-signo font-mono text-[18px] leading-none text-accent">
                +
              </span>
              {entrada.pregunta}
            </summary>
            <p className="mt-4 max-w-3xl pl-8 text-[15px] leading-relaxed text-ink-muted sm:text-[17px]">
              {entrada.respuesta}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Pildora href={`/${lang}/preguntas`} variante="tinta">
          {dict.sections.about.allCta}
        </Pildora>
        {github ? (
          <Pildora href={github} variante="contorno" externo>
            {dict.sections.about.codeCta}
          </Pildora>
        ) : null}
      </div>
    </>
  );
}
