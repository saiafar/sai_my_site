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
 * Al abrir la página la imagen ocupa la ventana entera, por detrás también de
 * la barra superior, con un velo mínimo: es la protagonista. A medida que se
 * hace scroll se oscurece y se funde con el color de la página, de modo que
 * cuando el texto llega a su sitio ya no queda imagen detrás de él y la
 * legibilidad no depende de ningún velo intermedio.
 *
 * Cada capa de oscurecimiento tiene una opacidad ligada al recorrido (--p, ver
 * globals.css). Se hace con capas del color del fondo y no con una máscara
 * animada porque la opacidad la resuelve el compositor sin repintar la imagen
 * en cada fotograma; y como la capa de cierre llega al color exacto de la
 * página, el resultado es indistinguible de recortar la imagen.
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

  // Con object-fit: cover, en una ventana más estrecha que la imagen el ancho
  // que se pinta no es el de la ventana sino el alto multiplicado por la
  // proporción de la imagen. Declarar "100vw" haría que un móvil en vertical
  // descargase la versión de 828 px y la estirase más de tres veces.
  const proporcion = `${capa.ancho}/${capa.alto}`;
  const alturaPintada = Math.ceil((capa.ancho / capa.alto) * 104);
  const sizes = `(max-aspect-ratio: ${proporcion}) ${alturaPintada}vh, 100vw`;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 overflow-hidden"
      // Sube por detrás de la barra superior: la imagen cubre la ventana entera.
      style={{ top: 'calc(-1 * var(--altura-barra))' }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(capa, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(capa, 'webp')} sizes={sizes} />
        <img
          src={mayor?.ruta ?? ''}
          alt=""
          width={capa.ancho}
          height={capa.alto}
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
          style={{
            // La miniatura incrustada de 122 bytes pinta el color correcto antes
            // de que llegue la imagen real: sin ella el hero arranca en negro y
            // el cambio se percibe como un parpadeo.
            backgroundImage: `url(${capa.lqip})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </picture>

      {/* Velo uniforme: casi nada al principio, el 60 % al final. La
          ilustración es muy saturada y, con el texto encima, sin bajarle la
          luminosidad no se leería por mucho contraste de color que hubiera. */}
      <div className="escena-velo absolute inset-0 bg-ground" />

      {/* Oscurece la franja de la barra superior mientras esta es transparente,
          para que los enlaces se lean sobre cualquier zona de la imagen. */}
      <div className="escena-cabecera absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ground/70 to-transparent" />

      {/* Fundido inferior permanente: la imagen nunca termina en una línea. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-ground" />

      {/* Cierre. Al final del recorrido el borde inferior del telón coincide
          con el del bloque del nombre, así que este degradado alcanza el color
          de la página justo antes del logo: por encima la imagen sigue viéndose
          velada, y por debajo, donde empieza el texto, ya no hay imagen. */}
      <div className="escena-cierre absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,var(--color-ground)_90%)]" />

      {/* Los laterales se cierran también: enmarca la columna central y evita
          que la imagen toque los bordes de la ventana. */}
      <div className="escena-vineta absolute inset-0 bg-[radial-gradient(ellipse_70%_85%_at_50%_35%,transparent,var(--color-ground))]" />
    </div>
  );
}
