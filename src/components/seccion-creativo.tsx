import type { PiezaCreativa } from '@/lib/site/creativo';
import { getDictionary, type Lang } from '@/lib/i18n';

/**
 * Trabajo gráfico.
 *
 * La única sección que es una galería y no texto: aquí lo que convence es ver
 * las piezas. La rejilla tiene filas de alto fijo y la primera pieza ocupa dos
 * por dos, de modo que el render que abre la sección manda y el resto se lee
 * como un muestrario. En móvil todas vuelven a una columna, incluida esa.
 *
 * El pie va encima de la imagen, en una píldora traslúcida, y no debajo: así la
 * rejilla no tiene que reservar altura para textos de longitudes distintas y
 * las piezas quedan alineadas entre sí.
 */
export function SeccionCreativo({
  piezas,
  behance,
  lang = 'es',
}: {
  piezas: readonly PiezaCreativa[];
  behance?: string;
  lang?: Lang;
}) {
  const dict = getDictionary(lang);
  const [primera, ...resto] = dict.sections.creative.title.split('|');

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-10">
        <h2 className="text-[clamp(40px,10.4vw,150px)] font-extrabold leading-[0.84] tracking-[-0.05em]">
          {primera}
          <br />
          {resto.map((parte, indice) => (
            <span key={parte} className={indice === resto.length - 1 ? 'text-lila' : ''}>
              {parte}{' '}
            </span>
          ))}
        </h2>
        <p className="max-w-md text-[17px] leading-relaxed text-ink-inverso-muted sm:text-[19px]">
          {dict.sections.creative.desc}
        </p>
      </div>

      {piezas.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4 pt-16 sm:auto-rows-[300px]">
          {piezas.map((pieza) => (
            <figure
              key={pieza.id}
              className={`relative m-0 overflow-hidden rounded-tarjeta bg-noche-raised${
                pieza.destacada ? ' sm:col-span-2 sm:row-span-2' : ''
              }`}
            >
              <img
                src={pieza.imagen}
                alt={pieza.alt}
                loading="lazy"
                className="block size-full max-sm:aspect-4/3 object-cover"
              />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-tinta/80 px-2.5 py-1.5 font-mono text-[12px] backdrop-blur-sm">
                {pieza.pie}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {behance ? (
        <p className="mt-8 text-right">
          <a
            href={behance}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[15px] text-lila hover:underline"
          >
            {dict.sections.creative.cta}
          </a>
        </p>
      ) : null}
    </>
  );
}
