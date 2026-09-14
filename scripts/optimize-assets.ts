/**
 * Optimiza las imágenes de fondo para la web.
 *
 *   assets/fondos/<escena>/<capa>.png   →   public/fondos/<escena>/<capa>-<ancho>.<formato>
 *
 * El número que lleva el nombre del fichero es la profundidad: 0 es el telón de
 * fondo y los siguientes se apilan encima, cada vez más cerca de quien mira
 * (`fondo-hero-0.png`, `fondo-hero-1.png`…). Si el nombre trae varios números
 * manda el último, que es donde se escribe el contador al exportar por lotes.
 *
 * Va en el nombre y no en un fichero de configuración aparte porque es la única
 * propiedad de una capa que no se puede deducir de la imagen, y porque así
 * añadir una capa intermedia es copiar un PNG y volver a ejecutar esto: no hay
 * ninguna lista que actualizar en el código.
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
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
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
  /** Profundidad: 0 es el fondo, el mayor es el primer plano. */
  orden: number;
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

interface Layer {
  escena: string;
  capa: string;
  orden: number;
  file: string;
}

async function findLayers(): Promise<Layer[]> {
  const scenes = await readdir(SOURCE_DIR, { withFileTypes: true });
  const layers: Layer[] = [];
  for (const scene of scenes) {
    if (!scene.isDirectory()) continue;
    for (const entry of await readdir(path.join(SOURCE_DIR, scene.name))) {
      if (!/\.(png|jpe?g|webp)$/i.test(entry)) continue;
      const capa = entry.replace(/\.[^.]+$/, '');
      // El último número del nombre: «fondo-hero-2» es la capa 2. Buscarlo al
      // final y no al principio permite usar los nombres tal y como salen del
      // programa de dibujo, sin renombrar nada al traerlos al repositorio.
      const profundidad = /(\d+)(?!.*\d)/.exec(capa);
      if (!profundidad) {
        throw new Error(
          `${scene.name}/${entry}: al nombre le falta la profundidad, ` +
            `como «fondo-hero-0.png» (0 es el fondo y los siguientes van encima).`,
        );
      }
      layers.push({
        escena: scene.name,
        capa,
        orden: Number(profundidad[1]),
        file: path.join(SOURCE_DIR, scene.name, entry),
      });
    }
  }
  return layers.sort(
    (a, b) => a.escena.localeCompare(b.escena) || a.orden - b.orden || a.capa.localeCompare(b.capa),
  );
}

/**
 * Todas las variantes de una capa. Se emiten en paralelo: cada llamada a sharp
 * es una tarea que libvips resuelve en su propio grupo de hilos, así que
 * encadenarlas a mano deja casi todos los núcleos sin hacer nada. Con una capa
 * opaca daba igual; en cuanto entran capas con canal alfa, que es donde AVIF se
 * vuelve caro, esperar es lo que decide si retocar un recorte se puede hacer
 * varias veces seguidas o no. Una escena de tres capas tarda aquí un minuto de
 * reloj y consume tres de CPU: esa diferencia es justo lo que se recupera.
 */
async function processLayer({ escena, capa, orden, file }: Layer): Promise<LayerEntry> {
  const transparent = await hasRealTransparency(file);
  const source = transparent ? sharp(file) : sharp(file).removeAlpha();
  const meta = await source.metadata();

  await mkdir(path.join(OUTPUT_DIR, escena), { recursive: true });

  const tareas: Promise<LayerEntry['variantes'][number]>[] = [];
  for (const width of WIDTHS) {
    if (meta.width !== undefined && width > meta.width) continue; // nunca ampliar
    for (const { ext, options } of FORMATS) {
      const relative = `fondos/${escena}/${capa}-${width}.${ext}`;
      tareas.push(
        source
          .clone()
          .resize({ width, withoutEnlargement: true })
          .toFormat(ext, options)
          .toFile(path.join(process.cwd(), 'public', relative))
          .then((info) => ({
            formato: ext as string,
            ancho: info.width,
            ruta: `/${relative}`,
            bytes: info.size,
          })),
      );
    }
  }

  // Miniatura incrustable: 122 bytes de media, va dentro del CSS y evita el
  // rectángulo vacío mientras el fondo real viaja por la red.
  const lqipTarea = source.clone().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();

  const [variantes, lqip] = await Promise.all([Promise.all(tareas), lqipTarea]);

  return {
    escena,
    capa,
    orden,
    ancho: meta.width ?? 0,
    alto: meta.height ?? 0,
    transparente: transparent,
    variantes,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
}

async function main(): Promise<void> {
  const layers = await findLayers();
  if (layers.length === 0) {
    console.log(`No hay imágenes en ${path.relative(process.cwd(), SOURCE_DIR)}.`);
    return;
  }

  // La salida se rehace entera. Las capas se renombran y se reordenan a
  // menudo, y un PNG que ya no existe dejaría aquí sus derivados para siempre:
  // peso muerto en la imagen de Docker y, peor, una ruta que el manifiesto ya
  // no menciona pero que sigue respondiendo.
  await rm(OUTPUT_DIR, { recursive: true, force: true });

  // Las capas también van a la vez. El resumen se imprime después, en el orden
  // en que se apilan y no en el que hayan ido terminando, que no dice nada.
  const manifest = await Promise.all(layers.map(processLayer));

  let totalBytes = 0;
  for (const entrada of manifest) {
    const bytes = entrada.variantes.map((v) => v.bytes);
    totalBytes += bytes.reduce((a, b) => a + b, 0);
    console.log(
      `  ✓  ${entrada.escena}/${entrada.capa}`.padEnd(34) +
        `${entrada.ancho}×${entrada.alto}`.padEnd(12) +
        `${entrada.transparente ? 'con alfa   ' : 'opaca      '}` +
        `${(Math.min(...bytes) / 1024).toFixed(0)}–${(Math.max(...bytes) / 1024).toFixed(0)} KB`,
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
