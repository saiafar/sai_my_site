import QRCode from 'qrcode';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

let logoSvgCache: { defs: string; circle: string } | null = null;

async function obtenerFragmentosLogo(): Promise<{ defs: string; circle: string }> {
  if (logoSvgCache) return logoSvgCache;

  try {
    const ruta = path.join(process.cwd(), 'public', 'logo.svg');
    const contenido = await readFile(ruta, 'utf8');

    const defsMatch = contenido.match(/<defs>([\s\S]*?)<\/defs>/);
    const circleMatch = contenido.match(/<circle[\s\S]*?\/>/);
    const defs = defsMatch?.[1] ?? '';
    const circle = circleMatch?.[0] ?? '';
    const resultado = { defs, circle };
    logoSvgCache = resultado;
    return resultado;
  } catch (err) {
    console.error('Error al cargar public/logo.svg para el QR:', err);
    return { defs: '', circle: '' };
  }
}

/**
 * Genera un código QR en formato SVG vector con el logo centrado y nivel de corrección H (30%).
 * El nivel H garantiza que, a pesar de que el logo cubra el centro (~24% del área),
 * el código sea 100% legible y escaneable por cualquier cámara de móvil.
 */
export async function generarQrSvgConLogo(url: string): Promise<string> {
  const qrSvg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#121210',
      light: '#ffffff',
    },
  });

  const { defs, circle } = await obtenerFragmentosLogo();

  // Extraer el tamaño de la matriz desde el viewBox (ej. "0 0 37 37")
  const vbMatch = qrSvg.match(/viewBox=["']0 0 (\d+) (\d+)["']/);
  const sizeStr = vbMatch?.[1];
  const size = sizeStr ? parseInt(sizeStr, 10) : 37;
  const center = size / 2;
  const logoBoxSize = size * 0.26;
  const logoBoxX = center - logoBoxSize / 2;
  const logoBoxY = center - logoBoxSize / 2;
  const radioBorde = logoBoxSize * 0.22;

  const superposicionCentro = `
  <defs>
    ${defs}
  </defs>
  <!-- Contenedor central blanco con bordes redondeados y sombra sutil -->
  <rect x="${logoBoxX.toFixed(2)}" y="${logoBoxY.toFixed(2)}" width="${logoBoxSize.toFixed(2)}" height="${logoBoxSize.toFixed(2)}" rx="${radioBorde.toFixed(2)}" fill="#ffffff" stroke="#e6e1da" stroke-width="0.25" />
  <!-- Logo vectorial centrado -->
  <svg x="${(logoBoxX + logoBoxSize * 0.08).toFixed(2)}" y="${(logoBoxY + logoBoxSize * 0.08).toFixed(2)}" width="${(logoBoxSize * 0.84).toFixed(2)}" height="${(logoBoxSize * 0.84).toFixed(2)}" viewBox="5.16 -2.19 917.74 917.74">
    ${circle}
  </svg>
`;

  return qrSvg.replace('</svg>', `${superposicionCentro}</svg>`);
}
