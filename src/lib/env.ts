import { config } from 'dotenv';

// En Next.js las variables ya vienen cargadas; en los scripts de CLI no.
config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Cópiala de .env.example a .env.local.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

// Las credenciales se validan en el momento de usarlas, no al importar el
// módulo. Comprobarlas al cargar parece más estricto, pero acopla módulos que
// no tienen nada que ver: descargar el modelo de embeddings durante la
// construcción de la imagen no necesita una base de datos, y sin embargo
// fallaba por exigir DATABASE_URL. Cada capa pide lo que realmente usa.
export const env = {
  databaseUrl: () => required('DATABASE_URL'),
  geminiApiKey: () => required('GEMINI_API_KEY'),

  // Estas sí tienen valor por defecto, así que no pueden faltar.
  embeddingModel: optional('EMBEDDING_MODEL', 'Xenova/multilingual-e5-small'),
  embeddingDim: Number(optional('EMBEDDING_DIM', '384')),
} as const;

// La dimensión del vector está fijada en el esquema SQL como vector(384) y no
// puede parametrizarse desde una variable de entorno. Si alguien cambia
// EMBEDDING_DIM sin migrar la tabla, Postgres rechazaría cada inserción con un
// error críptico sobre dimensiones; es preferible fallar aquí y decir por qué.
export const SCHEMA_EMBEDDING_DIM = 384;

if (env.embeddingDim !== SCHEMA_EMBEDDING_DIM) {
  throw new Error(
    `EMBEDDING_DIM=${env.embeddingDim} no coincide con la dimensión del esquema ` +
      `(vector(${SCHEMA_EMBEDDING_DIM})). Cambiar de modelo de embeddings requiere ` +
      `una migración que altere el tipo de la columna chunks.embedding y volver a ` +
      `vectorizar todo el corpus.`,
  );
}
