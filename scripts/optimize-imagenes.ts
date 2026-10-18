/**
 * Optimiza las imágenes de contenido.
 *
 *   assets/imagenes/<carpeta>/<nombre>.jpg  →  public/imagenes/<carpeta>/<nombre>.webp
 *
 * Es el hermano pequeño de `optimize-assets.ts`, y existe aparte a propósito.
 * Aquel trata capas de una escena: deduce la profundidad del nombre, emite tres
 * anchos y escribe un manifiesto, porque el fondo del hero se pinta a pantalla
 * completa y cambia con el scroll. Estas son fotos y piezas gráficas dentro de
 * una columna: se sirven a un solo ancho, no necesitan manifiesto y ninguna
 * propiedad suya hay que deducirla del nombre del fichero.
 *
 * Solo WebP, sin JPEG de repuesto: lo aceptan todos los navegadores que se usan
 * hoy, y mantener dos juegos de ficheros para un caso que no se da significa
 * que uno de los dos acabará desactualizado.
 *
 * Es idempotente: si el destino es más nuevo que el origen, no vuelve a
 * convertir. Ejecutarlo sin haber tocado nada no escribe nada.
 *
 * Uso:  npm run imagenes
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ORIGEN = path.join(process.cwd(), 'assets', 'imagenes');
const DESTINO = path.join(process.cwd(), 'public', 'imagenes');

/**
 * Ancho máximo servido. Ninguna de estas imágenes ocupa más de media columna de
 * 1376 px, así que 1280 cubre también una pantalla de densidad doble sin pagar
 * el peso de servir el original a todo el mundo. Las más pequeñas no se amplían.
 */
const ANCHO_MAX = 1280;

const EXTENSIONES = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function esMasNuevo(origen: string, destino: string): Promise<boolean> {
  try {
    const [o, d] = await Promise.all([stat(origen), stat(destino)]);
    return o.mtimeMs > d.mtimeMs;
  } catch {
    // El destino no existe todavía.
    return true;
  }
}

async function main(): Promise<void> {
  let convertidas = 0;
  let saltadas = 0;

  const carpetas = await readdir(ORIGEN, { withFileTypes: true }).catch(() => []);

  for (const carpeta of carpetas) {
    if (!carpeta.isDirectory()) continue;

    const dirOrigen = path.join(ORIGEN, carpeta.name);
    const dirDestino = path.join(DESTINO, carpeta.name);
    await mkdir(dirDestino, { recursive: true });

    for (const fichero of await readdir(dirOrigen)) {
      if (!EXTENSIONES.has(path.extname(fichero).toLowerCase())) continue;

      const origen = path.join(dirOrigen, fichero);
      const destino = path.join(dirDestino, `${path.basename(fichero, path.extname(fichero))}.webp`);

      if (!(await esMasNuevo(origen, destino))) {
        saltadas += 1;
        continue;
      }

      const imagen = sharp(origen);
      const { width = 0, height = 0 } = await imagen.metadata();

      await imagen
        // `withoutEnlargement` evita ampliar las que ya son pequeñas: ampliar no
        // añade detalle, solo peso.
        .resize({ width: ANCHO_MAX, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toFile(destino);

      const { size } = await stat(destino);
      console.log(
        `  ✓ ${carpeta.name}/${fichero}  ${width}×${height}  →  ${Math.round(size / 1024)} KB`,
      );
      convertidas += 1;
    }
  }

  console.log(`\n${convertidas} imagen(es) convertida(s), ${saltadas} sin cambios.`);
}

void main();
