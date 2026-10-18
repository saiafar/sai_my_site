'use client';

import { useEffect, useRef } from 'react';

export interface SeccionCorpus {
  etiqueta: string;
  documentos: { titulo: string; fragmentos: number }[];
}

export type FaseRag = 'reposo' | 'buscando' | 'listo';

/** Nodo del grafo. Las posiciones se calculan una vez por tamaño de lienzo. */
interface Nodo {
  x: number;
  y: number;
  r: number;
  tipo: 'raiz' | 'seccion' | 'documento' | 'fragmento';
  etiqueta: string;
  /** Desfase propio para que cada nodo flote a su aire. */
  fase: number;
  hub?: Nodo;
  fragmentos?: Nodo[];
  /** Solo en documentos: si se le pinta el nombre al lado. */
  conEtiqueta?: boolean;
}

interface Grafo {
  nodos: Nodo[];
  aristas: [Nodo, Nodo, boolean?][];
  raiz: Nodo;
  porTitulo: Map<string, Nodo>;
  w: number;
  h: number;
}

/** Cuántos fragmentos se dibujan como mucho por documento. */
const MAX_FRAGMENTOS = 9;

/**
 * Mapa del corpus.
 *
 * Es el fondo de la sección del asistente y, a la vez, su demostración. Cada
 * círculo grande es una sección del corpus, cada punto mediano un documento y
 * cada punto pequeño un fragmento indexado: los mismos que consulta la
 * búsqueda, con sus recuentos reales. No es una ilustración de cómo funciona un
 * RAG, es el inventario del que hay detrás de la caja de preguntas.
 *
 * Al preguntar, una onda sale del centro —la consulta convertida en vector
 * recorriendo el índice— y, cuando la respuesta llega, se traza el camino hasta
 * los documentos que de verdad se han citado y de vuelta a la pregunta. El
 * recorrido no está guionizado: los destinos son las fuentes que devuelve
 * `/api/chat`.
 *
 * Todo el dibujo vive en un `<canvas>` porque son unos doscientos nodos
 * moviéndose a la vez: con elementos del DOM, cada fotograma obligaría al
 * navegador a recalcular la maquetación de la página entera.
 */
