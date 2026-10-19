'use client';

import { useEffect, useRef, useState } from 'react';
import type { GuionConversacion } from '@/lib/site/conversacion';

/** Fases de la conversación. El orden es el del guion y cada una entra sola. */
type Fase = 'espera' | 'escribiendo' | 'enviado' | 'pensando' | 'respondido' | 'completo';

/** Cuánto dura cada paso, en milisegundos. */
const RITMO = {
  /** Por carácter al teclear la pregunta. */
  tecla: 38,
  /** Desde que se acaba de escribir hasta que se envía. */
  envio: 420,
  /** Los tres puntos antes de responder. */
  pensando: 1400,
  /** Entre la respuesta y el cierre. */
  cierre: 900,
};

/**
 * La conversación con Luc.IA, recreada y animada.
 *
 * Sustituye a la captura real, que no se puede publicar: lleva la lista de
 * compañeros del equipo y un expediente de cliente. Aquí todo el contenido es
 * inventado y así queda dicho al pie, porque enseñar una recreación sin
 * avisarlo es enseñar una captura falsa.
 *
 * Se anima porque lo que hay que entender de este proyecto no es cómo se ve una
 * ventana de chat, sino lo que pasa entre la pregunta y la respuesta: alguien
 * escribe en lenguaje natural y el agente contesta con el estado real de un
 * expediente. Eso es una secuencia, y una secuencia se cuenta en el tiempo.
 *
 * Dos decisiones que no son de adorno:
 *
 *  - **Se teclea en la caja de escribir, no en la burbuja.** Es como funciona
 *    un chat, y de paso evita el efecto que tenía antes: una burbuja alineada a
 *    la derecha que crece carácter a carácter se desplaza hacia la izquierda, y
 *    lo que se lee no es que alguien escriba, sino que algo se desliza.
 *
 *  - **La altura la fija una copia invisible de la conversación terminada.** El
 *    hueco está reservado desde el principio, así que la sección no da saltos
 *    cuando entran las burbujas. Se hace con una copia y no con una altura fija
 *    porque la correcta depende del ancho y del idioma, y un número a ojo
 *    siempre se queda corto en algún sitio.
 *
 * Arranca al entrar en pantalla y se queda en su estado final: una animación
 * repitiéndose al lado de un texto es ruido. Con «reducir movimiento» aparece
 * terminada de una vez.
 */
