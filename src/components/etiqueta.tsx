import Link from 'next/link';
import { TONOS, type Tono } from '@/lib/site/tonos';

/**
 * Etiqueta de tecnología.
 *
 * Píldora de contorno en monoespaciado: la misma forma que el resto de lo que
 * se pulsa, pero sin relleno, porque una fila de seis etiquetas rellenas
 * competiría con el titular de la tarjeta que las lleva debajo.
 *
 * El contorno y el color salen del tono de la banda y no del componente: la
 * misma etiqueta aparece sobre crema, sobre noche y sobre naranja.
 */
export function Etiqueta({
  children,
  href,
  tono = 'crema',
  destacada = false,
  className = '',
}: {
  children: React.ReactNode;
  href?: string;
  tono?: Tono;
  /** Resalta la etiqueta: se usa para el «+N» que cierra una fila. */
  destacada?: boolean;
  className?: string;
}) {
  const t = TONOS[tono];
  const clases = [
    'inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-[12px] leading-none sm:text-[13px]',
    destacada ? `${t.chip} ${t.acento}` : t.chip,
    'transition-colors',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return href ? (
    <Link href={href} className={`${clases} hover:border-current`}>
      {children}
    </Link>
  ) : (
    <span className={clases}>{children}</span>
  );
}
