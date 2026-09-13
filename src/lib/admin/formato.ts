/**
 * Formateo para el panel.
 *
 * Está aparte de las consultas porque es decisión de presentación: la base de
 * datos devuelve milisegundos y fechas absolutas, y cómo se lean es cosa de la
 * pantalla.
 */

/** Duración legible: «1 min 20 s», «45 s», «—» si no se llegó a medir. */
export function duracion(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return '—';
  const segundos = Math.round(ms / 1000);
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto === 0 ? `${minutos} min` : `${minutos} min ${resto} s`;
}

const FECHA = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function fecha(valor: Date | string): string {
  const d = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(d.getTime()) ? '—' : FECHA.format(d);
}

/** Día de la serie diaria, corto: «13 sep». */
export function dia(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(d);
}

export function numero(valor: number): string {
  return new Intl.NumberFormat('es-ES').format(valor);
}
