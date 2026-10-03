'use client';

import { useEffect, useRef } from 'react';

/**
 * Desplegable «ver más».
 *
 * Se usa `<details>` para accesibilidad nativa y SEO (el contenido viaja en el HTML).
 * Se utiliza la clase `desplegable-vermas` en lugar de `group` para evitar colisiones
 * con las clases `group` de Tailwind en componentes hijos (tarjetas, enlaces, tags),
 * impidiendo que al pasar el ratón por un elemento se active el hover de todos.
 */
export function VerMas({
  id,
  texto,
  textoCerrar = 'Ver menos',
  children,
}: {
  id?: string;
  texto: string;
  textoCerrar?: string;
  children: React.ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (!id || typeof window === 'undefined') return;
    const storageKey = `vermas-${id}`;
    if (sessionStorage.getItem(storageKey) === 'true') {
      if (detailsRef.current) {
        detailsRef.current.open = true;
      }
    }
  }, [id]);

  const handleToggle = () => {
    if (!id || typeof window === 'undefined' || !detailsRef.current) return;
    sessionStorage.setItem(`vermas-${id}`, detailsRef.current.open ? 'true' : 'false');
  };

  return (
    <details
      ref={detailsRef}
      onToggle={handleToggle}
      className="desplegable-vermas mt-5"
    >
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg border border-line bg-surface/40 px-3 py-1.5 text-[12px] text-ink-muted transition-all duration-200 hover:border-accent/40 hover:text-ink">
        <span className="icono-vermas font-mono text-[13px] leading-none text-accent transition-transform duration-200 select-none">
          +
        </span>
        <span className="texto-vermas-abrir">{texto}</span>
        <span className="texto-vermas-cerrar">{textoCerrar}</span>
      </summary>

      <div className="mt-5">{children}</div>
    </details>
  );
}
