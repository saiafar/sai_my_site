/**
 * Pipeline completo: pregunta -> respuesta con fuentes.
 *
 * Orquesta validación, caché, presupuesto, recuperación, generación y registro.
 * Vive separado de cualquier detalle de HTTP para que el mismo código sirva al
 * endpoint /api/chat y al CLI, y para que se pueda probar sin levantar un
 * servidor.
 *
 * El orden de las comprobaciones no es casual: lo que puede rechazar la
 * petición sin coste va primero, y la llamada al modelo —lo único que cuesta
 * dinero— es lo último que ocurre.
 */
import { createHash } from 'node:crypto';
import { env } from '../env.ts';
import { query } from '../db/index.ts';
import { getLLMProvider } from '../llm/index.ts';
import type { LLMUsage } from '../llm/types.ts';
import { ZERO_USAGE } from '../llm/types.ts';
import { retrieve, type RetrievedChunk } from './retrieve.ts';
import { buildContext, buildUserMessage, getSystemPrompt } from './prompt.ts';
import { checkBudget, checkRateLimit, validateQuestion } from './limits.ts';

export interface AnswerSource {
  marker: number;
  slug: string;
  title: string;
  section: string;
  chunkId: number;
}

export interface AnswerResult {
  answer: string;
  sources: AnswerSource[];
  usage: LLMUsage;
  model: string;
  latencyMs: number;
  /** Servida desde la caché: no ha habido llamada al modelo. */
  cached: boolean;
  /** Presente si la respuesta no se generó (límite, presupuesto, validación). */
  refusalReason?: string;
}

export interface AnswerOptions {
  clientKey: string;
  conversationId?: string;
  userAgent?: string;
  matchCount?: number;
  lang?: 'es' | 'en';
}

function promptFingerprint(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex').slice(0, 16);
}

/**
 * Clave de caché. Normaliza la pregunta para que las variantes triviales
 * compartan entrada, e incluye el modelo, idioma y una huella del prompt del sistema.
 */
function cacheKey(question: string, model: string, systemPrompt: string, lang: string): string {
  const normalized = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return createHash('sha256')
    .update(`${model}|${lang}|${promptFingerprint(systemPrompt)}|${normalized}`)
    .digest('hex');
}

function sourcesFrom(chunks: readonly RetrievedChunk[]): AnswerSource[] {
  return chunks.map((chunk, index) => ({
    marker: index + 1,
    slug: chunk.slug,
    title: chunk.title,
    section: chunk.headingPath.join(' › '),
    chunkId: chunk.chunkId,
  }));
}

