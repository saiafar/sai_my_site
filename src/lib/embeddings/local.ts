/**
 * Vectorización local sobre ONNX Runtime.
 *
 * El servidor no puede alojar un LLM de generación, pero un modelo de
 * embeddings es un encoder de ~120 MB cuantizado a 8 bits: cabe holgadamente y
 * vectoriza a unos 20-25 ms por fragmento en CPU. La consecuencia práctica es
 * que reindexar el corpus entero es gratis, lo que permite iterar sobre la
 * estrategia de troceado tantas veces como haga falta —que es exactamente lo
 * que determina la calidad final del sistema.
 */
import { env as hfEnv, pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';
import { env } from '../env.ts';
import type { EmbeddingProvider } from './types.ts';

// El modelo se cachea en el repositorio, no en el home del usuario: así la
// imagen de Docker puede llevarlo dentro y el arranque en producción no depende
// de poder alcanzar Hugging Face.
//
// La ruta se puede fijar por entorno porque el directorio de trabajo no es el
// mismo en todos los contextos: los scripts de CLI corren desde la raíz del
// repositorio, pero el servidor de Next en modo standalone arranca desde
// .next/standalone, y una ruta relativa apuntaría ahí a un directorio que no
// existe. En ese caso el modelo se volvería a descargar en cada arranque en
// lugar de fallar, que es peor: funciona en desarrollo y sangra tiempo y red
// en producción sin avisar.
hfEnv.cacheDir = process.env['MODEL_CACHE_DIR'] ?? './.models';

/** Cargar el modelo cuesta unos 4 s, así que se hace una sola vez por proceso. */
let extractorPromise: Promise<FeatureExtractionPipeline> | undefined;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  extractorPromise ??= pipeline('feature-extraction', env.embeddingModel, { dtype: 'q8' });
  return extractorPromise;
}

/**
 * Lotes pequeños a propósito. La memoria de activación crece con
 * lote × longitud², y en 8 GB compartidos con Postgres, Traefik y n8n, un lote
 * grande es la forma más fácil de que el OOM killer se lleve el proceso a mitad
 * de una ingestión.
 */
const BATCH_SIZE = 16;

export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly id = env.embeddingModel;
  readonly dimensions = env.embeddingDim;

  async embedPassages(texts: readonly string[]): Promise<number[][]> {
    return this.#embed(texts.map((t) => `passage: ${t}`));
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.#embed([`query: ${text}`]);
    if (!vector) throw new Error('El modelo de embeddings no devolvió ningún vector.');
    return vector;
  }

  async #embed(inputs: readonly string[]): Promise<number[][]> {
    if (inputs.length === 0) return [];
    const extractor = await getExtractor();
    const vectors: number[][] = [];

    for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
      const batch = inputs.slice(i, i + BATCH_SIZE);
      // normalize:true deja los vectores a norma 1, de modo que la distancia
      // coseno de pgvector y el producto interno son equivalentes.
      const output = await extractor(batch as string[], { pooling: 'mean', normalize: true });
      const rows = output.tolist() as number[][];
      for (const row of rows) {
        if (row.length !== this.dimensions) {
          throw new Error(
            `El modelo devolvió vectores de ${row.length} dimensiones, pero el esquema ` +
              `espera ${this.dimensions}.`,
          );
        }
        vectors.push(row);
      }
    }
    return vectors;
  }
}

let providerInstance: EmbeddingProvider | undefined;

export function getEmbeddingProvider(): EmbeddingProvider {
  providerInstance ??= new LocalEmbeddingProvider();
  return providerInstance;
}
