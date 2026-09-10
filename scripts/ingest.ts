/**
 * Ingestión de la base de conocimiento.
 *
 * Markdown -> documentos + fragmentos + embeddings en PostgreSQL.
 *
 * Dos propiedades que el pipeline garantiza y de las que depende todo lo demás:
 *
 *  - Es idempotente. Un documento cuyo hash no ha cambiado no se reprocesa, y
 *    dentro de un documento que sí cambió, solo se vuelven a vectorizar las
 *    secciones cuyo texto cambió. Ejecutarlo dos veces seguidas no escribe nada
 *    la segunda vez.
 *  - Es reconstruible. Borrar todas las tablas y volver a ejecutarlo devuelve
 *    exactamente el mismo estado, porque el Markdown es la única fuente de
 *    verdad.
 *
 * Uso:
 *   npm run ingest            solo lo que haya cambiado
 *   npm run ingest -- --force revectoriza todo (tras cambiar el troceado)
 *   npm run ingest -- --dry   analiza y muestra el plan, sin escribir
 *   npm run ingest -- --allow-prune  autoriza un borrado masivo de huérfanos
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { PoolClient } from 'pg';
import { closePool, LOCK_INGEST, query, toVectorLiteral, transaction, withAdvisoryLock } from '../src/lib/db/index.ts';
import { getEmbeddingProvider } from '../src/lib/embeddings/local.ts';
import { parseDocument, type ParsedDocument } from '../src/lib/knowledge/parse.ts';
import { slugify } from '../src/lib/knowledge/slug.ts';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');
const force = process.argv.includes('--force');
const dryRun = process.argv.includes('--dry');
const allowPrune = process.argv.includes('--allow-prune');

/**
 * Umbrales del freno de borrado masivo.
 *
 * Borrar los documentos que ya no tienen fichero es correcto: el Markdown es la
 * fuente de verdad y la base de datos su proyección. Pero eso convierte a un
 * knowledge/ incompleto en una orden de borrado, y hay una forma muy fácil de
 * llegar a esa situación sin darse cuenta: desplegar una imagen cuyo corpus es
 * anterior al que ya está ingestado. Al arrancar, el contenedor vería sus
 * propios documentos como los únicos válidos y eliminaría el resto.
 *
 * Perder tres documentos porque los renombraste es un martes cualquiera. Perder
 * dieciséis nunca es lo que querías: significa que el corpus no se cargó, no
 * que lo borraras. El freno distingue ambos casos por proporción y por número
 * absoluto, y ante la duda para y lo cuenta en lugar de ejecutar.
 */
const PRUNE_MAX_RATIO = 0.3;
const PRUNE_MAX_ABSOLUTE = 2;

/** Ficheros con prefijo "_" son borradores: se ignoran. */
async function findMarkdown(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      found.push(...(await findMarkdown(path.join(dir, entry.name), relative)));
    } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
      found.push(relative);
    }
  }
  return found.sort();
}

async function upsertDocument(client: PoolClient, doc: ParsedDocument): Promise<number> {
  const { rows } = await client.query<{ id: string }>(
    `insert into documents
       (slug, source_path, kind, title, summary, body, metadata, visibility,
        starts_on, ends_on, content_hash)
     values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11)
     on conflict (slug) do update set
       source_path  = excluded.source_path,
       kind         = excluded.kind,
       title        = excluded.title,
       summary      = excluded.summary,
       body         = excluded.body,
       metadata     = excluded.metadata,
       visibility   = excluded.visibility,
       starts_on    = excluded.starts_on,
       ends_on      = excluded.ends_on,
       content_hash = excluded.content_hash,
       version      = documents.version + 1,
       updated_at   = now()
     returning id`,
    [
      doc.slug, doc.sourcePath, doc.kind, doc.title, doc.summary, doc.body,
      JSON.stringify(doc.metadata), doc.visibility, doc.startsOn, doc.endsOn, doc.contentHash,
    ],
  );
  return Number(rows[0]!.id);
}