async function ensureConversation(
  conversationId: string | undefined,
  clientKey: string,
  userAgent: string | undefined,
): Promise<string> {
  if (conversationId) {
    await query(
      `update conversations set last_seen_at = now() where id = $1`,
      [conversationId],
    );
    return conversationId;
  }
  const rows = await query<{ id: string }>(
    `insert into conversations (client_key, user_agent) values ($1, $2) returning id`,
    [clientKey, userAgent ?? null],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error('No se pudo crear la conversación.');
  return id;
}

async function nextTurn(conversationId: string): Promise<number> {
  const rows = await query<{ turn: number | null }>(
    `select max(turn) as turn from messages where conversation_id = $1`,
    [conversationId],
  );
  return (rows[0]?.turn ?? 0) + 1;
}

async function persist(
  conversationId: string,
  turn: number,
  question: string,
  result: AnswerResult,
): Promise<void> {
  await query(
    `insert into messages (conversation_id, turn, role, content) values ($1,$2,'user',$3)
     on conflict do nothing`,
    [conversationId, turn, question],
  );
  await query(
    `insert into messages
       (conversation_id, turn, role, content, retrieval, model,
        input_tokens, output_tokens, cost_usd, latency_ms, refusal_reason)
     values ($1,$2,'assistant',$3,$4::jsonb,$5,$6,$7,$8,$9,$10)
     on conflict do nothing`,
    [
      conversationId, turn, result.answer,
      JSON.stringify(result.sources), result.model,
      result.usage.inputTokens, result.usage.outputTokens, result.usage.costUsd,
      result.latencyMs, result.refusalReason ?? null,
    ],
  );
}

/**
 * Respuesta de rechazo.
 *
 * No se persiste en `messages` a propósito. Registrar cada rechazo parece útil
 * —saber a quién se está frenando— pero significaría que quien está siendo
 * bloqueado por exceso de peticiones consigue, precisamente al ser bloqueado,
 * escribir una fila por intento. El recuento ya vive en rate_limit_buckets, que
 * es una fila por visitante y hora en lugar de una por petición.
 */
function refusal(reason: string, startedAt: number): AnswerResult {
  return {
    answer: reason,
    sources: [],
    usage: ZERO_USAGE,
    model: 'ninguno',
    latencyMs: Date.now() - startedAt,
    cached: false,
    refusalReason: reason,
  };
}

export async function answerQuestion(
  question: string,
  options: AnswerOptions,
): Promise<AnswerResult> {
  const startedAt = Date.now();
  const provider = getLLMProvider();
  const lang = options.lang ?? 'es';
  const systemPrompt = getSystemPrompt(lang);

  // --- 1. Validación. Sin tocar la base de datos. -------------------------
  const valid = validateQuestion(question);
  if (!valid.allowed) return refusal(valid.reason ?? (lang === 'en' ? 'Invalid question.' : 'Pregunta no válida.'), startedAt);

  // --- 2. Límite por visitante. -------------------------------------------
  // Antes de la caché, no después: una respuesta cacheada no cuesta tokens,
  // pero sí una consulta a la base de datos, y un bucle contra la caché sigue
  // siendo una forma de tumbar el servicio.
  const rate = await checkRateLimit(options.clientKey);
  if (!rate.allowed) return refusal(rate.reason ?? (lang === 'en' ? 'Too many requests.' : 'Demasiadas peticiones.'), startedAt);

  // --- 3. Caché de respuestas. --------------------------------------------
  const key = cacheKey(question, provider.id, systemPrompt, lang);
  const cached = await query<{ answer: string; retrieval: AnswerSource[] | null }>(
    `update response_cache
       set hits = hits + 1, last_hit_at = now()
     where question_hash = $1
     returning answer, retrieval`,
    [key],
  );
  const hit = cached[0];
  if (hit) {
    return {
      answer: hit.answer,
      sources: hit.retrieval ?? [],
      usage: ZERO_USAGE,
      model: provider.id,
      latencyMs: Date.now() - startedAt,
      cached: true,
    };
  }

  // --- 4. Presupuesto mensual. --------------------------------------------
  const budget = await checkBudget();
  if (!budget.allowed) return refusal(budget.reason ?? (lang === 'en' ? 'Monthly budget exhausted.' : 'Presupuesto agotado.'), startedAt);

  // --- 5. Recuperación. ---------------------------------------------------
  const chunks = await retrieve(question, { matchCount: options.matchCount ?? 6, lang });
  const context = buildContext(chunks);

  // --- 6. Generación. Lo único que cuesta dinero. -------------------------
  const generated = await provider.generate({
    system: systemPrompt,
    user: buildUserMessage(question, context, lang),
    maxOutputTokens: 1024,
  });

  const result: AnswerResult = {
    answer: generated.text,
    sources: sourcesFrom(context.used),
    usage: generated.usage,
    model: generated.model,
    latencyMs: Date.now() - startedAt,
    cached: false,
  };

  // --- 7. Registro y caché. ----------------------------------------------
  const conversationId = await ensureConversation(
    options.conversationId, options.clientKey, options.userAgent,
  );
  const turn = await nextTurn(conversationId);
  await persist(conversationId, turn, question, result);

  // Solo se cachea si hubo contexto real y la respuesta no es un «no consta».
  // Cachear un «no consta» significaría que la respuesta seguiría siendo «no consta»
  // después de escribir o mejorar el documento que la resolvía.
  const isNoConsta =
    result.answer.includes('no está recogido en la documentación') ||
    result.answer.includes('not covered in the documentation') ||
    result.answer.includes('no consta en la documentación') ||
    result.answer.includes('not documented');

  if (context.used.length > 0 && !isNoConsta && !result.refusalReason) {
    await query(
      `insert into response_cache (question_hash, question, answer, retrieval, model)
       values ($1,$2,$3,$4::jsonb,$5)
       on conflict (question_hash) do nothing`,
      [key, question.trim(), result.answer, JSON.stringify(result.sources), result.model],
    );
  }

  return result;
}

export { env };
