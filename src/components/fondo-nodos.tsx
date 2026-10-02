'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  isHub: boolean;
  connectedTo: number[];
}

interface Pulse {
  from: number;
  to: number;
  progress: number;
  speed: number;
  brightness: number;
}

export function FondoNodos() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let nodes: Node[] = [];
    let pulses: Pulse[] = [];

    const initNodes = (w: number, h: number) => {
      const isMobile = w < 640;
      const count = isMobile ? 38 : w < 1024 ? 65 : 95;
      nodes = [];
      pulses = [];

      for (let i = 0; i < count; i++) {
        // Distribución con mayor densidad hacia el centro y zona del asistente
        const rx = (Math.random() + Math.random() + Math.random()) / 3;
        const ry = (Math.random() + Math.random() + Math.random()) / 3;
        const x = w * (0.05 + 0.9 * rx);
        const y = h * (0.08 + 0.84 * ry);

        const isHub = Math.random() < 0.16;
        const baseRadius = isHub ? 2.4 + Math.random() * 1.2 : 1.1 + Math.random() * 1.2;
        const baseAlpha = isHub ? 0.65 + Math.random() * 0.3 : 0.25 + Math.random() * 0.45;

        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.42),
          vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.42),
          radius: baseRadius,
          baseRadius,
          alpha: baseAlpha,
          baseAlpha,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.02,
          isHub,
          connectedTo: [],
        });
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initNodes(width, height);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const onPointerLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseleave', onPointerLeave, { passive: true });

    // Animación
    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 640;
      const maxDist = isMobile ? 100 : 130;
      const maxDistSq = maxDist * maxDist;

      // Actualizar posiciones de nodos
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]!;

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          // Suave rebote en los bordes con margen
          if (node.x < 10) {
            node.x = 10;
            node.vx *= -1;
          } else if (node.x > width - 10) {
            node.x = width - 10;
            node.vx *= -1;
          }

          if (node.y < 10) {
            node.y = 10;
            node.vy *= -1;
          } else if (node.y > height - 10) {
            node.y = height - 10;
            node.vy *= -1;
          }

          // Interacción sutil con el cursor del ratón
          if (mouse.active) {
            const mdx = node.x - mouse.x;
            const mdy = node.y - mouse.y;
            const mDistSq = mdx * mdx + mdy * mdy;
            const mRadius = 130;
            if (mDistSq < mRadius * mRadius && mDistSq > 1) {
              const mDist = Math.sqrt(mDistSq);
              const force = (1 - mDist / mRadius) * 0.7;
              node.x += (mdx / mDist) * force * 1.5;
              node.y += (mdy / mDist) * force * 1.5;
            }
          }

          // Pulso respiratorio
          node.pulsePhase += node.pulseSpeed;
        }

        node.alpha = node.baseAlpha * (0.8 + 0.2 * Math.sin(node.pulsePhase));
        node.connectedTo = [];
      }

      // Dibujar conexiones entre nodos
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j]!;
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const factor = 1 - dist / maxDist;
            const alpha =
              factor * factor * (nodeA.isHub || nodeB.isHub ? 0.38 : 0.22);

            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(225, 93, 59, ${alpha})`;
            ctx.lineWidth = factor * 1.05;
            ctx.stroke();

            nodeA.connectedTo.push(j);
            nodeB.connectedTo.push(i);
          }
        }
      }

      // Conexión sutil con el puntero
      if (mouse.active && !isMobile) {
        let connectedCount = 0;
        for (let i = 0; i < nodes.length && connectedCount < 4; i++) {
          const node = nodes[i]!;
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 110 * 110) {
            const dist = Math.sqrt(distSq);
            const factor = 1 - dist / 110;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = `rgba(255, 140, 70, ${factor * 0.35})`;
            ctx.lineWidth = factor * 1.2;
            ctx.stroke();
            connectedCount++;
          }
        }
      }

      // Generar y dibujar impulsos neuronales (señales eléctricas entre nodos)
      if (!prefersReducedMotion) {
        if (Math.random() < 0.08 && pulses.length < 10) {
          // Seleccionar nodo aleatorio con conexiones
          const candidates = nodes.filter((n) => n.connectedTo.length > 0);
          if (candidates.length > 0) {
            const srcIndex = Math.floor(Math.random() * nodes.length);
            const srcNode = nodes[srcIndex];
            if (srcNode && srcNode.connectedTo.length > 0) {
              const targetIdx =
                srcNode.connectedTo[
                  Math.floor(Math.random() * srcNode.connectedTo.length)
                ]!;
              pulses.push({
                from: srcIndex,
                to: targetIdx,
                progress: 0,
                speed: 0.018 + Math.random() * 0.02,
                brightness: srcNode.isHub ? 0.95 : 0.75,
              });
            }
          }
        }

        // Animar y pintar impulsos
        for (let p = pulses.length - 1; p >= 0; p--) {
          const pulse = pulses[p]!;
          pulse.progress += pulse.speed;

          if (pulse.progress >= 1) {
            pulses.splice(p, 1);
            continue;
          }

          const fromNode = nodes[pulse.from];
          const toNode = nodes[pulse.to];
          if (!fromNode || !toNode) {
            pulses.splice(p, 1);
            continue;
          }

          const px = fromNode.x + (toNode.x - fromNode.x) * pulse.progress;
          const py = fromNode.y + (toNode.y - fromNode.y) * pulse.progress;

          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 230, 205, ${pulse.brightness * (1 - Math.abs(pulse.progress - 0.5) * 1.2)})`;
          ctx.fill();
        }
      }

      // Dibujar nodos (núcleos y halos)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]!;

        // Halo suave en nodos hub principales
        if (node.isHub) {
          const glow = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            node.radius * 2.2,
          );
          glow.addColorStop(0, `rgba(225, 93, 59, ${node.alpha * 0.25})`);
          glow.addColorStop(1, 'rgba(225, 93, 59, 0)');

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Núcleo del nodo
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isHub
          ? `rgba(255, 175, 120, ${node.alpha})`
          : `rgba(225, 93, 59, ${node.alpha})`;
        ctx.fill();

        // Punto de luz central brillante
        if (node.isHub || node.alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(0.6, node.radius * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 245, 230, ${node.alpha * 0.9})`;
          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    // Pausar cuando esté fuera de pantalla para óptimo rendimiento
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(container);

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 14%, rgba(0, 0, 0, 0.9) 32%, black 50%, rgba(0, 0, 0, 0.85) 75%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 14%, rgba(0, 0, 0, 0.9) 32%, black 50%, rgba(0, 0, 0, 0.85) 75%, transparent 100%)',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
