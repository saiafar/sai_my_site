/**
 * Genera la tarjeta que se ve al compartir un enlace del sitio.
 *
 *   assets/fondos/atardecer/base.png  ┐
 *   assets/logo/logo.svg              ├→  public/og.png   (1200×630)
 *   nombre y descripción              ┘
 *
 * Una sola imagen para todo el sitio, generada aquí y versionada en public/,
 * igual que los iconos y los fondos. La alternativa —una por ficha, compuesta
 * al vuelo— daría tarjetas más específicas, pero metería un rasterizador en el
 * camino de cada petición de un servicio ajeno, y este servidor es un mini PC.
 * Un fichero estático no falla nunca.
 *
 * Se reaprovecha el fondo del hero en lugar de un color plano: es la imagen con
 * la que ya se identifica el sitio, y una tarjeta que se parece a la página que
 * abre luego es menos desconcertante que un rectángulo de color.
 *
 * Uso:  npm run og
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const FONDO = path.join(ROOT, 'assets', 'fondos', 'atardecer', 'base.png');
const LOGO = path.join(ROOT, 'assets', 'logo', 'logo.svg');
// JPEG y no PNG: el fondo es una fotografía con un cielo degradado, y ahí PNG
// pesa 1 MB frente a 87 kB sin diferencia perceptible. Todas las plataformas
// que leen Open Graph aceptan JPEG.
const SALIDA = path.join(ROOT, 'public', 'og.jpg');

/** Medidas canónicas de Open Graph. Las respetan LinkedIn, WhatsApp y Slack. */
const ANCHO = 1200;
const ALTO = 630;

const LOGO_PX = 132;
const MARGEN = 80;

// Los mismos tokens que globals.css.
const GROUND = '#121210';
const INK = '#e6e1da';
const INK_MUTED = '#9a958c';
const ACENTO = '#ff6a4d';

const NOMBRE = 'Rafaías Villán';
const DESCRIPCION = 'Desarrollo backend, datos e IA';
const PIE = 'rafaiasvillan.com';

/**
 * Capa de texto.
 *
 * Se usan las familias genéricas de fontconfig y no las del sitio —Instrument
 * Serif y Poppins— porque esas las descarga next/font durante la construcción y
 * viven comprimidas en woff2 dentro de .next: no hay un fichero que librsvg
 * pueda abrir. Como esto se rasteriza una sola vez y el resultado se versiona,
 * la diferencia se paga en el momento de generar y no en producción.
 */
function capaTexto(): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}">
    <!-- Degradado que oscurece hacia la izquierda: el texto necesita contraste
         y el fondo tiene zonas claras. -->
    <defs>
      <linearGradient id="velo" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${GROUND}" stop-opacity="0.94"/>
        <stop offset="0.62" stop-color="${GROUND}" stop-opacity="0.72"/>
        <stop offset="1" stop-color="${GROUND}" stop-opacity="0.38"/>
      </linearGradient>
    </defs>
    <rect width="${ANCHO}" height="${ALTO}" fill="url(#velo)"/>

    <text x="${MARGEN}" y="${MARGEN + LOGO_PX + 96}" fill="${INK}"
          font-family="DejaVu Serif, serif" font-size="78">${NOMBRE}</text>

    <text x="${MARGEN}" y="${MARGEN + LOGO_PX + 152}" fill="${INK_MUTED}"
          font-family="DejaVu Sans, sans-serif" font-size="32">${DESCRIPCION}</text>

    <text x="${MARGEN}" y="${ALTO - MARGEN + 8}" fill="${INK_MUTED}"
          font-family="DejaVu Sans, sans-serif" font-size="23"
          letter-spacing="1.5">${PIE}</text>

    <!-- Filo de acento en el borde inferior, como la línea del sitio. -->
    <rect x="0" y="${ALTO - 6}" width="${ANCHO}" height="6" fill="${ACENTO}"/>
  </svg>`;

  return Buffer.from(svg);
}

async function main(): Promise<void> {
  const fondo = await sharp(FONDO)
    .resize(ANCHO, ALTO, { fit: 'cover', position: 'centre' })
    .toBuffer();

  const logo = await sharp(await readFile(LOGO), { density: 600 })
    .resize(LOGO_PX, LOGO_PX, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const tarjeta = await sharp(fondo)
    .composite([
      { input: capaTexto(), top: 0, left: 0 },
      { input: logo, top: MARGEN, left: MARGEN },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  await writeFile(SALIDA, tarjeta);

  const { width, height } = await sharp(tarjeta).metadata();
  console.log(`  ✓  public/og.jpg  ${width}×${height}  ${(tarjeta.length / 1024).toFixed(0)} kB`);
}

main().catch((error: unknown) => {
  console.error('\n' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