export function ConversacionLucIA({ guion }: { guion: GuionConversacion }) {
  const [fase, setFase] = useState<Fase>('espera');
  const [escrito, setEscrito] = useState('');
  const contenedor = useRef<HTMLDivElement>(null);
  const relojes = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const nodo = contenedor.current;
    if (!nodo) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFase('completo');
      return;
    }

    const programar = (ms: number, hacer: () => void) => {
      relojes.current.push(setTimeout(hacer, ms));
    };

    const arrancar = () => {
      setFase('escribiendo');

      const letras = [...guion.pregunta];
      letras.forEach((_, i) => {
        programar(RITMO.tecla * (i + 1), () => setEscrito(letras.slice(0, i + 1).join('')));
      });

      const fin = RITMO.tecla * letras.length + RITMO.envio;
      programar(fin, () => {
        setEscrito('');
        setFase('enviado');
      });
      programar(fin + 300, () => setFase('pensando'));
      programar(fin + 300 + RITMO.pensando, () => setFase('respondido'));
      programar(fin + 300 + RITMO.pensando + RITMO.cierre, () => setFase('completo'));
    };

    // Solo cuando se ve: si arrancara al cargar la página, quien llegue a esta
    // banda se la encontraría ya terminada.
    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return;
        observador.disconnect();
        arrancar();
      },
      { threshold: 0.35 },
    );
    observador.observe(nodo);

    const copia = relojes.current;
    return () => {
      observador.disconnect();
      copia.forEach(clearTimeout);
    };
  }, [guion.pregunta]);

  const enviada = fase === 'enviado' || fase === 'pensando' || fase === 'respondido' || fase === 'completo';
  const respondido = fase === 'respondido' || fase === 'completo';

  /**
   * Los mensajes. Se pinta dos veces: una copia invisible y terminada que
   * reserva el alto, y encima la de verdad, que va apareciendo.
   */
  const mensajes = (fantasma: boolean) => (
    <div
      aria-hidden
      className={`col-start-1 row-start-1 flex flex-col justify-end gap-3.5 ${
        fantasma ? 'conversacion-fantasma invisible' : ''
      }`}
    >
      {fantasma || enviada ? (
        <p
          className={`max-w-[80%] self-end rounded-[16px_16px_4px_16px] bg-tinta px-4 py-3 text-crema ${
            fantasma ? '' : 'conversacion-entra'
          }`}
        >
          {guion.pregunta}
        </p>
      ) : null}

      {!fantasma && fase === 'pensando' ? (
        <span className="flex gap-1.5 self-start px-1 py-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="conversacion-punto size-[7px] rounded-full bg-ink-faint"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
      ) : null}

      {fantasma || respondido ? (
        <div
          className={`max-w-[88%] self-start rounded-[16px_16px_16px_4px] border border-crema-honda bg-surface px-4 py-3.5 ${
            fantasma ? '' : 'conversacion-entra'
          }`}
        >
          <p>{guion.intro}</p>

          {/* La tarjeta del ERP: lo que distingue al agente de un chatbot. */}
          <div className="mt-3.5 overflow-hidden rounded-xl border border-line">
            <div className="flex items-center justify-between gap-3 bg-crema px-3.5 py-2.5">
              <span className="flex min-w-0 flex-col">
                <strong className="truncate text-[14px]">{guion.tarjeta.titulo}</strong>
                <span className="font-mono text-[11px] text-ink-faint">
                  {guion.tarjeta.subtitulo}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-verde px-2.5 py-1 font-mono text-[11px] font-bold">
                {guion.tarjeta.etiqueta}
              </span>
            </div>

            <ul className="divide-y divide-line">
              {guion.tarjeta.filas.map((fila, i) => (
                <li
                  key={fila.titulo}
                  className={`flex gap-2.5 px-3.5 py-3 ${fantasma ? '' : 'conversacion-entra'}`}
                  style={fantasma ? undefined : { animationDelay: `${160 + i * 220}ms` }}
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-verde text-[10px] font-bold"
                  >
                    ✓
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-[13px]">{fila.titulo}</strong>
                    <span className="block text-[13px] text-ink-muted">{fila.texto}</span>
                    <span className="mt-1 inline-block rounded-md bg-lila px-2 py-0.5 font-mono text-[11px]">
                      {fila.meta}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {fantasma || fase === 'completo' ? (
        <p
          className={`max-w-[88%] self-start rounded-[16px_16px_16px_4px] border border-crema-honda bg-surface px-4 py-3 text-[14px] text-ink-muted ${
            fantasma ? '' : 'conversacion-entra'
          }`}
        >
          {guion.cierre}
        </p>
      ) : null}
    </div>
  );

  return (
    <div ref={contenedor} className="rotate-[1.5deg]">
      {/* Sin JavaScript la copia que reserva el alto se hace visible: la
          conversación aparece entera y quieta, en vez de una tarjeta vacía. */}
      <noscript>
        <style>{'.conversacion-fantasma{visibility:visible!important}'}</style>
      </noscript>

      <div className="overflow-hidden rounded-tarjeta bg-crema text-tinta shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
        {/* Cabecera */}
        <div className="flex items-center gap-3 border-b border-line bg-crema-honda px-5 py-4">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-naranja font-extrabold text-tinta"
          >
            L
          </span>
          <span className="flex min-w-0 flex-col">
            <strong className="text-[16px] leading-tight">{guion.nombre}</strong>
            <span className="font-mono text-[12px] text-ink-faint">{guion.estado}</span>
          </span>
          <span aria-hidden className="ml-auto size-2 shrink-0 rounded-full bg-verde" />
        </div>

        {/* Conversación. Se anuncia entera de una vez a quien usa lector de
            pantalla: el goteo es un efecto visual, no información. */}
        <div
          aria-label={`${guion.pregunta} — ${guion.intro}`}
          className="grid px-5 py-6 text-[15px] leading-relaxed sm:text-[16px]"
        >
          {mensajes(true)}
          {mensajes(false)}
        </div>

        {/* Caja de escribir: aquí es donde se teclea. */}
        <div className="flex items-center gap-3 border-t border-line bg-crema-honda/60 px-4 py-3">
          <span className="flex min-h-10 flex-1 items-center rounded-full border border-line bg-surface px-4 text-[14px]">
            {fase === 'escribiendo' ? (
              <span aria-hidden>
                {escrito}
                <span className="conversacion-cursor ml-px inline-block">|</span>
              </span>
            ) : (
              <span aria-hidden className="text-ink-faint">
                {guion.marcador}
              </span>
            )}
          </span>
          <span
            aria-hidden
            className={`flex size-9 shrink-0 items-center justify-center rounded-full font-bold transition-colors ${
              fase === 'escribiendo' ? 'bg-naranja text-tinta' : 'bg-crema-honda text-ink-faint'
            }`}
          >
            →
          </span>
        </div>
      </div>

      <p className="mt-3.5 font-mono text-[12px] opacity-65">{guion.aviso}</p>
    </div>
  );
}