export function MapaRag({
  secciones,
  fase,
  objetivos,
  anclaRef,
}: {
  secciones: readonly SeccionCorpus[];
  fase: FaseRag;
  /** Títulos de los documentos citados en la respuesta. */
  objetivos: readonly string[];
  /** La caja de la pregunta: de ahí sale y ahí vuelve el recorrido. */
  anclaRef: React.RefObject<HTMLElement | null>;
}) {
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  // Lo que cambia entre fotogramas se lee de una referencia y no de las props:
  // el bucle de dibujo se monta una sola vez y no debe reiniciarse al teclear.
  const estado = useRef({ fase, objetivos, secciones });
  estado.current = { fase, objetivos, secciones };

  const marcas = useRef<{ busqueda: number; respuesta: number }>({ busqueda: 0, respuesta: 0 });

  useEffect(() => {
    if (fase === 'buscando') marcas.current = { busqueda: performance.now(), respuesta: 0 };
    if (fase === 'listo') marcas.current.respuesta = performance.now();
  }, [fase]);

  useEffect(() => {
    const lienzo = lienzoRef.current;
    if (!lienzo) return;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let grafo: Grafo | null = null;
    let cuadro = 0;

    /** Posición flotante de un nodo. Con movimiento reducido, la suya. */
    const posicion = (n: Nodo, t: number) =>
      quieto
        ? { x: n.x, y: n.y }
        : { x: n.x + Math.sin(t * 0.6 + n.fase) * 3, y: n.y + Math.cos(t * 0.5 + n.fase) * 3 };

    function construir(w: number, h: number): Grafo {
      const estrecho = w < 900;
      // En ancho, el centro se va a la derecha: el panel ocupa la izquierda y
      // el grafo no debe quedar debajo de él.
      const cx = estrecho ? w * 0.5 : Math.max(w * 0.64, 860);
      const cy = h * 0.47;
      const rx = estrecho ? w * 0.36 : Math.min(w * 0.24, 360);
      const ry = h * 0.33;

      const lista = estado.current.secciones;
      const total = Math.max(1, lista.length);
      const angulo = (i: number) =>
        estrecho
          ? -Math.PI / 2 + i * ((Math.PI * 2) / total)
          : ((-80 + i * (160 / Math.max(1, total - 1))) * Math.PI) / 180;

      // Aleatoriedad reproducible: el mapa tiene que salir igual en cada
      // repintado, o los nodos saltarían de sitio al cambiar el tamaño.
      let semilla = 7;
      const azar = () => {
        semilla = (semilla * 9301 + 49297) % 233280;
        return semilla / 233280;
      };

      const nodos: Nodo[] = [];
      const aristas: [Nodo, Nodo, boolean?][] = [];
      const porTitulo = new Map<string, Nodo>();

      const raiz: Nodo = { x: cx, y: cy, r: 9, tipo: 'raiz', etiqueta: 'corpus', fase: 0 };
      nodos.push(raiz);

      lista.forEach((seccion, si) => {
        const a = angulo(si);
        const hub: Nodo = {
          x: cx + Math.cos(a) * rx,
          y: cy + Math.sin(a) * ry,
          r: 7,
          tipo: 'seccion',
          etiqueta: seccion.etiqueta,
          fase: azar() * 6,
        };
        nodos.push(hub);
        aristas.push([raiz, hub]);

        const n = seccion.documentos.length;
        // El abanico se cierra a medida que hay más documentos: con dieciséis
        // proyectos, el paso del diseño daría más de una vuelta completa.
        const paso = Math.min(0.5, 2.1 / Math.max(1, n - 1));

        seccion.documentos.forEach((documento, di) => {
          const b = a + (di - (n - 1) / 2) * paso;
          const dr = 85 + (di % 2) * 45 + azar() * 15;
          const doc: Nodo = {
            x: hub.x + Math.cos(b) * dr,
            y: hub.y + Math.sin(b) * dr * 0.85,
            r: 4.5,
            tipo: 'documento',
            etiqueta: documento.titulo,
            fase: azar() * 6,
            hub,
            fragmentos: [],
            // Con los abanicos llenos, los nombres se pisarían: se rotula uno
            // de cada dos en las secciones grandes.
            conEtiqueta: n <= 8 || di % 2 === 0,
          };
          nodos.push(doc);
          aristas.push([hub, doc]);
          porTitulo.set(documento.titulo, doc);

          const cuantos = Math.min(MAX_FRAGMENTOS, Math.max(1, documento.fragmentos));
          for (let k = 0; k < cuantos; k += 1) {
            const c = b + (azar() - 0.5) * 2.2;
            const cr = 18 + azar() * 22;
            const fragmento: Nodo = {
              x: doc.x + Math.cos(c) * cr,
              y: doc.y + Math.sin(c) * cr,
              r: 2,
              tipo: 'fragmento',
              etiqueta: '',
              fase: azar() * 6,
              hub,
            };
            nodos.push(fragmento);
            aristas.push([doc, fragmento]);
            doc.fragmentos?.push(fragmento);
          }
        });
      });

      // Unas pocas uniones entre fragmentos de secciones distintas: es lo que
      // hace que se lea como un índice y no como tres árboles sueltos.
      const fragmentos = nodos.filter((n) => n.tipo === 'fragmento');
      for (let i = 0; i < 26 && fragmentos.length > 1; i += 1) {
        const a = fragmentos[Math.floor(azar() * fragmentos.length)]!;
        const b = fragmentos[Math.floor(azar() * fragmentos.length)]!;
        if (a.hub !== b.hub) aristas.push([a, b, true]);
      }

      return { nodos, aristas, raiz, porTitulo, w, h };
    }

    // La fuente del lienzo se toma de la página para que coincida con la del
    // resto del sitio: next/font la sirve con un nombre generado.
    const familiaMono =
      getComputedStyle(lienzo).getPropertyValue('--fuente-mono').trim() || 'monospace';

    const dibujar = (ms: number) => {
      cuadro = requestAnimationFrame(dibujar);

      const w = lienzo.clientWidth;
      const h = lienzo.clientHeight;
      if (!w || !h) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (lienzo.width !== Math.round(w * dpr) || lienzo.height !== Math.round(h * dpr)) {
        lienzo.width = Math.round(w * dpr);
        lienzo.height = Math.round(h * dpr);
        grafo = null;
      }
      if (!grafo || grafo.w !== w || grafo.h !== h) grafo = construir(w, h);

      const ctx = lienzo.getContext('2d');
      if (!ctx) return;
      const t = ms / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const P = new Map<Nodo, { x: number; y: number }>();
      for (const n of grafo.nodos) P.set(n, posicion(n, t));

      for (const [a, b, cruzada] of grafo.aristas) {
        const pa = P.get(a)!;
        const pb = P.get(b)!;
        ctx.strokeStyle = cruzada ? 'rgba(187,168,255,0.08)' : 'rgba(241,236,226,0.13)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      const { fase: faseActual, objetivos: destinos } = estado.current;
      const pRaiz = P.get(grafo.raiz)!;

      // Segundos desde que arrancó la búsqueda y desde que llegó la respuesta.
      const desdeBusqueda = marcas.current.busqueda ? (ms - marcas.current.busqueda) / 1000 : -1;
      const desdeRespuesta = marcas.current.respuesta
        ? (ms - marcas.current.respuesta) / 1000
        : -1;

      // La onda recorre el índice mientras se busca, y se desvanece después.
      const buscando = faseActual === 'buscando' && desdeBusqueda >= 0;
      const onda =
        !quieto && buscando ? ((desdeBusqueda % 2) / 2) * Math.max(w, h) * 0.6 : -1;

      for (const n of grafo.nodos) {
        const p = P.get(n)!;
        let alfa = n.tipo === 'fragmento' ? 0.35 : n.tipo === 'documento' ? 0.8 : 1;
        let color = n.tipo === 'documento' ? '187,168,255' : '241,236,226';

        if (onda > 0 && n.tipo === 'fragmento') {
          const d = Math.hypot(p.x - pRaiz.x, p.y - pRaiz.y);
          if (Math.abs(d - onda) < 26) {
            alfa = 1;
            color = '255,122,84';
          }
        }

        ctx.fillStyle = `rgba(${color},${alfa})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        if (n.tipo === 'seccion' || n.tipo === 'raiz') {
          ctx.font = `700 12px ${familiaMono}`;
          ctx.fillStyle = 'rgba(241,236,226,0.85)';
          ctx.fillText(n.etiqueta.toUpperCase(), p.x + 12, p.y - 10);
        } else if (n.tipo === 'documento' && n.conEtiqueta && w >= 900) {
          ctx.font = `11px ${familiaMono}`;
          ctx.fillStyle = 'rgba(216,208,198,0.5)';
          ctx.fillText(n.etiqueta.slice(0, 34), p.x + 8, p.y + 4);
        }
      }

      if (onda > 0) {
        ctx.strokeStyle = `rgba(255,91,46,${0.35 * (1 - onda / (Math.max(w, h) * 0.6))})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pRaiz.x, pRaiz.y, onda, 0, Math.PI * 2);
        ctx.stroke();
      }

      // De dónde sale el recorrido: el borde derecho de la caja de la pregunta.
      const ancla = anclaRef.current;
      let Q: { x: number; y: number } | null = null;
      if (ancla && (buscando || faseActual === 'listo')) {
        const r1 = ancla.getBoundingClientRect();
        const r0 = lienzo.getBoundingClientRect();
        Q = { x: r1.right - r0.left - 24, y: r1.top - r0.top + r1.height / 2 };
      }

      if (!Q) return;

      const pulso = quieto ? 6 : 6 + Math.sin(t * 6) * 2;
      ctx.fillStyle = '#FF5B2E';
      ctx.beginPath();
      ctx.arc(Q.x, Q.y, pulso, 0, Math.PI * 2);
      ctx.fill();

      if (faseActual !== 'listo' || desdeRespuesta < 0) return;

      // Un trazo por documento citado, escalonados.
      destinos.forEach((titulo, i) => {
        const doc = grafo!.porTitulo.get(titulo);
        if (!doc) return;
        const fragmento = doc.fragmentos?.[0];
        if (!fragmento) return;

        const puntos = [Q!, pRaiz, P.get(doc.hub!)!, P.get(doc)!, P.get(fragmento)!];
        const arranque = i * 0.35;
        const avance = quieto ? 1 : Math.max(0, Math.min(1, (desdeRespuesta - arranque) / 1.2));
        if (avance <= 0) return;

        const tramos: number[] = [];
        let largo = 0;
        for (let k = 1; k < puntos.length; k += 1) {
          const L = Math.hypot(puntos[k]!.x - puntos[k - 1]!.x, puntos[k]!.y - puntos[k - 1]!.y);
          tramos.push(L);
          largo += L;
        }

        // El trazo se apaga al cabo de unos segundos, pero no del todo: la
        // respuesta sigue en pantalla y sus fuentes deben seguir señaladas.
        const desvanecido =
          desdeRespuesta > 6 ? Math.max(0.25, 1 - (desdeRespuesta - 6) / 4) : 1;

        let resto = avance * largo;
        let cabeza = puntos[0]!;
        ctx.strokeStyle = `rgba(255,91,46,${0.9 * desvanecido})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(puntos[0]!.x, puntos[0]!.y);
        for (let k = 1; k < puntos.length && resto > 0; k += 1) {
          const f = Math.min(1, resto / (tramos[k - 1] || 1));
          cabeza = {
            x: puntos[k - 1]!.x + (puntos[k]!.x - puntos[k - 1]!.x) * f,
            y: puntos[k - 1]!.y + (puntos[k]!.y - puntos[k - 1]!.y) * f,
          };
          ctx.lineTo(cabeza.x, cabeza.y);
          resto -= tramos[k - 1]!;
        }
        ctx.stroke();

        if (avance < 1) {
          ctx.fillStyle = '#FFD08A';
          ctx.beginPath();
          ctx.arc(cabeza.x, cabeza.y, 4, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        const pf = P.get(fragmento)!;
        const pd = P.get(doc)!;
        ctx.strokeStyle = `rgba(187,168,255,${0.9 * desvanecido})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pf.x, pf.y, 9 + (quieto ? 0 : Math.sin(t * 4 + i) * 2), 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#BBA8FF';
        ctx.beginPath();
        ctx.arc(pd.x, pd.y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `700 12px ${familiaMono}`;
        ctx.fillStyle = `rgba(241,236,226,${desvanecido})`;
        ctx.fillText(doc.etiqueta.slice(0, 34), pd.x + 12, pd.y + 4);

        // Y la vuelta: del fragmento a la pregunta, que es lo que la respuesta
        // acaba citando.
        const vuelta = quieto ? 1 : Math.max(0, Math.min(1, (desdeRespuesta - arranque - 1.7) / 0.6));
        if (vuelta > 0) {
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = `rgba(187,168,255,${0.6 * vuelta * desvanecido})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pf.x, pf.y);
          ctx.lineTo(pf.x + (Q!.x - pf.x) * vuelta, pf.y + (Q!.y - pf.y) * vuelta);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };

    cuadro = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(cuadro);
  }, [anclaRef]);

  return (
    <canvas
      ref={lienzoRef}
      aria-hidden
      className="absolute inset-0 block size-full font-mono"
    />
  );
}
