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

  // Medido el 10/09/2026 con preguntas reales sobre el corpus:
  //   gemini-3.8-flash (low)          primer token 1,2–12,5 s, total 6–18 s,
  //                                   y una respuesta cortada a media frase.
  //   gemini-3.5-flash-lite (minimal) primer token ~0,9 s, total ~2,6 s,
  //                                   calidad equivalente y «no consta» correcto.
  // Para sintetizar fragmentos ya recuperados, el modelo pequeño sin
  // razonamiento es un orden de magnitud más rápido y además más barato
  // (0,30 $ / 2,50 $ por millón frente a 0,75 $ / 3,75 $). Dos preguntas son una
  // muestra corta: si el set de evaluación de respuestas detecta pérdida de
  // calidad, se sube con GEMINI_MODEL sin tocar código.
  geminiModel: optional('GEMINI_MODEL', 'gemini-3.5-flash-lite'),

  // "minimal" solo lo aceptan los modelos lite; gemini-3.8-flash exige
  // low | medium | high y responde 400 con "minimal".
  geminiThinkingLevel: optional('GEMINI_THINKING_LEVEL', 'minimal'),

  siteOwner: optional('SITE_OWNER', 'Rafaias Villán'),

  // Sal para el hash que identifica a un visitante sin guardar su IP. En
  // producción debe fijarse: si cambia en cada arranque, los límites por
  // visitante se reinician con cada despliegue.
  clientKeySalt: optional('CLIENT_KEY_SALT', 'desarrollo-local'),

  // Techo de gasto mensual. Al alcanzarlo el asistente deja de llamar al modelo
  // y responde con un aviso, en lugar de seguir facturando.
  monthlyBudgetUsd: Number(optional('MONTHLY_BUDGET_USD', '5')),

  // Límites por visitante, por hora.
  rateLimitPerHour: Number(optional('RATE_LIMIT_PER_HOUR', '30')),
  maxQuestionChars: Number(optional('MAX_QUESTION_CHARS', '500')),

  // Un buscador solo pasa por un dominio nuevo una vez con atención plena, y
  // lo que encuentre esa primera vez condiciona cómo lo trata después. Mientras
  // el corpus esté a medias conviene que no lo mire: el sitio se sirve con
  // noindex hasta que se ponga esta variable a "true" de forma explícita.
  siteIndexable: optional('SITE_INDEXABLE', 'false') === 'true',
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
