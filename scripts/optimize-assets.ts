/**
 * Optimiza las imágenes de fondo para la web.
 *
 *   assets/fondos/<escena>/<capa>.png   →   public/fondos/<escena>/<capa>-<ancho>.<formato>
 *
 * Existe como script y no como una serie de comandos sueltos porque el fondo no
 * va a ser una imagen: va a ser un conjunto de escenas (despejado, lluvia,
 * noche…) compuestas por capas, y cada una tendrá que pasar por exactamente el
 * mismo tratamiento. Hacerlo a mano una vez es rápido; hacerlo a mano cuarenta
 * veces garantiza que alguna salga distinta.
 *
 * Genera además un manifiesto con las dimensiones reales y un marcador de
 * posición incrustado de cada imagen, que es lo que permitirá al frontend
 * elegir la escena y pintar algo de inmediato sin una petición extra.
 *
 * Uso:  npm run assets
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = path.join(process.cwd(), 'assets', 'fondos');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'fondos');
const MANIFEST = path.join(OUTPUT_DIR, 'manifiesto.json');

/**
 * Anchos servidos. Un fondo a pantalla completa en un monitor de 2560 px se
 * escala desde el mayor de estos: es una imagen de fondo, atenuada y detrás del
 * contenido, así que la pérdida de nitidez no se percibe y no compensa el peso
 * de servir el doble de píxeles a todo el mundo.
 */
const WIDTHS = [1672, 1280, 828] as const;

/**
 * AVIF comprime bastante mejor que WebP en imágenes con mucho tramado como
 * estas, pero no todos los navegadores lo aceptan. Se emiten ambos y el
 * elemento <picture> del frontend elegirá: el navegador se queda con el primero
 * que entienda, sin JavaScript de por medio.
 */
const FORMATS = [
  { ext: 'avif', options: { quality: 55, effort: 6 } },
  { ext: 'webp', options: { quality: 72, effort: 6 } },
] as const;

interface LayerEntry {
  escena: string;
  capa: string;
  ancho: number;
  alto: number;
  transparente: boolean;
  variantes: { formato: string; ancho: number; ruta: string; bytes: number }[];
  lqip: string;
}

/**
 * Un PNG puede traer canal alfa aunque sea opaco de principio a fin, que es lo
 * que ocurre con las imágenes exportadas por la mayoría de generadores. Ese
 * canal es un 25% de datos que no dice nada. Se comprueba antes de quitarlo,
 * porque en las capas superpuestas la transparencia sí será real y necesaria.
 */
async function hasRealTransparency(file: string): Promise<boolean> {
  const image = sharp(file);
  const { hasAlpha } = await image.metadata();
  if (!hasAlpha) return false;
  const alpha = (await image.stats()).channels[3];
  return alpha !== undefined && alpha.min < 255;
}

async function findLayers(): Promise<{ escena: string; capa: string; file: string }[]> {
  const scenes = await readdir(SOURCE_DIR, { withFileTypes: true });
  const layers: { escena: string; capa: string; file: string }[] = [];
  for (const scene of scenes) {
    if (!scene.isDirectory()) continue;
    for (const entry of await readdir(path.join(SOURCE_DIR, scene.name))) {
      if (!/\.(png|jpe?g|webp)$/i.test(entry)) continue;
      layers.push({
        escena: scene.name,
        capa: entry.replace(/\.[^.]+$/, ''),
        file: path.join(SOURCE_DIR, scene.name, entry),
      });
    }
  }
  return layers.sort((a, b) => `${a.escena}/${a.capa}`.localeCompare(`${b.escena}/${b.capa}`));
}

async function main(): Promise<void> {
  const layers = await findLayers();
  if (layers.length === 0) {
    console.log(`No hay imágenes en ${path.relative(process.cwd(), SOURCE_DIR)}.`);
    return;
  }

  const manifest: LayerEntry[] = [];
  let totalBytes = 0;

  for (const { escena, capa, file } of layers) {
    const transparent = await hasRealTransparency(file);
    const source = transparent ? sharp(file) : sharp(file).removeAlpha();
    const meta = await source.metadata();

    await mkdir(path.join(OUTPUT_DIR, escena), { recursive: true });

    const variants: LayerEntry['variantes'] = [];
    for (const width of WIDTHS) {
      if (meta.width !== undefined && width > meta.width) continue; // nunca ampliar
      for (const { ext, options } of FORMATS) {
        const relative = `fondos/${escena}/${capa}-${width}.${ext}`;
        const info = await source
          .clone()
          .resize({ width, withoutEnlargement: true })
          .toFormat(ext, options)
          .toFile(path.join(process.cwd(), 'public', relative));
        variants.push({ formato: ext, ancho: info.width, ruta: `/${relative}`, bytes: info.size });
        totalBytes += info.size;
      }
    }

    // Miniatura incrustable: 122 bytes de media, va dentro del CSS y evita el
    // rectángulo vacío mientras el fondo real viaja por la red.
    const lqip = await source.clone().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();

    manifest.push({
      escena,
      capa,
      ancho: meta.width ?? 0,
      alto: meta.height ?? 0,
      transparente: transparent,
      variantes: variants,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    });

    const smallest = Math.min(...variants.map((v) => v.bytes));
    const largest = Math.max(...variants.map((v) => v.bytes));
    console.log(
      `  ✓  ${escena}/${capa}`.padEnd(34) +
        `${meta.width}×${meta.height}` .padEnd(12) +
        `${transparent ? 'con alfa   ' : 'opaca      '}` +
        `${(smallest / 1024).toFixed(0)}–${(largest / 1024).toFixed(0)} KB`,
    );
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `\n${manifest.length} capa(s), ${(totalBytes / 1024 / 1024).toFixed(2)} MB en total.` +
      `\nManifiesto: ${path.relative(process.cwd(), MANIFEST)}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exitCode = 1;
});
