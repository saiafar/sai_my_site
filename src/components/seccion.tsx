import { TONOS, type Tono } from '@/lib/site/tonos';
import { Onda } from './onda';

/**
 * Banda de sección.
 *
 * Una sección del rediseño es una franja de color de ancho completo con su
 * contenido centrado en la rejilla de 1376 px. El color no es decoración: es el
 * separador. Por eso no hay filetes entre secciones y por eso la banda, y no
 * cada componente de dentro, es la que decide los colores (ver tonos.ts).
 *
 * `onda` dibuja la transición hacia la sección siguiente. Hay que decirle hacia
 * qué tono va, no desde cuál viene, porque lo que la onda pinta es el color que
 * entra invadiendo el que se va.
 */
export function Banda({
  id,
  tono = 'crema',
  onda,
  compacta = false,
  children,
  className = '',
}: {
  id?: string;
  tono?: Tono;
  onda?: { hacia: Tono; forma?: number };
  /** Menos aire arriba y abajo: para las bandas que son solo una cabecera. */
  compacta?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const t = TONOS[tono];
  const aire = compacta ? 'py-14 sm:py-20' : 'py-20 sm:py-32';

  return (
    <section id={id} data-aparecer className={`scroll-mt-4 ${t.fondo} ${className}`}>
      <div className={`mx-auto w-full max-w-ancho px-6 sm:px-8 ${aire}`}>{children}</div>
      {onda ? <Onda hacia={onda.hacia} forma={onda.forma ?? 0} /> : null}
    </section>
  );
}

/**
 * El punto que cierra los titulares.
 *
 * Es la marca de la casa y aparece en todos: nombre, secciones y portadas de
 * ficha. Va en un componente porque su color depende del fondo —sobre naranja
 * un punto naranja no existiría— y resolverlo a mano en cada titular es
 * exactamente como se acaba con uno de otro color.
 */
export function Punto({ tono = 'crema' }: { tono?: Tono }) {
  return <span className={TONOS[tono].punto}>.</span>;
}

/**
 * Cabecera de sección.
 *
 * Dos tamaños. `gigante` es para las secciones que abren un bloque entero de la
 * página —Proyectos, Lab, Trayectoria— y pone el titular y su anotación en la
 * misma línea de base, a los dos extremos del ancho: el titular manda y el dato
 * de la derecha se lee como una nota al pie del propio nombre. `normal` es el
 * de las secciones interiores.
 */
export function Titular({
  titulo,
  tono = 'crema',
  kicker,
  lead,
  descripcion,
  tamano = 'normal',
  derecha,
  sinPunto = false,
}: {
  titulo: string;
  tono?: Tono;
  /** Línea en monoespaciado sobre el titular. */
  kicker?: string;
  /** Anotación a la derecha del titular, en monoespaciado. */
  lead?: string;
  descripcion?: string;
  tamano?: 'gigante' | 'normal';
  /** Contenido libre alineado a la derecha (un enlace «ver todo», por ejemplo). */
  derecha?: React.ReactNode;
  sinPunto?: boolean;
}) {
  const t = TONOS[tono];
  const cuerpo =
    tamano === 'gigante'
      ? 'text-[clamp(42px,11.1vw,160px)] leading-[0.82] tracking-[-0.05em]'
      : 'text-titular';

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="max-w-3xl">
        {kicker ? (
          <p className={`font-mono text-[13px] ${t.acento}`}>{kicker}</p>
        ) : null}

        <h2 className={`font-semibold ${cuerpo} ${kicker ? 'mt-3' : ''}`}>
          {titulo}
          {sinPunto ? null : <Punto tono={tono} />}
        </h2>

        {descripcion ? (
          <p className={`mt-5 max-w-xl text-[17px] leading-relaxed sm:text-[19px] ${t.apagado}`}>
            {descripcion}
          </p>
        ) : null}
      </div>

      {lead ? <p className={`mb-3 font-mono text-[13px] sm:text-[14px] ${t.apagado}`}>{lead}</p> : null}
      {derecha ?? null}
    </div>
  );
}

/** Aviso para una sección sin contenido todavía. */
export function SeccionVacia({ mensaje, tono = 'crema' }: { mensaje: string; tono?: Tono }) {
  const t = TONOS[tono];
  return (
    <p className={`rounded-tarjeta border border-dashed px-5 py-8 text-[15px] ${t.linea} ${t.tenue}`}>
      {mensaje}
    </p>
  );
}
