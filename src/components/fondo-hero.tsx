import manifiesto from '../../public/fondos/manifiesto.json';

interface Variante { formato: string; ancho: number; ruta: string; bytes: number }
interface Capa {
  escena: string; capa: string; orden: number; ancho: number; alto: number;
  transparente: boolean; variantes: Variante[]; lqip: string;
}

const capas = manifiesto as Capa[];

/**
 * Cuánto se separan entre sí, en svh, la capa más lejana y la más cercana a lo
 * largo del recorrido. Su valor real está en globals.css, con una media query;
 * aquí se repite la cota superior porque el cálculo de `sizes` necesita saber
 * cuánto más alta que la ventana se pinta la imagen, y pasarse por arriba solo
 * hace que un móvil descargue la variante siguiente.
 */
const DESFASE_VH = 10;

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
 * La escena no es una imagen sino una pila de capas recortadas —fondo, laderas
 * intermedias, vegetación en primer plano— que al hacer scroll no se desplazan
 * a la vez: cuanto más lejos está una capa, más se rezaga respecto a la página,
 * y esa diferencia de velocidad es lo que se lee como profundidad. El orden y
 * la velocidad salen del propio manifiesto (el número que lleva el nombre de cada
 * fichero, ver scripts/optimize-assets.ts), así que añadir una capa intermedia
 * no obliga a tocar este componente. Con una sola capa no hay nada
 * que desfasar y el telón se comporta como la imagen plana que era.
 *
 * Cada capa de oscurecimiento tiene una opacidad ligada al recorrido (--p, ver
 * globals.css). Se hace con capas del color del fondo y no con una máscara
 * animada porque la opacidad la resuelve el compositor sin repintar la imagen
 * en cada fotograma; y como la capa de cierre llega al color exacto de la
 * página, el resultado es indistinguible de recortar la imagen.
 */
export function FondoHero({ escena = 'atardecer' }: { escena?: string }) {
  const pila = capas.filter((c) => c.escena === escena).sort((a, b) => a.orden - b.orden);
  if (pila.length === 0) return null;

  const fondo = pila[0]!;
  const parallax = pila.length > 1;

  // Con object-fit: cover, en una ventana más estrecha que la imagen el ancho
  // que se pinta no es el de la ventana sino el alto multiplicado por la
  // proporción de la imagen. Declarar "100vw" haría que un móvil en vertical
  // descargase la versión de 828 px y la estirase más de tres veces.
  const proporcion = `${fondo.ancho}/${fondo.alto}`;
  // El movimiento se reparte alrededor del punto medio, así que la caja crece
  // el desfase una sola vez y no dos (ver .escena-capa en globals.css).
  const alturaCaja = 104 + (parallax ? DESFASE_VH : 0);
  const alturaPintada = Math.ceil((fondo.ancho / fondo.alto) * alturaCaja);
  const sizes = `(max-aspect-ratio: ${proporcion}) ${alturaPintada}vh, 100vw`;

  return (
    <div
      aria-hidden
      className={`escena-telon pointer-events-none absolute inset-x-0 bottom-0 -z-10 overflow-hidden${
        parallax ? ' escena-telon-parallax' : ''
      }`}
      // Sube por detrás de la barra superior: la imagen cubre la ventana entera.
      style={{ top: 'calc(-1 * var(--altura-barra))' }}
    >
      {pila.map((capa, i) => (
        <picture
          key={capa.capa}
          className="escena-capa"
          style={
            {
              // 1 la capa del fondo, 0 la del primer plano: la primera se
              // rezaga la holgura entera y la última va pegada a la página.
              // Repartido así, dos capas ya bastan para que haya profundidad.
              // Las capas se apilan por orden de documento, sin z-index: los
              // velos que vienen detrás tienen que quedar por encima de todas.
              '--profundidad': pila.length > 1 ? (pila.length - 1 - i) / (pila.length - 1) : 0,
            } as React.CSSProperties
          }
        >
          <source type="image/avif" srcSet={srcSet(capa, 'avif')} sizes={sizes} />
          <source type="image/webp" srcSet={srcSet(capa, 'webp')} sizes={sizes} />
          <img
            src={capa.variantes.filter((v) => v.formato === 'webp').sort((a, b) => b.ancho - a.ancho)[0]?.ruta ?? ''}
            alt=""
            width={capa.ancho}
            height={capa.alto}
            className="h-full w-full object-cover object-center"
            fetchPriority={i === 0 ? 'high' : undefined}
            style={
              // La miniatura incrustada de 122 bytes pinta el color correcto
              // antes de que llegue la imagen real: sin ella el hero arranca en
              // negro y el cambio se percibe como un parpadeo. Solo tiene
              // sentido en la capa del fondo; en una capa recortada, cuyo
              // contenido ocupa una esquina, la miniatura ampliada sería una
              // mancha que taparía lo que hay debajo.
              capa.transparente
                ? undefined
                : {
                    backgroundImage: `url(${capa.lqip})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
            }
          />
        </picture>
      ))}

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
