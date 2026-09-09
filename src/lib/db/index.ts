import pg from 'pg';
import { env } from '../env.ts';

// pgvector devuelve los vectores como texto ('[0.1,0.2,...]'). Sin este parser,
// cada lectura de un embedding obliga a hacer JSON.parse en el sitio de uso.
// El OID del tipo vector no es fijo (lo asigna la extensión al instalarse), así
// que se resuelve una vez contra el catálogo.
let vectorTypeRegistered = false;

async function registerVectorType(pool: pg.Pool): Promise<void> {
  if (vectorTypeRegistered) return;
  const { rows } = await pool.query<{ oid: string }>(
    `select oid from pg_type where typname = 'vector'`,
  );
  const oid = rows[0]?.oid;
  if (oid) {
    pg.types.setTypeParser(Number(oid), (value: string) => JSON.parse(value) as number[]);
  }
  vectorTypeRegistered = true;
}

let poolPromise: Promise<pg.Pool> | undefined;

export function getPool(): Promise<pg.Pool> {
  poolPromise ??= (async () => {
    const pool = new pg.Pool({
      connectionString: env.databaseUrl(),
      max: 8,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    // Una conexión rota no debe tumbar el proceso.
    pool.on('error', (err) => console.error('[db] error en cliente inactivo:', err.message));
    await registerVectorType(pool);
    return pool;
  })();
  return poolPromise;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const pool = await getPool();
  const result = await pool.query<T>(text, params as unknown[]);
  return result.rows;
}

/** Ejecuta `fn` dentro de una transacción, con rollback automático si lanza. */
export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (!poolPromise) return;
  const pool = await poolPromise;
  poolPromise = undefined;
  await pool.end();
}


/**
 * Ejecuta `fn` en exclusión mutua entre procesos, usando un advisory lock de
 * PostgreSQL.
 *
 * Migración e ingestión se lanzan al arrancar el contenedor. Con una sola
 * réplica no hay conflicto posible, pero durante un redespliegue conviven
 * brevemente el contenedor viejo y el nuevo, y dos ingestiones simultáneas
 * sobre el mismo documento se pisan: una borra los fragmentos que la otra
 * acaba de insertar. Es un fallo intermitente, difícil de reproducir y fácil de
 * prevenir. El lock es a nivel de sesión y PostgreSQL lo libera solo si el
 * proceso muere, así que un contenedor que caiga a mitad no deja la puerta
 * cerrada.
 */
export async function withAdvisoryLock<T>(key: number, fn: () => Promise<T>): Promise<T> {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    const waited = Date.now();
    await client.query('select pg_advisory_lock($1)', [key]);
    const elapsed = Date.now() - waited;
    if (elapsed > 1_000) console.log(`  (esperando otro proceso: ${(elapsed / 1000).toFixed(1)}s)`);
    return await fn();
  } finally {
    await client.query('select pg_advisory_unlock($1)', [key]).catch(() => {});
    client.release();
  }
}

/** Claves de bloqueo, arbitrarias pero fijas: deben coincidir entre despliegues. */
export const LOCK_MIGRATE = 776_101;
export const LOCK_INGEST = 776_102;

/** Serializa un array de números al formato literal que espera pgvector. */
export function toVectorLiteral(values: readonly number[]): string {
  return `[${values.join(',')}]`;
}
