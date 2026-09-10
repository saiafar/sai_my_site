import Link from 'next/link';

const ENLACES = [
  { texto: 'Proyectos', href: '/#proyectos' },
  { texto: 'Experiencia', href: '/#experiencia' },
  { texto: 'Stack', href: '/#stack' },
];

/**
 * Barra de navegación mínima.
 *
 * Deliberadamente discreta: en la referencia la navegación es texto pequeño y
 * apagado que no compite con el titular. El único elemento con contorno es la
 * acción que interesa que se pulse.
 */
export function BarraSuperior({ github }: { github?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-ground/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-lectura items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="font-display text-base text-ink transition-colors hover:text-accent"
        >
          RV
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

          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-ink"
            >
              GitHub
            </a>
          ) : null}

          <Link
            href="/#asistente"
            className="rounded-md border border-line-strong px-3 py-1.5 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Preguntar
          </Link>
        </div>
      </nav>
    </header>
  );
}
