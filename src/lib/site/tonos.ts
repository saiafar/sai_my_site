/**
 * Los cuatro tonos de superficie del sitio.
 *
 * El rediseño no separa secciones con filetes: las separa cambiando el fondo.
 * Cada sección se declara en uno de estos cuatro tonos y hereda de él todos sus
 * colores —texto, texto apagado, líneas, acento y chips—, de modo que una
 * sección se puede mover de sitio o cambiar de tono sin repasar el color de
 * cada elemento que contiene.
 *
 * El acento merece una nota. Sobre crema es el naranja de marca; sobre noche es
 * su versión clara, porque el de marca sobre un fondo casi negro pierde
 * luminosidad; y sobre naranja o lila no hay acento posible —competiría con el
 * propio fondo—, así que lo que destaca pasa a ser la tinta.
 */
export type Tono = 'noche' | 'naranja' | 'crema' | 'lila';

/** Orden en que se alternan las bandas de proyecto. */
export const CICLO_TONOS: readonly Tono[] = ['noche', 'naranja', 'crema', 'lila'] as const;

export interface ClasesTono {
  /** Fondo y color de texto base de la sección. */
  fondo: string;
  /** Texto secundario: descripciones, cuerpo largo. */
  apagado: string;
  /** Texto terciario: anotaciones, pies, metadatos. */
  tenue: string;
  /** Lo que se quiere que destaque: números de sección, enlaces. */
  acento: string;
  /** Bordes de separación. */
  linea: string;
  /** Chip o píldora de etiqueta sobre este fondo. */
  chip: string;
  /** Superficie de una tarjeta levantada sobre este fondo. */
  tarjeta: string;
  /** Color con el que pintar la onda que lleva *hacia* este tono. */
  onda: string;
  /** El punto que cierra cada titular. Sobre naranja y lila no puede ser naranja. */
  punto: string;
}

export const TONOS: Record<Tono, ClasesTono> = {
  noche: {
    fondo: 'bg-noche text-ink-inverso',
    apagado: 'text-ink-inverso-muted',
    tenue: 'text-ink-inverso-faint',
    acento: 'text-naranja-claro',
    linea: 'border-noche-line-strong',
    chip: 'border border-noche-line-strong text-ink-inverso-muted',
    tarjeta: 'bg-noche-surface border border-noche-line',
    onda: 'text-noche',
    punto: 'text-naranja',
  },
  naranja: {
    fondo: 'bg-naranja text-tinta',
    apagado: 'text-tinta/75',
    tenue: 'text-tinta/60',
    acento: 'text-tinta',
    linea: 'border-tinta/25',
    chip: 'border border-tinta/30 text-tinta',
    tarjeta: 'bg-crema border border-tinta/15',
    onda: 'text-naranja',
    punto: 'text-crema',
  },
  crema: {
    fondo: 'bg-crema text-ink',
    apagado: 'text-ink-muted',
    tenue: 'text-ink-faint',
    acento: 'text-accent',
    linea: 'border-line',
    chip: 'border border-line text-ink-muted',
    tarjeta: 'bg-surface border border-line',
    onda: 'text-crema',
    punto: 'text-accent',
  },
  lila: {
    fondo: 'bg-lila text-tinta',
    apagado: 'text-tinta/75',
    tenue: 'text-tinta/60',
    acento: 'text-tinta',
    linea: 'border-tinta/25',
    chip: 'border border-tinta/30 text-tinta',
    tarjeta: 'bg-crema border border-tinta/15',
    onda: 'text-lila',
    punto: 'text-crema',
  },
};
