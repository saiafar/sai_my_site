import manifiesto from '../../public/fondos/manifiesto.json';

interface Variante { formato: string; ancho: number; ruta: string; bytes: number }
interface Capa {
  escena: string; capa: string; ancho: number; alto: number;
  transparente: boolean; variantes: Variante[]; lqip: string;
}

const capas = manifiesto as Capa[];

function srcSet(capa: Capa, formato: string): string {
  return capa.variantes
    .filter((v) => v.formato === formato)
    .sort((a, b) => a.ancho - b.ancho)
    .map((v) => `${v.ruta} ${v.ancho}w`)
    .join(', ');
}

/**
 * Telón del hero.
 *
 * La imagen ocupa la parte alta y se disuelve hacia el fondo antes de que
 * empiece el contenido. Es lo que permite conservar una ilustración muy
 * saturada sin comprometer la legibilidad de nada: donde hay texto denso ya no
 * hay imagen, así que no hacen falta velos que la apaguen ni desenfoques que la
 * destruyan.
 *
 * Las rutas salen del manifiesto que genera `npm run assets`, de modo que
 * añadir o reoptimizar una escena no obliga a tocar este componente.
 */
export function FondoHero({ escena = 'atardecer' }: { escena?: string }) {
  const capa = capas.find((c) => c.escena === escena && c.capa === 'base');
  if (!capa) return null;

  const mayor = capa.variantes
    .filter((v) => v.formato === 'webp')
    .sort((a, b) => b.ancho - a.ancho)[0];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden"
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(capa, 'avif')} sizes="100vw" />
        <source type="image/webp" srcSet={srcSet(capa, 'webp')} sizes="100vw" />
        <img
          src={mayor?.ruta ?? ''}
          alt=""
          width={capa.ancho}
          height={capa.alto}
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
          style={{
            // La disolución se hace con una máscara sobre la propia imagen, no
            // con un degradado encima. Un degradado superpuesto solo la oscurece
            // —sigue estando ahí, compitiendo con el texto—; la máscara la
            // elimina de verdad, así que por debajo del 82% de este bloque el
            // fondo es exactamente el color de la página.
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 30%, transparent 82%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 30%, transparent 82%)',
            // La miniatura incrustada de 122 bytes pinta el color correcto antes
            // de que llegue la imagen real: sin ella el hero arranca en negro y
            // el cambio se percibe como un parpadeo.
            backgroundImage: `url(${capa.lqip})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </picture>

      {/* Velo uniforme. La ilustración es muy saturada y el titular cae justo
          sobre las nubes más brillantes: sin bajarle la luminosidad, el texto
          se lee a duras penas por mucho contraste de color que haya. */}
      <div className="absolute inset-0 bg-ground/60" />

      {/* Cierre hacia el color de la página, para que el borde inferior de la
          máscara no se perciba como una línea. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ground/40 to-ground" />

      {/* Los laterales se cierran también: enmarca la columna central y evita
          que la imagen toque los bordes de la ventana. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_80%_at_50%_20%,transparent,var(--color-ground))]" />
    </div>
  );
}
