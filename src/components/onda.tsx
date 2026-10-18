import { TONOS, type Tono } from '@/lib/site/tonos';

/**
 * Transición entre dos bandas de color.
 *
 * Cuatro curvas distintas que se van alternando: con una sola, un visitante que
 * recorre la página entera vería el mismo borde cuatro veces y dejaría de
 * leerse como un recorte hecho a mano.
 *
 * La onda se pinta con `currentColor` y el color llega como clase de texto, no
 * como atributo `fill`: así el color del siguiente tono sale de la misma tabla
 * que el resto del sistema y no hay un hexadecimal suelto en el marcado.
 */
const FORMAS = [
  'M0 50 C 240 0 480 100 720 50 S 1200 0 1440 40 V90 H0 Z',
  'M0 40 C 300 100 600 0 900 50 S 1300 90 1440 30 V90 H0 Z',
  'M0 60 C 360 0 720 100 1080 40 S 1380 30 1440 50 V90 H0 Z',
  'M0 30 C 300 90 700 0 1000 60 S 1350 40 1440 60 V90 H0 Z',
] as const;

export function Onda({ hacia, forma = 0 }: { hacia: Tono; forma?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className={`block h-[60px] w-full sm:h-[90px] ${TONOS[hacia].onda}`}
    >
      <path d={FORMAS[forma % FORMAS.length]} fill="currentColor" />
    </svg>
  );
}
