import Link from 'next/link';

/**
 * Píldora.
 *
 * La unidad del sistema: 71 de los radios del rediseño son 999 px. Todo lo que
 * se pulsa, se filtra o se etiqueta tiene esta forma, y su variante dice de qué
 * clase es: el destino principal va en naranja, el asistente —que es otra cosa,
 * ni navegación ni contacto— en lila, y el resto en crema.
 *
 * Es enlace, botón o texto según lo que reciba: tres etiquetas distintas con el
 * mismo aspecto evitarían que un enlace terminara siendo un botón con un
 * manejador de clic, que es lo que rompe abrir en otra pestaña.
 */
export type VariantePildora = 'crema' | 'tinta' | 'naranja' | 'lila' | 'contorno' | 'contorno-claro';

const VARIANTES: Record<VariantePildora, string> = {
  crema: 'bg-crema text-tinta hover:bg-white',
  tinta: 'bg-tinta text-crema hover:bg-noche-raised',
  naranja: 'bg-naranja text-tinta hover:bg-naranja-honda hover:text-crema',
  lila: 'bg-lila text-tinta hover:bg-lila-honda',
  contorno: 'border border-line text-ink-muted hover:border-tinta hover:text-ink',
  'contorno-claro':
    'border border-crema/35 text-ink-inverso-muted hover:border-crema hover:text-ink-inverso',
};

export function Pildora({
  children,
  href,
  variante = 'crema',
  externo = false,
  activa,
  onClick,
  className = '',
  ...resto
}: {
  children: React.ReactNode;
  href?: string;
  variante?: VariantePildora;
  externo?: boolean;
  /** Para los filtros: marca el estado seleccionado y lo anuncia. */
  activa?: boolean;
  onClick?: () => void;
  className?: string;
} & React.AriaAttributes) {
  const clases = [
    'inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-mono text-[13px] leading-none transition-colors sm:text-[14px]',
    VARIANTES[variante],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return externo ? (
      <a href={href} target="_blank" rel="noreferrer noopener" className={clases} {...resto}>
        {children}
      </a>
    ) : (
      <Link href={href} className={clases} {...resto}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={activa}
        className={`${clases} cursor-pointer`}
        {...resto}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={clases} {...resto}>
      {children}
    </span>
  );
}
