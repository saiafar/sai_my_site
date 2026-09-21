/**
 * Parser de la base de conocimiento: fichero Markdown -> documento + fragmentos.
 *
 * La decisión central es el criterio de troceado. Lo habitual en un RAG es
 * partir por ventanas de N tokens con solapamiento, porque es lo que funciona
 * con corpus grandes y heterogéneos. Aquí sería un error: los documentos son
 * cortos y están escritos con una estructura deliberada, y una ventana fija
 * corta ideas por la mitad y mezcla el final de una sección con el principio de
 * la siguiente.
 *
 * En su lugar se corta por secciones semánticas (encabezados), y solo se
 * subdivide una sección cuando excede el tamaño máximo, en cuyo caso se corta
 * por párrafos y nunca a mitad de uno.
 */
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Heading, Root, RootContent } from 'mdast';
import { toString as mdastToString } from 'mdast-util-to-string';

/** Por encima de esto, una sección se subdivide por párrafos. */
const MAX_CHUNK_CHARS = 1_800;
/** Por debajo de esto, un fragmento se fusiona con el siguiente en vez de indexarse solo. */
const MIN_CHUNK_CHARS = 120;
/** Profundidad de encabezado que abre una nueva sección. H1 se reserva para el título. */
const SECTION_DEPTHS = new Set([2, 3]);

export type DocumentKind = 'perfil' | 'experiencia' | 'proyecto' | 'tecnologia' | 'nota';

export interface ParsedChunk {
  ordinal: number;
  headingPath: string[];
  /** Texto tal cual, es lo que se cita al usuario. */
  content: string;
  embedInput: string;
  contentHash: string;
  lang: 'es' | 'en';
}

export interface ParsedDocument {
  slug: string;
  sourcePath: string;
  lang: 'es' | 'en';
  kind: DocumentKind;
  title: string;
  summary: string | null;
  body: string;
  metadata: Record<string, unknown>;
  visibility: 'public' | 'private';
  startsOn: string | null;
  endsOn: string | null;
  technologies: string[];
  links: { targetSlug: string; relation: 'parte_de' | 'usa' | 'continua' | 'relacionado' }[];
  contentHash: string;
  chunks: ParsedChunk[];
}

const KIND_BY_FOLDER: Record<string, DocumentKind> = {
  perfil: 'perfil',
  profile: 'perfil',
  experiencia: 'experiencia',
  experience: 'experiencia',
  proyectos: 'proyecto',
  projects: 'proyecto',
  tecnologias: 'tecnologia',
  technologies: 'tecnologia',
  notas: 'nota',
  notes: 'nota',
};

const FOLDER_BY_KIND: Record<DocumentKind, string> = {
  perfil: 'perfil',
  experiencia: 'experiencia',
  proyecto: 'proyectos',
  tecnologia: 'tecnologias',
  nota: 'notas',
};

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Acepta AAAA, AAAA-MM y AAAA-MM-DD, y los normaliza a fecha completa. */
function toDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') return `${value}-01-01`;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

/**
 * Divide el cuerpo en secciones y devuelve los fragmentos.
 * Se trabaja con los desplazamientos del AST y se rebana el Markdown original,
 * en lugar de reserializar el árbol: así el texto citado al usuario es
 * exactamente el que él escribió, con su formato intacto.
 */
