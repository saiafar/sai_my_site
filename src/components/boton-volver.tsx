'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function BotonVolver({
  fallbackHref,
  targetId,
  texto,
}: {
  fallbackHref: string;
  targetId?: string;
  texto: string;
}) {
  const router = useRouter();

  // Guardar en sessionStorage el id del elemento actual en cuanto se abre la ficha.
  // Así, tanto si el usuario pulsa este botón como si pulsa el botón «Atrás» del navegador,
  // la portada sabe exactamente a qué sección y tarjeta regresar.
  useEffect(() => {
    if (targetId && typeof window !== 'undefined') {
      sessionStorage.setItem('rafaias-last-id', targetId);
    }
  }, [targetId]);

  const handleVolver = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <a
      href={fallbackHref}
      onClick={handleVolver}
      className="group inline-flex items-center gap-1.5 text-[11px] text-ink-muted transition-colors hover:text-ink cursor-pointer"
    >
      <span className="text-accent transition-transform duration-200 group-hover:-translate-x-1">
        ←
      </span>
      <span>{texto}</span>
    </a>
  );
}
