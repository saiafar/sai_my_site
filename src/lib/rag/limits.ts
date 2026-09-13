/**
 * Control de abuso y de gasto.
 *
 * Un chat público conectado a una API de pago es, de partida, un vector de
 * abuso: basta un bucle de curl para consumir el presupuesto de un mes en una
 * tarde. Estos controles son la condición para poder exponerlo a Internet.
 *
 * Viven en PostgreSQL y no en memoria del proceso a propósito: un contador en
 * memoria se reinicia con cada despliegue —y en Dokploy los despliegues son
 * frecuentes—, lo que convierte el límite en una sugerencia.
 */
import { createHash } from 'node:crypto';
import { env } from '../env.ts';
import { query } from '../db/index.ts';

/**
 * Identificador estable de un visitante, sin almacenar su IP.
 *
 * La IP es un dato personal y no hace falta conservarla: lo único que se
 * necesita es poder reconocer que dos peticiones vienen del mismo origen. Un
 * hash con sal lo consigue y es irreversible sin la sal.
 */
export function clientKeyFrom(ip: string, userAgent = ''): string {
  return createHash('sha256')
    .update(`${ip}|${userAgent}|${env.clientKeySalt}`)
    .digest('hex')
    .slice(0, 32);
}

export interface LimitVerdict {
  allowed: boolean;
  reason?: string;
}

/**
 * Ventana fija de una hora. Se elige frente a la ventana deslizante por ser una
 * única fila y un único UPSERT: el error de la ventana fija —permitir hasta el
 * doble del límite en el instante del cambio de hora— es irrelevante cuando el
 * objetivo es frenar el abuso, no repartir cuota con precisión.
 */
export async function checkRateLimit(
  clientKey: string,
  limite = env.rateLimitPerHour,
): Promise<LimitVerdict> {
  const rows = await query<{ hits: number }>(
    `insert into rate_limit_buckets (bucket_key, window_start, hits)
     values ($1, date_trunc('hour', now()), 1)
     on conflict (bucket_key, window_start)
       do update set hits = rate_limit_buckets.hits + 1
     returning hits`,
    [clientKey],
  );

  const hits = rows[0]?.hits ?? 0;
  if (hits > limite) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limite} envíos por hora. Inténtalo más tarde.`,
    };
  }
  return { allowed: true };
}

/** Gasto acumulado del mes en curso, en dólares. */
export async function monthlySpendUsd(): Promise<number> {
  const rows = await query<{ cost_usd: string }>(
    `select coalesce(cost_usd, 0) as cost_usd from monthly_usage
     where month = date_trunc('month', now())::date`,
  );
  return Number(rows[0]?.cost_usd ?? 0);
}

export async function checkBudget(): Promise<LimitVerdict> {
  const spent = await monthlySpendUsd();
  if (spent >= env.monthlyBudgetUsd) {
    return {
      allowed: false,
      reason:
        'El asistente ha alcanzado su presupuesto mensual y no puede responder ' +
        'ahora mismo. Las secciones del sitio siguen disponibles.',
    };
  }
  return { allowed: true };
}

/** Validación de la pregunta antes de gastar un solo token. */
export function validateQuestion(question: string): LimitVerdict {
  const trimmed = question.trim();
  if (trimmed.length < 3) {
    return { allowed: false, reason: 'La pregunta está vacía.' };
  }
  if (trimmed.length > env.maxQuestionChars) {
    return {
      allowed: false,
      reason: `La pregunta no puede superar los ${env.maxQuestionChars} caracteres.`,
    };
  }
  return { allowed: true };
}

/**
 * Limpieza de las filas de límite ya caducadas. Sin esto la tabla crece sin
 * fin: es poca cosa, pero es la clase de detalle que a los dos años deja una
 * tabla con millones de filas muertas.
 */
export async function pruneRateLimits(): Promise<number> {
  const rows = await query<{ count: string }>(
    `with borradas as (
       delete from rate_limit_buckets
       where window_start < now() - interval '2 days'
       returning 1
     ) select count(*)::text as count from borradas`,
  );
  return Number(rows[0]?.count ?? 0);
}