async function syncTechnologies(
  client: PoolClient, documentId: number, technologies: readonly string[],
): Promise<void> {
  await client.query('delete from document_technologies where document_id = $1', [documentId]);
  for (const raw of technologies) {
    const slug = slugify(raw);
    if (!slug) continue;
    const { rows } = await client.query<{ id: string }>(
      `insert into technologies (slug, name) values ($1, $2)
       on conflict (slug) do update set name = technologies.name
       returning id`,
      [slug, raw],
    );
    await client.query(
      `insert into document_technologies (document_id, technology_id) values ($1, $2)
       on conflict do nothing`,
      [documentId, Number(rows[0]!.id)],
    );
  }
}

/**
 * Reescribe los fragmentos de un documento reutilizando los embeddings de las
 * secciones cuyo texto no ha cambiado. Editar un párrafo de un documento de
 * ocho secciones revectoriza una sección, no ocho.
 */
async function syncChunks(
  client: PoolClient, documentId: number, doc: ParsedDocument, modelId: string,
): Promise<{ written: number; embedded: number }> {
  const previous = new Map<string, unknown>();
  if (!force) {
    const { rows } = await client.query<{ content_hash: string; embedding: unknown }>(
      `select content_hash, embedding from chunks
       where document_id = $1 and embedding is not null and embedded_with = $2`,
      [documentId, modelId],
    );
    for (const row of rows) previous.set(row.content_hash, row.embedding);
  }

  const pending = doc.chunks.filter((chunk) => !previous.has(chunk.contentHash));
  const provider = getEmbeddingProvider();
  const fresh = pending.length
    ? await provider.embedPassages(pending.map((chunk) => chunk.embedInput))
    : [];

  const byHash = new Map<string, number[] | unknown>(previous);
  pending.forEach((chunk, index) => byHash.set(chunk.contentHash, fresh[index]!));

  await client.query('delete from chunks where document_id = $1', [documentId]);

  for (const chunk of doc.chunks) {
    const vector = byHash.get(chunk.contentHash);
    const literal = Array.isArray(vector)
      ? toVectorLiteral(vector as number[])
      : String(vector);
    await client.query(
      `insert into chunks
         (document_id, ordinal, heading_path, content, embed_input, char_count,
          content_hash, embedding, embedded_with, embedded_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8::vector,$9, now())`,
      [
        documentId, chunk.ordinal, chunk.headingPath, chunk.content, chunk.embedInput,
        chunk.content.length, chunk.contentHash, literal, modelId,
      ],
    );
  }

  return { written: doc.chunks.length, embedded: pending.length };
}

async function syncLinks(documents: ParsedDocument[]): Promise<number> {
  // Segunda pasada: los enlaces solo pueden resolverse cuando todos los
  // documentos existen, porque un documento puede apuntar a otro posterior.
  const ids = new Map(
    (await query<{ id: string; slug: string }>('select id, slug from documents'))
      .map((row) => [row.slug, Number(row.id)]),
  );

  return transaction(async (client) => {
    await client.query('delete from document_links');
    let created = 0;
    for (const doc of documents) {
      const sourceId = ids.get(doc.slug);
      if (sourceId === undefined) continue;
      for (const link of doc.links) {
        const targetId = ids.get(link.targetSlug);
        if (targetId === undefined) {
          console.warn(
            `  !  ${doc.slug}: el enlace "${link.targetSlug}" no corresponde a ningún documento.`,
          );
          continue;
        }
        if (targetId === sourceId) continue;
        await client.query(
          `insert into document_links (source_id, target_id, relation)
           values ($1,$2,$3) on conflict do nothing`,
          [sourceId, targetId, link.relation],
        );
        created += 1;
      }
    }
    return created;
  });
}

