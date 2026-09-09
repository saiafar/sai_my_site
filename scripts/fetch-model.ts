/**
 * Descarga el modelo de embeddings a la caché local (./.models).
 *
 * Se ejecuta durante la construcción de la imagen para que el modelo viaje
 * dentro de ella. La alternativa —descargarlo en el primer arranque— haría que
 * un despliegue pudiera fallar porque Hugging Face esté caído o la red del
 * servidor tenga un mal día. Un contenedor debe poder arrancar sin salir a
 * Internet.
 */
import { getEmbeddingProvider } from '../src/lib/embeddings/local.ts';

const provider = getEmbeddingProvider();
const started = Date.now();

const [vector] = await provider.embedPassages(['comprobación de la descarga del modelo']);
if (!vector || vector.length !== provider.dimensions) {
  throw new Error(`El modelo no devolvió un vector válido (${vector?.length} dimensiones).`);
}

console.log(
  `Modelo ${provider.id} listo: ${provider.dimensions} dimensiones, ` +
    `${((Date.now() - started) / 1000).toFixed(1)}s.`,
);
