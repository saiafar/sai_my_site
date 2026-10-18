'use client';

import { useEffect } from 'react';

/**
 * Motor de la escena de portada.
 *
 * No pinta nada. Hace dos cosas:
 *
 *  1. Traduce el desplazamiento a tres números entre 0 y 1 —--p, --m y --i— y
 *     los escribe en el hero. Todo lo que se mueve, crece o se funde está
 *     declarado en CSS en función de ellos (globals.css), así que la lógica de
 *     la animación vive en un sitio y su aspecto en otro: este componente no
 *     sabe nada de tamaños ni de colores.
 *
 *     Son tres y no uno porque la escena no es un único movimiento. --p avanza
 *     lineal con el scroll y gobierna los velos y el color del logo. --m es la
 *     entrada del bloque: suavizada, y terminada cuando se ha recorrido el 60 %.
 *     --i es la aparición de la frase, que no empieza hasta el 42 % para que no
 *     se solape con el asentamiento del nombre. El suavizado se calcula aquí
 *     porque CSS no tiene una función que lo aplique a un número arbitrario.
 *
 *  2. Revela cada sección marcada con data-aparecer la primera vez que entra en
 *     pantalla.
 *
 * Las variables se escriben solo en el elemento que las usa, no en <html>: las
 * propiedades personalizadas se heredan, y cambiarlas en la raíz obligaría al
 * navegador a recalcular los estilos de toda la página en cada fotograma.
 */
const limitar = (valor: number): number => Math.min(1, Math.max(0, valor));

/** Suavizado de salida: rápido al principio, se asienta al final. */
const suavizar = (t: number): number => 1 - (1 - t) ** 3;

export function EscenaHero() {
  useEffect(() => {
    const escena = document.querySelector<HTMLElement>('[data-escena]');
    const escenario = escena?.querySelector<HTMLElement>('.hero-escenario');

    // --- 1. Progreso ---------------------------------------------------------
    let frame = 0;

    const actualizar = () => {
      frame = 0;
      if (!escena || !escenario) return;

      // Cuánto se puede recorrer con el escenario pegado arriba: el alto de la
      // pista menos el del propio escenario. Se mide en cada fotograma porque
      // en móvil la barra del navegador cambia la altura de la ventana al
      // desplazarse, y con un valor cacheado la escena se desajusta a mitad.
      const recorrido = Math.max(1, escena.offsetHeight - escenario.offsetHeight);
      const p = limitar(-escena.getBoundingClientRect().top / recorrido);

      escena.style.setProperty('--p', p.toFixed(4));
      escena.style.setProperty('--m', suavizar(limitar(p / 0.6)).toFixed(4));
      escena.style.setProperty('--i', suavizar(limitar((p - 0.42) / 0.35)).toFixed(4));
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