function chunkBody(body: string, title: string, lang: 'es' | 'en'): ParsedChunk[] {
  const tree = unified().use(remarkParse).parse(body) as Root;
  const nodes = tree.children;

  interface Section { headingPath: string[]; start: number; end: number }
  const sections: Section[] = [];
  const stack: { depth: number; text: string }[] = [];
  let current: Section | null = { headingPath: [], start: 0, end: body.length };

  const closeAt = (offset: number) => {
    if (current) {
      current.end = offset;
      if (body.slice(current.start, current.end).trim()) sections.push(current);
    }
  };

  for (const node of nodes as RootContent[]) {
    if (node.type !== 'heading' || !SECTION_DEPTHS.has((node as Heading).depth)) continue;
    const heading = node as Heading;
    const start = heading.position?.start.offset;
    const end = heading.position?.end.offset;
    if (start === undefined || end === undefined) continue;

    closeAt(start);

    while (stack.length && stack[stack.length - 1]!.depth >= heading.depth) stack.pop();
    stack.push({ depth: heading.depth, text: mdastToString(heading).trim() });

    current = {
      headingPath: stack.map((s) => s.text),
      start: end,
      end: body.length,
    };
  }
  closeAt(body.length);

  // Subdivide lo que exceda el máximo, siempre por párrafos completos.
  const pieces: { headingPath: string[]; content: string }[] = [];
  for (const section of sections) {
    const text = body.slice(section.start, section.end).trim();
    if (text.length <= MAX_CHUNK_CHARS) {
      pieces.push({ headingPath: section.headingPath, content: text });
      continue;
    }
    let buffer = '';
    for (const paragraph of text.split(/\n{2,}/)) {
      if (buffer && buffer.length + paragraph.length + 2 > MAX_CHUNK_CHARS) {
        pieces.push({ headingPath: section.headingPath, content: buffer.trim() });
        buffer = '';
      }
      buffer += (buffer ? '\n\n' : '') + paragraph;
    }
    if (buffer.trim()) pieces.push({ headingPath: section.headingPath, content: buffer.trim() });
  }

  // Fusiona los restos demasiado cortos para sostenerse solos (una sección que
  // es únicamente un encabezado y una frase, por ejemplo). Indexados aparte
  // solo generan ruido en los resultados.
  const merged: { headingPath: string[]; content: string }[] = [];
  for (const piece of pieces) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      piece.content.length < MIN_CHUNK_CHARS &&
      previous.content.length + piece.content.length <= MAX_CHUNK_CHARS
    ) {
      previous.content += `\n\n${piece.content}`;
      continue;
    }
    merged.push({ ...piece });
  }

  return merged.map((piece, index) => {
    const breadcrumb = [title, ...piece.headingPath].join(' > ');
    const embedInput = `${breadcrumb}\n\n${piece.content}`;
    return {
      ordinal: index,
      headingPath: piece.headingPath,
      content: piece.content,
      embedInput,
      contentHash: sha256(embedInput),
      lang,
    };
  });
}

export function parseDocument(sourcePath: string, raw: string): ParsedDocument {
  let data: Record<string, unknown>;
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data as Record<string, unknown>;
    content = parsed.content;
  } catch (error) {
    // El error que lanza el analizador de YAML no menciona el fichero, solo una
    // línea y una columna, y con veinte documentos eso obliga a buscar a ciegas
    // cuál de ellos ha fallado. La causa casi siempre es la misma: dos puntos
    // seguidos de espacio dentro de un valor sin comillas.
    const detalle = error instanceof Error ? error.message.split('\n')[0] : String(error);
    throw new Error(
      `Frontmatter no válido en "${sourcePath}": ${detalle}\n` +
        `  Causa habitual: un valor que contiene ": " sin comillas. ` +
        `Escribe  summary: \"Texto: con dos puntos\"  entre comillas.`,
    );
  }

  const meta = data;

  const segments = sourcePath.replace(/\.md$/, '').split('/');
  let lang: 'es' | 'en' = 'es';
  let pathSegments = segments;

  if (segments[0] === 'es' || segments[0] === 'en') {
    lang = segments[0];
    pathSegments = segments.slice(1);
  } else if (meta['lang'] === 'en') {
    lang = 'en';
  }

  const folder = pathSegments[0] ?? '';
  const kind = KIND_BY_FOLDER[folder];
  if (!kind) {
    throw new Error(
      `"${sourcePath}" está en una carpeta no reconocida ("${folder}"). ` +
        `Carpetas válidas: ${Object.keys(KIND_BY_FOLDER).join(', ')}.`,
    );
  }

  const title = typeof meta['title'] === 'string' ? meta['title'].trim() : '';
  if (!title) throw new Error(`"${sourcePath}" no tiene "title" en el frontmatter.`);

  const body = content.trim();
  if (!body) throw new Error(`"${sourcePath}" no tiene contenido.`);

  const visibility = meta['visibilidad'] === 'private' ? 'private' : 'public';

  const links: ParsedDocument['links'] = [];
  for (const target of toStringArray(meta['parte_de'])) {
    links.push({ targetSlug: target, relation: 'parte_de' });
  }
  for (const target of toStringArray(meta['relacionado'])) {
    links.push({ targetSlug: target, relation: 'relacionado' });
  }
  for (const target of toStringArray(meta['continua'])) {
    links.push({ targetSlug: target, relation: 'continua' });
  }

  const canonicalFolder = FOLDER_BY_KIND[kind];
  const canonicalSlug = [canonicalFolder, ...pathSegments.slice(1)].join('/');
  const finalSlug = typeof meta['slug'] === 'string' ? (meta['slug'] as string).trim() : canonicalSlug;

  return {
    slug: finalSlug,
    sourcePath,
    lang,
    kind,
    title,
    summary: typeof meta['summary'] === 'string' ? meta['summary'].trim() : null,
    body,
    metadata: meta,
    visibility,
    startsOn: toDate(meta['inicio'] ?? meta['start']),
    endsOn: toDate(meta['fin'] ?? meta['end']),
    technologies: toStringArray(meta['tecnologias'] ?? meta['technologies']),
    links,
    contentHash: sha256(raw),
    chunks: chunkBody(body, title, lang),
  };
}
