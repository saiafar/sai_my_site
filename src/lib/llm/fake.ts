/**
 * Proveedor determinista para desarrollo y pruebas.
 *
 * No es un simulacro decorativo: permite construir y validar todo el camino
 * —recuperación, montaje del contexto, caché, límite de peticiones, registro de
 * telemetría— sin clave de API, sin coste y sin variabilidad entre ejecuciones.
 * Cuando llega la clave, lo único sin probar es la llamada HTTP.
 *
 * Devuelve un resumen de lo que ha recibido, de modo que si el contexto está
 * mal montado se ve en la respuesta en lugar de quedar disimulado por la
 * fluidez del modelo real.
 */
import type { LLMChunk, LLMProvider, LLMRequest, LLMResult, LLMUsage } from './types.ts';

/** ~4 caracteres por token: suficiente para que el registro de uso sea realista. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function compose(request: LLMRequest): string {
  const citations = [...request.user.matchAll(/\[(\d+)\]\s+(.+)/g)].map((m) => m[2]);

  if (citations.length === 0) {
    return 'No dispongo de información sobre eso en la documentación consultada.';
  }

  return [
    `[respuesta simulada] He recibido ${citations.length} fragmento(s) de contexto:`,
    ...citations.map((c, i) => `  ${i + 1}. ${c}`),
    '',
    'Un modelo real sintetizaría estos fragmentos en una respuesta en prosa,',
    'citando cada afirmación con su marcador.',
  ].join('\n');
}

export class FakeProvider implements LLMProvider {
  readonly id = 'fake';

  async generate(request: LLMRequest): Promise<LLMResult> {
    const text = compose(request);
    return { text, usage: this.#usage(request, text), model: this.id };
  }

  async *generateStream(request: LLMRequest): AsyncGenerator<LLMChunk> {
    const text = compose(request);
    // Se emite por palabras para ejercitar de verdad el consumidor del stream:
    // un solo trozo grande no distingue un cliente SSE correcto de uno roto.
    for (const word of text.split(/(\s+)/)) {
      if (word) yield { type: 'text', text: word };
    }
    yield { type: 'done', usage: this.#usage(request, text), model: this.id };
  }

  #usage(request: LLMRequest, output: string): LLMUsage {
    return {
      inputTokens: estimateTokens(request.system + request.user),
      outputTokens: estimateTokens(output),
      cachedTokens: 0,
      costUsd: 0,
    };
  }
}
