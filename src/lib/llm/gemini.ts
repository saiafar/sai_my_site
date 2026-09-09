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
 * dobla ($1.50 / $7.50).
 */
const PRICING: Record<string, { input: number; output: number }> = {
  'gemini-3.8-flash': { input: 0.75, output: 3.75 },
  'gemini-3.5-flash': { input: 1.5, output: 9.0 },
  'gemini-3.5-flash-lite': { input: 0.3, output: 2.5 },
  'gemini-2.5-flash': { input: 0.3, output: 2.5 },
  'gemini-2.5-flash-lite': { input: 0.1, output: 0.4 },
};

interface RawUsage {
  total_input_tokens?: number | undefined;
  total_output_tokens?: number | undefined;
  total_cached_tokens?: number | undefined;
}

function toUsage(model: string, raw: RawUsage | undefined): LLMUsage {
  const inputTokens = raw?.total_input_tokens ?? 0;
  const outputTokens = raw?.total_output_tokens ?? 0;
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
        // Sin razonamiento extendido: la tarea es sintetizar fragmentos que ya
        // se le entregan, no resolver un problema. Pensar más aquí solo añade
        // latencia y tokens de salida facturables.
        thinking_level: 'low',
      },
      stream: false,
    });

    const text = response.output_text?.trim() ?? '';
    if (!text) {
      throw new Error(
        `Gemini no devolvió texto (estado: ${response.status ?? 'desconocido'}).`,
      );
    }

    return { text, usage: toUsage(this.id, response.usage), model: this.id };
  }

  async *generateStream(request: LLMRequest): AsyncGenerator<LLMChunk> {
    const stream = await this.#client.interactions.create({
      model: this.id,
      system_instruction: request.system,
      input: request.user,
      generation_config: {
        max_output_tokens: request.maxOutputTokens ?? 1024,
        thinking_level: 'low',
      },
      stream: true,
    });

    let usage: LLMUsage | undefined;

    for await (const event of stream) {
      if (event.event_type === 'step.delta' && event.delta?.type === 'text') {
        const text = event.delta.text;
        if (text) yield { type: 'text', text };
      } else if (event.event_type === 'interaction.completed') {
        usage = toUsage(this.id, event.interaction?.usage);
      }
    }

    yield { type: 'done', usage: usage ?? toUsage(this.id, undefined), model: this.id };
  }
}
