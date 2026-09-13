import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Marco del panel.
 *
 * Vive en un grupo de rutas «(panel)» para que la pantalla de entrada, que está
 * fuera, no herede esta navegación: enseñar «Salir» a quien todavía no ha
 * entrado no tiene sentido.
 *
 * Aquí no se comprueba la sesión. Lo hace el proxy (src/proxy.ts), antes de que Next
 * resuelva la ruta, porque un layout que redirige llega tarde: layout y página
 * se renderizan en paralelo y las consultas de la página ya se habrían lanzado.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panel — Rafaías Villán',
  // El panel nunca se indexa, con independencia de SITE_INDEXABLE.
  robots: { index: false, follow: false },
};

const PESTANAS = [
  { href: '/admin', texto: 'Resumen' },
  { href: '/admin/consultas', texto: 'Consultas' },
  { href: '/admin/ajustes', texto: 'Ajustes' },
];

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <nav className="flex gap-5">
            {PESTANAS.map((pestana) => (
              <Link
                key={pestana.href}
                href={pestana.href}
                className="text-[13px] text-ink-muted transition-colors hover:text-ink"
              >
                {pestana.texto}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[12px] text-ink-faint transition-colors hover:text-ink-muted"
            >
              Ver el sitio
            </Link>
            {/* Formulario y no botón con fetch: cerrar sesión no debería
                depender de que se haya hidratado JavaScript. */}
            <form action="/api/admin/salir" method="post">
              <button
                type="submit"
                className="text-[12px] text-ink-faint transition-colors hover:text-ink-muted"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
