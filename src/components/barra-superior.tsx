import Link from 'next/link';

const ENLACES = [
  { texto: 'Proyectos', href: '/#proyectos' },
  { texto: 'Experiencia', href: '/#experiencia' },
  { texto: 'Stack', href: '/#stack' },
  { texto: 'Preguntar', href: '/#asistente' },
];

/**
 * Barra de navegación mínima.
 *
 * Deliberadamente discreta: en la referencia la navegación es texto pequeño y
 * apagado que no compite con el titular. El único elemento con contorno es la
 * acción que interesa que se pulse.
 */
export function BarraSuperior({
  github,
  linkedin,
  sobreImagen = false,
}: {
  github?: string;
  linkedin?: string;
  /**
   * La barra empieza transparente, sobre la imagen del hero, y recupera su fondo
   * al hacer scroll. Solo en la portada: escena-hero.tsx es quien actualiza --p.
   */
  sobreImagen?: boolean;
}) {
  return (
    <header
      data-escena-barra={sobreImagen ? '' : undefined}
      // Estado inicial en el propio HTML, para que el primer pintado ya salga
      // transparente y no parpadee antes de que cargue el JavaScript.
      style={sobreImagen ? ({ '--p': 0 } as React.CSSProperties) : undefined}
      className="sticky top-0 z-50 h-[var(--altura-barra)]"
    >
      {/* El fondo va en una capa propia para poder fundirlo con opacidad sin
          apagar también los enlaces. */}
      <div
        aria-hidden
        className="barra-fondo absolute inset-0 border-b border-line/60 bg-ground/70 backdrop-blur-md"
      />
      <nav className="relative mx-auto flex h-full max-w-lectura items-center justify-between px-6">
        <Link href="/" aria-label="Inicio" className="transition-opacity hover:opacity-80">
          <img src="/logo.svg" alt="" width={24} height={24} className="size-6" />
        </Link>

        <div className="flex items-center gap-5 text-xs text-ink-muted">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="hidden transition-colors hover:text-ink sm:inline"
            >
              {enlace.texto}
            </Link>
          ))}

          {/* LinkedIn se mantiene visible también en móvil, donde el resto de
              enlaces se ocultan: de las dos salidas del sitio, es la que busca
              quien viene a valorar un perfil. GitHub queda para pantallas
              grandes. */}
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-ink"
            >
              LinkedIn
            </a>
          ) : null}

          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden transition-colors hover:text-ink sm:inline"
            >
              GitHub
            </a>
          ) : null}

          {/* El único elemento con contorno de la barra es la acción que
              interesa que se pulse. Hasta ahora era preguntar al asistente,
              que ocupa el hero entero y no necesita un atajo permanente; a
              partir de aquí, contactar, que es lo que el sitio no ofrecía por
              ninguna vía. */}
          <Link
            href="/#contacto"
            className="rounded-md border border-line-strong px-3 py-1.5 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Contactar
          </Link>
        </div>
      </nav>
    </header>
  );
}
