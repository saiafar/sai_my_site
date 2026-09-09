/**
 * Recuperación: pregunta en lenguaje natural -> fragmentos relevantes.
 *
 * Toda la lógica de fusión vive en SQL (función search_chunks), no aquí. No es
 * una preferencia estética: hacerlo en la base de datos evita traer 40+40
 * candidatos por la red para descartar casi todos en el proceso de Node, y
 * mantiene la operación dentro de una única consulta planificable.
 */
import { getEmbeddingProvider } from '../embeddings/local.ts';
import { query, toVectorLiteral } from '../db/index.ts';
import type { DocumentKind } from '../knowledge/parse.ts';

export interface RetrievedChunk {
  chunkId: number;
  documentId: number;
  slug: string;
  title: string;
  kind: DocumentKind;
  headingPath: string[];
  content: string;
  /** Posición en el ranking vectorial; null si solo lo encontró el full-text. */
  vectorRank: number | null;
  /** Posición en el ranking full-text; null si solo lo encontró el vectorial. */
  textRank: number | null;
  score: number;
}

export interface RetrieveOptions {
  /** Fragmentos devueltos. Por encima de ~8 el contexto se diluye y el coste sube. */
  matchCount?: number;
  /** Candidatos que aporta cada ranking antes de fusionar. */
  candidateCount?: number;
  kinds?: DocumentKind[];
}

interface Row {
  chunk_id: string;
  document_id: string;
  slug: string;
  title: string;
  kind: DocumentKind;
  heading_path: string[];
  content: string;
  vector_rank: number | null;
  text_rank: number | null;
  score: number;
}

export async function retrieve(
  question: string,
  options: RetrieveOptions = {},
): Promise<RetrievedChunk[]> {
  const { matchCount = 8, candidateCount = 40, kinds } = options;

  const provider = getEmbeddingProvider();
  const embedding = await provider.embedQuery(question);

  const rows = await query<Row>(
    `select * from search_chunks($1::vector, $2, $3, $4, 60, $5)`,
    [toVectorLiteral(embedding), question, matchCount, candidateCount, kinds ?? null],
  );

  return rows.map((row) => ({
    chunkId: Number(row.chunk_id),
    documentId: Number(row.document_id),
    slug: row.slug,
    title: row.title,
    kind: row.kind,
    headingPath: row.heading_path,
    content: row.content,
    vectorRank: row.vector_rank,
    textRank: row.text_rank,
    score: Number(row.score),
  }));
}

/** Referencia legible de un fragmento: "Proyecto X › Retos técnicos". */
export function citationOf(chunk: RetrievedChunk): string {
  return [chunk.title, ...chunk.headingPath].join(' › ');
}
