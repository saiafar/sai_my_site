import Link from 'next/link';

/**
 * Etiqueta de tecnología.
 *
 * Diminuta y en mayúsculas, como los distintivos de formato de la referencia.
 * A este tamaño el texto deja de leerse palabra a palabra y pasa a funcionar
 * como textura reconocible, que es justo lo que se quiere de una lista de
 * catorce tecnologías bajo una tarjeta.
 */
export function Etiqueta({ children, href }: { children: React.ReactNode; href?: string }) {
  const clases =
    'inline-flex items-center rounded border border-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint transition-colors';

  return href ? (
    <Link href={href} className={`${clases} hover:border-line-strong hover:text-ink-muted`}>
      {children}
    </Link>
  ) : (
    <span className={clases}>{children}</span>
  );
}
