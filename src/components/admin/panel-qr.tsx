'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  enlaceDestino: string;
}

export function PanelQr({ enlaceDestino }: Props) {
  const [copiado, setCopiado] = useState<'imagen' | 'enlace' | null>(null);
  const [errorCopia, setErrorCopia] = useState<string | null>(null);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generar PNG en alta resolución (1024x1024) en el cliente con el logo centrado
  useEffect(() => {
    let cancelado = false;

    async function dibujarQrConLogo() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        canvasRef.current = canvas;

        // 1. Dibujar QR base con corrección High (30%)
        await QRCode.toCanvas(canvas, enlaceDestino, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#121210',
            light: '#ffffff',
          },
        });

        // 2. Cargar logo en imagen
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.src = '/logo.svg';

        await new Promise<void>((resolve, reject) => {
          logo.onload = () => resolve();
          logo.onerror = () => reject(new Error('No se pudo cargar el logo'));
        });

        if (cancelado) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centro = 1024 / 2;
        const tamanoCaja = 1024 * 0.25; // 25% del ancho
        const radioBorde = tamanoCaja * 0.22;
        const boxX = centro - tamanoCaja / 2;
        const boxY = centro - tamanoCaja / 2;

        // Fondo blanco redondeado para que el logo no choque con los módulos
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e6e1da';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, tamanoCaja, tamanoCaja, radioBorde);
        ctx.fill();
        ctx.stroke();

        // Dibujar logo centrado dentro de la caja blanca
        const tamanoLogo = tamanoCaja * 0.84;
        const logoX = centro - tamanoLogo / 2;
        const logoY = centro - tamanoLogo / 2;
        ctx.drawImage(logo, logoX, logoY, tamanoLogo, tamanoLogo);

        const dataUrl = canvas.toDataURL('image/png');
        if (!cancelado) {
          setPngDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Error generando QR en canvas:', err);
      }
    }

    void dibujarQrConLogo();

    return () => {
      cancelado = true;
    };
  }, [enlaceDestino]);

  // Copiar imagen PNG al portapapeles directamente
  async function copiarImagenPortapapeles() {
    setErrorCopia(null);
    const canvas = canvasRef.current;
    if (!canvas) {
      setErrorCopia('Generando imagen, inténtalo de nuevo.');
      return;
    }

    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setErrorCopia('No se pudo convertir a imagen.');
            return;
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setCopiado('imagen');
            setTimeout(() => setCopiado(null), 3000);
          } catch {
            setErrorCopia('El navegador no permitió copiar la imagen. Haz clic derecho sobre ella para copiarla.');
          }
        }, 'image/png');
      } else {
        setErrorCopia('Tu navegador no soporta copiado directo de imágenes. Haz clic derecho y selecciona "Copiar imagen".');
      }
    } catch {
      setErrorCopia('Error al acceder al portapapeles.');
    }
  }

  // Descargar PNG en alta resolución
  function descargarPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-rafaiasvillan-links.png';
    a.click();
  }

  // Descargar SVG vectorial
  async function descargarSvg() {
    try {
      const res = await fetch('/api/links/qr');
      const svg = await res.text();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr-rafaiasvillan-links.svg';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorCopia('No se pudo descargar el SVG.');
    }
  }

  // Copiar URL al portapapeles
  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(enlaceDestino);
      setCopiado('enlace');
      setTimeout(() => setCopiado(null), 3000);
    } catch {
      setErrorCopia('No se pudo copiar el enlace.');
    }
  }

  return (
    <div className="border border-line bg-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-medium text-ink">Código QR de /links</h2>
          <p className="mt-0.5 text-[12px] text-ink-faint">
            Apunta a <span className="font-mono text-ink-muted">{enlaceDestino}</span> con tu logo en el centro.
          </p>
        </div>
        <a
          href="/links"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-accent transition-colors hover:underline"
        >
          Abrir /links ↗
        </a>
      </div>

      <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
        {/* Imagen del código QR para previsualizar, copiar o arrastrar */}
        <div className="group relative shrink-0 rounded-lg border border-line bg-white p-3 shadow-md">
          {pngDataUrl ? (
            <img
              src={pngDataUrl}
              alt="Código QR rafaiasvillan.com/links"
              width={220}
              height={220}
              className="block size-[220px] rounded object-contain select-all"
            />
          ) : (
            <img
              src="/api/links/qr"
              alt="Código QR rafaiasvillan.com/links"
              width={220}
              height={220}
              className="block size-[220px] rounded object-contain select-all"
            />
          )}

          <div className="mt-2 text-center text-[10px] text-neutral-500">
            Click derecho → Copiar imagen
          </div>
        </div>

        {/* Acciones para copiar y descargar */}
        <div className="mt-4 flex flex-1 flex-col gap-3 sm:mt-0">
          <div className="rounded border border-line bg-ground p-3 text-[12px] text-ink-muted">
            <p className="font-medium text-ink">Listo para usar</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
              El código QR utiliza corrección de error de nivel <strong>H (30%)</strong>, lo que permite que el logo quede perfectamente integrado en el centro sin afectar la lectura instantánea en cualquier teléfono.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => void copiarImagenPortapapeles()}
              className="flex items-center gap-1.5 bg-accent px-3 py-2 text-[12px] font-medium text-ground transition-opacity hover:opacity-90 active:scale-95"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              {copiado === 'imagen' ? '¡Imagen copiada!' : 'Copiar imagen del QR'}
            </button>

            <button
              type="button"
              onClick={descargarPng}
              className="flex items-center gap-1.5 border border-line bg-surface-raised px-3 py-2 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Descargar PNG (1024px)
            </button>

            <button
              type="button"
              onClick={() => void descargarSvg()}
              className="flex items-center gap-1.5 border border-line bg-surface-raised px-3 py-2 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Descargar SVG
            </button>

            <button
              type="button"
              onClick={() => void copiarEnlace()}
              className="flex items-center gap-1.5 border border-line px-3 py-2 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              {copiado === 'enlace' ? '¡Enlace copiado!' : 'Copiar enlace'}
            </button>
          </div>

          {errorCopia && (
            <p className="mt-1 text-[11px] text-accent">{errorCopia}</p>
          )}
        </div>
      </div>
    </div>
  );
}
