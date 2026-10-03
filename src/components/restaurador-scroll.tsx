'use client';

import { useEffect } from 'react';

/**
 * Restaura la posición del scroll y abre automáticamente los desplegables correspondientes
 * si se vuelve a la portada desde una ficha de proyecto o experiencia.
 */
export function RestauradorScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedId = sessionStorage.getItem('rafaias-last-id');
    const hashId = window.location.hash ? window.location.hash.slice(1) : null;
    const targetId = savedId || hashId;

    if (!targetId) return;

    const intentarScroll = (intentos = 0) => {
      const el = document.getElementById(targetId);
      if (el) {
        // Si el elemento está dentro de un <details> plegado, desplegarlo primero
        const parentDetails = el.closest('details');
        if (parentDetails && !parentDetails.open) {
          parentDetails.open = true;
        }

        // Posicionar la vista centrada en la tarjeta abierta
        requestAnimationFrame(() => {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });

        if (savedId) {
          sessionStorage.removeItem('rafaias-last-id');
        }
      } else if (intentos < 8) {
        setTimeout(() => intentarScroll(intentos + 1), 60);
      }
    };

    setTimeout(() => intentarScroll(0), 50);
  }, []);

  return null;
}
