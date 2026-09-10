/**
 * Proveedor de generación sobre la API de Gemini.
 *
 * Usa la API de *interactions* del SDK @google/genai. Conviene saberlo porque
 * no es la forma que aparece en la mayoría de los tutoriales: `generateContent`
 * pertenece a la generación anterior de la API, y los campos de la petición van
 * en snake_case (`system_instruction`, `generation_config`) aunque el SDK sea
 * TypeScript.
 */
import { GoogleGenAI } from '@google/genai';
import { env } from '../env.ts';
import type { LLMChunk, LLMProvider, LLMRequest, LLMResult, LLMUsage } from './types.ts';

/**
 * Precios en dólares por millón de tokens, consultados en la documentación de
 * Google (septiembre de 2026). Viven aquí y no en una variable de entorno para
 * que el coste registrado en la base de datos sea reproducible: si la tarifa
 * cambia, el cambio queda en el historial de git junto a las respuestas que se
 * calcularon con la anterior.
 *
 * Nota: gemini-3.8-flash tiene precio promocional hasta el 31/12/2026, después
 * dobla ($1.50 / $7.50). Los modelos 2.5 no figuran porque la API ya los
 * rechaza para cuentas nuevas (404, comprobado el 10/09/2026).
 */
const PRICING: Record<string, { input: number; output: number }> = {
  'gemini-3.8-flash': { input: 0.75, output: 3.75 },
  'gemini-3.5-flash': { input: 1.5, output: 9.0 },
  'gemini-3.5-flash-lite': { input: 0.3, output: 2.5 },
};

interface RawUsage {
  total_input_tokens?: number | undefined;
  total_output_tokens?: number | undefined;
  total_cached_tokens?: number | undefined;
  total_thought_tokens?: number | undefined;
  model_invocation_token_counts?:
    | { candidates_tokens_details?: { tokens?: number | undefined }[] | undefined }[]
    | undefined;
}

/** ~4 caracteres por token en español: solo para estimar cuando falta el dato real. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Traduce el uso que informa Gemini a coste.
 *
 * Dos trampas comprobadas contra respuestas reales de la API:
 *
 *  - Los tokens de razonamiento (`total_thought_tokens`) se facturan como
 *    salida pero NO están incluidos en `total_output_tokens`. En una prueba,
 *    responder «hola» consumió 47 tokens de razonamiento y 3 de texto. Si se
 *    ignoran, el gasto registrado queda por debajo del real y el tope de
 *    presupuesto mensual llega tarde.
 *  - En algunas respuestas en streaming `total_output_tokens` llega a 0 aunque
 *    haya texto, o el evento final no llega. Registrar 0 desactivaría en
 *    silencio el control de gasto, así que se recurre al desglose por
 *    invocación y, en último caso, a una estimación por longitud del texto:
 *    sobrestimar un poco el gasto es preferible a no contarlo.
 */
function toUsage(model: string, raw: RawUsage | undefined, text: string, input: string): LLMUsage {
  const candidates = (raw?.model_invocation_token_counts ?? []).reduce(
    (sum, call) =>
      sum + (call.candidates_tokens_details ?? []).reduce((acc, d) => acc + (d.tokens ?? 0), 0),
    0,
  );
  const visible = raw?.total_output_tokens || candidates || estimateTokens(text);
  const thoughts = raw?.total_thought_tokens ?? 0;

  const inputTokens = raw?.total_input_tokens || estimateTokens(input);
  // Los tokens de razonamiento se guardan junto a los de salida: es lo que se
  // factura, y es lo que el control de presupuesto necesita sumar.
  const outputTokens = visible + thoughts;
  const cachedTokens = raw?.total_cached_tokens ?? 0;

  const price = PRICING[model];
  // Un modelo sin tarifa conocida registra coste 0, que es honesto: es mejor un
  // cero visible que una cifra inventada a partir del precio de otro modelo.
  const costUsd = price
    ? (inputTokens * price.input + outputTokens * price.output) / 1_000_000
    : 0;

  return { inputTokens, outputTokens, cachedTokens, costUsd };
}

export class GeminiProvider implements LLMProvider {
  readonly id: string;
  readonly #client: GoogleGenAI;

  constructor(model = env.geminiModel) {
    this.id = model;
    this.#client = new GoogleGenAI({ apiKey: env.geminiApiKey() });
  }

  async generate(request: LLMRequest): Promise<LLMResult> {
    const response = await this.#client.interactions.create({
      model: this.id,
      system_instruction: request.system,
      input: request.user,
      generation_config: {
        max_output_tokens: request.maxOutputTokens ?? 1024,
        // La tarea es sintetizar fragmentos que ya se le entregan, no resolver
        // un problema: razonar más solo añade latencia y tokens facturables.
        thinking_level: env.geminiThinkingLevel,
      },
      stream: false,
    });

    const text = response.output_text?.trim() ?? '';
    if (!text) {
      throw new Error(
        `Gemini no devolvió texto (estado: ${response.status ?? 'desconocido'}).`,
      );
    }
    // "incomplete" significa que se agotó max_output_tokens —el razonamiento
    // cuenta contra ese límite— y la respuesta está cortada. Se entrega igual,
    // pero debe quedar rastro: una respuesta a medias en un sitio profesional
    // es un fallo que hay que poder encontrar.
    if (response.status && response.status !== 'completed') {
      console.warn(`[gemini] respuesta con estado "${response.status}": probablemente truncada.`);
    }

    return {
      text,
      usage: toUsage(this.id, response.usage, text, request.system + request.user),
      model: this.id,
    };
  }

  async *generateStream(request: LLMRequest): AsyncGenerator<LLMChunk> {
    const stream = await this.#client.interactions.create({
      model: this.id,
      system_instruction: request.system,
      input: request.user,
      generation_config: {
        max_output_tokens: request.maxOutputTokens ?? 1024,
        thinking_level: env.geminiThinkingLevel,
      },
      stream: true,
    });

    let raw: RawUsage | undefined;
    let text = '';

    for await (const event of stream) {
      if (event.event_type === 'step.delta' && event.delta?.type === 'text') {
        const delta = event.delta.text;
        if (delta) {
          text += delta;
          yield { type: 'text', text: delta };
        }
      } else if (event.event_type === 'interaction.completed') {
        raw = event.interaction?.usage;
        const status = event.interaction?.status;
        if (status && status !== 'completed') {
          console.warn(`[gemini] stream terminado con estado "${status}": probablemente truncado.`);
        }
      }
    }

    if (!raw) console.warn('[gemini] el stream terminó sin evento final; el uso se estima.');

    yield {
      type: 'done',
      usage: toUsage(this.id, raw, text, request.system + request.user),
      model: this.id,
    };
  }
}
