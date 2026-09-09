/**
 * Contrato de generación, independiente del proveedor.
 *
 * La abstracción se justifica sola en este proyecto: los embeddings los produce
 * un modelo local y las respuestas un servicio externo, así que hay dos
 * proveedores distintos desde el primer día. Y el externo se elige con datos
 * —comparando calidad y coste sobre el corpus real—, no de antemano.
 */

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  costUsd: number;
}

export interface LLMRequest {
  /** Instrucciones y guardarraíles. Estable entre peticiones. */
  system: string;
  /** Contexto recuperado más la pregunta del visitante. */
  user: string;
  maxOutputTokens?: number;
}

export interface LLMResult {
  text: string;
  usage: LLMUsage;
  model: string;
}

/** Fragmentos de una respuesta en streaming. */
export type LLMChunk =
  | { type: 'text'; text: string }
  | { type: 'done'; usage: LLMUsage; model: string };

export interface LLMProvider {
  readonly id: string;
  generate(request: LLMRequest): Promise<LLMResult>;
  generateStream(request: LLMRequest): AsyncGenerator<LLMChunk>;
}

export const ZERO_USAGE: LLMUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cachedTokens: 0,
  costUsd: 0,
};