async function main(): Promise<void> {
  const provider = getEmbeddingProvider();
  const files = await findMarkdown(KNOWLEDGE_DIR);

  if (files.length === 0) {
    console.log(
      'No hay documentos en knowledge/. Los ficheros con prefijo "_" se ignoran ' +
        'por considerarse borradores.',
    );
    return;
  }

  console.log(`${files.length} documento(s) en knowledge/\n`);

  const parsed: ParsedDocument[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(KNOWLEDGE_DIR, file), 'utf8');
    parsed.push(parseDocument(file, raw));
  }

  const existing = new Map(
    (await query<{ slug: string; content_hash: string }>(
      'select slug, content_hash from documents',
    )).map((row) => [row.slug, row.content_hash]),
  );

  const changed = parsed.filter((doc) => force || existing.get(doc.slug) !== doc.contentHash);
  const orphans = [...existing.keys()].filter((slug) => !parsed.some((d) => d.slug === slug));

  if (dryRun) {
    console.log('Plan (--dry, no se escribe nada):');
    for (const doc of parsed) {
      const state = changed.includes(doc) ? (existing.has(doc.slug) ? 'MODIFICADO' : 'NUEVO') : 'sin cambios';
      console.log(`  ${state.padEnd(11)} ${doc.slug}  (${doc.chunks.length} fragmentos)`);
    }
    for (const slug of orphans) console.log(`  ELIMINADO   ${slug}`);
    return;
  }

  const runRows = await query<{ id: string }>(
    `insert into ingest_runs (embedding_model) values ($1) returning id`,
    [provider.id],
  );
  const runId = runRows[0]?.id;
  if (!runId) throw new Error('No se pudo registrar la ejecución de ingestión.');

  let chunksWritten = 0;
  let embeddingsMade = 0;

  try {
    for (const doc of parsed) {
      if (!changed.includes(doc)) {
        console.log(`  ·  ${doc.slug}`);
        continue;
      }
      const result = await transaction(async (client) => {
        const documentId = await upsertDocument(client, doc);
        await syncTechnologies(client, documentId, doc.technologies);
        return syncChunks(client, documentId, doc, provider.id);
      });
      chunksWritten += result.written;
      embeddingsMade += result.embedded;
      console.log(
        `  ✓  ${doc.slug}  ${result.written} fragmentos, ` +
          `${result.embedded} vectorizados${result.embedded < result.written ? ' (resto reutilizado)' : ''}`,
      );
    }

    if (orphans.length > 0) {
      const proporcion = existing.size > 0 ? orphans.length / existing.size : 0;
      const masivo =
        orphans.length > PRUNE_MAX_ABSOLUTE && proporcion > PRUNE_MAX_RATIO;

      if (masivo && !allowPrune) {
        console.error(
          `\n  Se han detectado ${orphans.length} documento(s) en la base de datos sin ` +
            `fichero correspondiente,\n  de un total de ${existing.size}: ` +
            `un ${Math.round(proporcion * 100)} % del corpus.\n\n` +
            `  No se ha borrado nada. Una eliminación de este tamaño casi nunca es\n` +
            `  intencionada: lo habitual es que knowledge/ esté incompleto, por ejemplo\n` +
            `  al arrancar un contenedor cuya imagen lleva un corpus anterior.\n\n` +
            `  Si de verdad quieres borrarlos, repite con --allow-prune.\n\n` +
            `  Documentos afectados:\n` +
            orphans.map((slug) => `    · ${slug}`).join('\n'),
        );
        throw new Error('Borrado masivo detenido por seguridad.');
      }

      for (const slug of orphans) {
        await query('delete from documents where slug = $1', [slug]);
        console.log(`  ✗  ${slug} (eliminado: ya no existe el fichero)`);
      }
    }

    const links = await syncLinks(parsed);

    await query(
      `update ingest_runs set finished_at = now(), status = 'ok',
         documents_seen = $2, documents_changed = $3, documents_deleted = $4,
         chunks_written = $5, embeddings_made = $6
       where id = $1`,
      [runId, parsed.length, changed.length, orphans.length, chunksWritten, embeddingsMade],
    );

    console.log(
      `\n${changed.length} documento(s) actualizado(s), ${chunksWritten} fragmento(s), ` +
        `${embeddingsMade} vector(es) nuevo(s), ${links} enlace(s).`,
    );
    if (changed.length === 0 && orphans.length === 0) console.log('Nada que hacer: todo al día.');
  } catch (error) {
    await query(
      `update ingest_runs set finished_at = now(), status = 'error', error = $2 where id = $1`,
      [runId, error instanceof Error ? error.message : String(error)],
    );
    throw error;
  }
}

withAdvisoryLock(LOCK_INGEST, main)
  .catch((error: unknown) => {
    console.error('\n' + (error instanceof Error ? error.stack ?? error.message : String(error)));
    process.exitCode = 1;
  })
  .finally(closePool);
