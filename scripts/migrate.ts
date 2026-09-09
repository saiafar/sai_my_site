/**
 * Aplicador de migraciones.
 *
 * Cada fichero .sql de db/migrations se aplica una sola vez, en orden
 * alfabético y dentro de una transacción. El registro de lo aplicado vive en la
 * propia base de datos, de modo que la fuente de verdad del estado del esquema
 * es la base, no un fichero local que podría desincronizarse entre máquinas.
 *
 * Se comprueba además el hash de cada migración ya aplicada: editar una
 * migración que ya corrió en producción deja las dos bases divergentes sin que
 * nada lo señale, y es una de las formas más silenciosas de romper un
 * despliegue. Ante ese caso, aquí se falla.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { closePool, getPool, LOCK_MIGRATE, query, withAdvisoryLock } from '../src/lib/db/index.ts';

const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations');

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

async function ensureRegistry(): Promise<void> {
  await query(`
    create table if not exists schema_migrations (
      version    text primary key,
      checksum   text not null,
      applied_at timestamptz not null default now()
    )
  `);
}

async function main(): Promise<void> {
  const pool = await getPool();
  await ensureRegistry();

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  const applied = new Map(
    (await query<{ version: string; checksum: string }>(
      'select version, checksum from schema_migrations',
    )).map((row) => [row.version, row.checksum]),
  );

  let ran = 0;

  for (const file of files) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const checksum = sha256(sql);
    const previous = applied.get(file);

    if (previous !== undefined) {
      if (previous !== checksum) {
        throw new Error(
          `La migración ${file} ya se aplicó pero su contenido ha cambiado.\n` +
            `Modificar una migración aplicada deja los entornos divergentes sin aviso.\n` +
            `Crea una migración nueva que corrija lo que haga falta.`,
        );
      }
      console.log(`  ·  ${file} (ya aplicada)`);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query(
        'insert into schema_migrations (version, checksum) values ($1, $2)',
        [file, checksum],
      );
      await client.query('commit');
      console.log(`  ✓  ${file}`);
      ran += 1;
    } catch (error) {
      await client.query('rollback');
      console.error(`  ✗  ${file}`);
      throw error;
    } finally {
      client.release();
    }
  }

  console.log(
    ran === 0
      ? '\nEsquema ya al día.'
      : `\n${ran} migración(es) aplicada(s).`,
  );
}

withAdvisoryLock(LOCK_MIGRATE, main)
  .catch((error: unknown) => {
    console.error('\n' + (error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  })
  .finally(closePool);
