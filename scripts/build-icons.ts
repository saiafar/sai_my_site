/**
 * Genera los iconos del sitio a partir del logo vectorial.
 *
 *   assets/logo/logo.svg  →  public/logo.svg          (la web)
 *                            src/app/icon.svg         (favicon, navegadores actuales)
 *                            src/app/favicon.ico      (favicon, 16/32/48 px)
 *                            src/app/apple-icon.png   (pantalla de inicio de iOS)
 *
 * Los tres de src/app/ son convenciones de ficheros de Next.js: al estar ahí,
 * el framework inserta él mismo las etiquetas <link> correspondientes en el
 * <head>, así que no hay que declararlos en ningún layout.
 *
 * Uso:  npm run icons
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const MASTER = path.join(ROOT, 'assets', 'logo', 'logo.svg');

/** Fondo del sitio (--color-ground). */
const GROUND = '#121210';

/** Rasteriza el SVG a un cuadrado de `size` px. */
async function render(svg: Buffer, size: number): Promise<Buffer> {
  // La densidad alta hace que librsvg rasterice con mucho detalle y sharp
  // reduzca después: el resultado es un antialiasing limpio incluso a 16 px.
  return sharp(svg, { density: 72 * Math.max(4, Math.ceil((size * 4) / 58)) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Empaqueta varios PNG en un .ico.
 *
 * El formato admite PNG embebidos desde Windows Vista y todos los navegadores
 * los aceptan, así que no hace falta convertir a mapas de bits: basta una
 * cabecera de 6 bytes y una entrada de 16 por imagen.
 */
function encodeIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: icono
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // ancho (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // alto
    entry.writeUInt8(0, 2); // paleta: ninguna
    entry.writeUInt8(0, 3); // reservado
    entry.writeUInt16LE(1, 4); // planos
    entry.writeUInt16LE(32, 6); // bits por píxel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

async function main(): Promise<void> {
  const svg = await readFile(MASTER);

  await copyFile(MASTER, path.join(ROOT, 'public', 'logo.svg'));
  await copyFile(MASTER, path.join(ROOT, 'src', 'app', 'icon.svg'));

  // Las letras del logo están caladas: son transparentes y toman el color de lo
  // que haya detrás. En la pestaña del navegador eso funciona solo, tanto en
  // tema claro como oscuro.
  const ico = encodeIco(
    await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await render(svg, size) }))),
  );
  await writeFile(path.join(ROOT, 'src', 'app', 'favicon.ico'), ico);

  // iOS no admite transparencia en el icono de inicio: la rellena de negro y,
  // con las letras caladas, el resultado depende del azar. Se compone sobre el
  // fondo del sitio, con margen, porque iOS recorta después las esquinas.
  const APPLE = 180;
  const logo = await render(svg, Math.round(APPLE * 0.78));
  const margin = Math.round((APPLE - APPLE * 0.78) / 2);
  await sharp({ create: { width: APPLE, height: APPLE, channels: 3, background: GROUND } })
    .composite([{ input: logo, left: margin, top: margin }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, 'src', 'app', 'apple-icon.png'));

  for (const file of ['public/logo.svg', 'src/app/icon.svg', 'src/app/favicon.ico', 'src/app/apple-icon.png']) {
    const { size } = await import('node:fs').then((fs) => fs.promises.stat(path.join(ROOT, file)));
    console.log(`  ✓  ${file.padEnd(24)} ${(size / 1024).toFixed(1)} KB`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
