/**
 * Lecturas que alimentan las páginas del sitio.
 *
 * Consultan la misma proyección que genera la ingestión, de modo que web y
 * asistente responden siempre con la misma versión del contenido: editar un
 * Markdown y reingestar actualiza las dos cosas a la vez, sin que puedan
 * divergir.
 *
 * Todo filtra por visibility = 'public'. Se hace en cada consulta y no en una
 * capa superior a propósito: un documento marcado como privado no debe poder
 * aparecer porque alguien olvidara aplicar el filtro en una página nueva.
 */
import { query } from '../db/index.ts';

export interface Technology {
  slug: string;
  name: string;
  category: string;
}

export interface SiteDocument {
  id: number;
  slug: string;
  kind: 'perfil' | 'experiencia' | 'proyecto' | 'tecnologia' | 'nota';
  title: string;
  summary: string | null;
  body: string;
  metadata: Record<string, unknown>;
  startsOn: string | null;
  endsOn: string | null;
  technologies: Technology[];
}

interface DocumentRow {
  id: string;
  slug: string;
  kind: SiteDocument['kind'];
  title: string;
  summary: string | null;
  body: string;
  metadata: Record<string, unknown>;
  starts_on: string | null;
  ends_on: string | null;
  technologies: Technology[] | null;
}

/**
 * Las tecnologías se agregan en SQL en lugar de con una consulta por documento.
 * Con veinte documentos la diferencia es imperceptible, pero es la clase de
 * detalle que convierte una lista en veintiuna consultas en cuanto el contenido
 * crece, y aquí no cuesta nada evitarlo.
 */
const DOCUMENT_FIELDS = `
  d.id, d.slug, d.kind, d.title, d.summary, d.body, d.metadata,
  d.starts_on, d.ends_on,
  coalesce(
    (select json_agg(json_build_object('slug', t.slug, 'name', t.name, 'category', t.category)
                     order by t.name)
       from document_technologies dt
       join technologies t on t.id = dt.technology_id
      where dt.document_id = d.id),
    '[]'::json
  ) as technologies
`;

function toDocument(row: DocumentRow): SiteDocument {
  return {
    id: Number(row.id),
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    body: row.body,
    metadata: row.metadata ?? {},
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    technologies: row.technologies ?? [],
  };
}

export async function getByKind(kind: SiteDocument['kind']): Promise<SiteDocument[]> {
  const rows = await query<DocumentRow>(
    `select ${DOCUMENT_FIELDS}
       from documents d
      where d.visibility = 'public' and d.kind = $1
      order by d.starts_on desc nulls last, d.title`,
    [kind],
  );
  return rows.map(toDocument);
}

export async function getBySlug(slug: string): Promise<SiteDocument | null> {
  const rows = await query<DocumentRow>(
    `select ${DOCUMENT_FIELDS}
       from documents d
      where d.visibility = 'public' and d.slug = $1`,
    [slug],
  );
  const row = rows[0];
  return row ? toDocument(row) : null;
}

/** Slugs publicados de un tipo, para generar las rutas estáticas. */
export async function getSlugs(kind: SiteDocument['kind']): Promise<string[]> {
  const rows = await query<{ slug: string }>(
    `select slug from documents where visibility = 'public' and kind = $1`,
    [kind],
  );
  return rows.map((row) => row.slug);
}

export interface TechnologyUsage extends Technology {
  documentCount: number;
}

/**
 * Tecnologías ordenadas por cuántos documentos las mencionan. El orden importa:
 * una lista alfabética trata igual a la herramienta sobre la que hay cinco
 * proyectos escritos y a la que se nombró una vez de pasada.
 */
export async function getTechnologies(): Promise<TechnologyUsage[]> {
  const rows = await query<{ slug: string; name: string; category: string; n: string }>(
    `select t.slug, t.name, t.category, count(*)::text as n
       from technologies t
       join document_technologies dt on dt.technology_id = t.id
       join documents d on d.id = dt.document_id and d.visibility = 'public'
      group by t.slug, t.name, t.category
      order by count(*) desc, t.name`,
  );
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    category: row.category,
    documentCount: Number(row.n),
  }));
}

export interface SiteStats {
  proyectos: number;
  experiencias: number;
  tecnologias: number;
  notas: number;
  /** Fragmentos indexados: lo que el asistente puede realmente citar. */
  fragmentos: number;
  primerAno: number | null;
}

export async function getStats(): Promise<SiteStats> {
  const rows = await query<{
    proyectos: string; experiencias: string; tecnologias: string;
    notas: string; fragmentos: string; primer_ano: string | null;
  }>(
    `select
       (select count(*) from documents where visibility='public' and kind='proyecto')::text     as proyectos,
       (select count(*) from documents where visibility='public' and kind='experiencia')::text  as experiencias,
       (select count(distinct dt.technology_id)
          from document_technologies dt
          join documents d on d.id = dt.document_id and d.visibility='public')::text            as tecnologias,
       (select count(*) from documents where visibility='public' and kind='nota')::text         as notas,
       (select count(*) from chunks c
          join documents d on d.id = c.document_id and d.visibility='public'
         where c.embedding is not null)::text                                                   as fragmentos,
       (select extract(year from min(starts_on))::int
          from documents where visibility='public' and starts_on is not null)::text             as primer_ano`,
  );
  const row = rows[0];
  return {
    proyectos: Number(row?.proyectos ?? 0),
    experiencias: Number(row?.experiencias ?? 0),
    tecnologias: Number(row?.tecnologias ?? 0),
    notas: Number(row?.notas ?? 0),
    fragmentos: Number(row?.fragmentos ?? 0),
    primerAno: row?.primer_ano ? Number(row.primer_ano) : null,
  };
}

/** Formatea el periodo de un documento: «abr 2023 — nov 2024», «desde 2023». */
export function formatPeriod(startsOn: string | null, endsOn: string | null): string | null {
  if (!startsOn) return null;
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(iso))
      .replace('.', '');
  return endsOn ? `${fmt(startsOn)} — ${fmt(endsOn)}` : `desde ${fmt(startsOn)}`;
}
