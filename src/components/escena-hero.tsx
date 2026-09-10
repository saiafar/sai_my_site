'use client';

import { useEffect } from 'react';

/**
 * Motor de la escena de entrada de la portada.
 *
 * No pinta nada. Hace dos cosas:
 *
 *  1. Traduce el desplazamiento a una única variable, --p, entre 0 y 1, que se
 *     escribe en el hero y en la barra superior. Todo lo que se mueve, crece o
 *     se funde está declarado en CSS en función de ella (globals.css). Así la
 *     lógica de la animación vive en un sitio y su aspecto en otro, y este
 *     componente no sabe nada de tamaños ni de colores.
 *
 *  2. Revela cada sección marcada con data-aparecer la primera vez que entra
 *     en pantalla.
 *
 * La variable se escribe solo en los dos elementos que la usan, no en <html>:
 * las propiedades personalizadas se heredan, y cambiarla en la raíz obligaría
 * al navegador a recalcular los estilos de toda la página en cada fotograma.
 */
export function EscenaHero() {
  useEffect(() => {
    const escena = document.querySelector<HTMLElement>('[data-escena]');
    const recorrido = escena?.querySelector<HTMLElement>('[data-recorrido]');
    const barra = document.querySelector<HTMLElement>('[data-escena-barra]');

    // --- 1. Progreso ---------------------------------------------------------
    let frame = 0;

    const actualizar = () => {
      frame = 0;
      if (!escena || !recorrido) return;
      // El bloque del nombre queda fijo desde el primer píxel de scroll (la
      // maquetación lo coloca ya en su posición fija), así que el progreso es
      // simplemente cuánto se ha recorrido de la distancia en que permanece fijo.
      const distancia = recorrido.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / distancia)).toFixed(4);
      escena.style.setProperty('--p', p);
      barra?.style.setProperty('--p', p);
    };

    // Un cálculo por fotograma como máximo, por muchos eventos de scroll que
    // lleguen entre medias.
    const programar = () => {
      if (!frame) frame = requestAnimationFrame(actualizar);
    };

    actualizar();
    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', programar);

    // --- 2. Aparición de secciones ------------------------------------------
    const elementos = Array.from(document.querySelectorAll<HTMLElement>('[data-aparecer]'));

    // Lo que ya está en pantalla al cargar (por ejemplo, tras recargar a mitad
    // de página) se marca visible antes de activar el ocultado: si no, se vería
    // aparecer, desaparecer y volver a aparecer.
    for (const elemento of elementos) {
      if (elemento.getBoundingClientRect().top < window.innerHeight) {
        elemento.dataset.visible = '';
      }
    }
    document.documentElement.classList.add('aparecer-activo');

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          (entrada.target as HTMLElement).dataset.visible = '';
          observador.unobserve(entrada.target);
        }
      },
      // Se dispara cuando la sección ya asoma un poco, no en su primer píxel:
      // de lo contrario la animación ocurre en el borde inferior, donde nadie
      // está mirando.
      { rootMargin: '0px 0px -12% 0px' },
    );
    for (const elemento of elementos) {
      if (!('visible' in elemento.dataset)) observador.observe(elemento);
    }

    return () => {
      window.removeEventListener('scroll', programar);
      window.removeEventListener('resize', programar);
      if (frame) cancelAnimationFrame(frame);
      observador.disconnect();
      document.documentElement.classList.remove('aparecer-activo');
    };
  }, []);

  return null;
}
