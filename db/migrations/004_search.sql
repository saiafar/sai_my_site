-- =============================================================================
-- Búsqueda híbrida
--
-- Por qué híbrida y no solo vectorial: la búsqueda semántica es excelente para
-- preguntas parafraseadas ("¿a qué retos se enfrentó?") y mala para nombres
-- propios. "PostgreSQL", "pgvector" y "Postgres" ocupan posiciones muy próximas
-- en el espacio de embeddings, de modo que una pregunta por una tecnología
-- concreta recupera fragmentos sobre tecnologías vecinas. El full-text acierta
-- justo ahí, y falla justo donde el vectorial acierta. Se combinan con
-- Reciprocal Rank Fusion, que fusiona por POSICIÓN en cada ranking en lugar de
-- por puntuación: no hace falta normalizar dos escalas incomparables (distancia
-- coseno y ts_rank), que es donde suelen romperse estas combinaciones.
-- =============================================================================

create or replace function search_chunks(
  query_embedding vector(384),
  query_text      text,
  match_count     integer default 8,
  candidate_count integer default 40,
  rrf_k           integer default 60,
  filter_kinds    text[]  default null
)
returns table (
  chunk_id     bigint,
  document_id  bigint,
  slug         text,
  title        text,
  kind         text,
  heading_path text[],
  content      text,
  vector_rank  integer,
  text_rank    integer,
  score        double precision
)
language sql
stable
as $$
  with visible as (
    select c.id, c.document_id, c.heading_path, c.content, c.embedding, c.tsv,
           d.slug, d.title, d.kind
    from chunks c
    join documents d on d.id = c.document_id
    where d.visibility = 'public'
      and c.embedding is not null
      and (filter_kinds is null or d.kind = any(filter_kinds))
  ),
  semantic as (
    select id, row_number() over (order by embedding <=> query_embedding) as rank
    from visible
    order by embedding <=> query_embedding
    limit candidate_count
  ),
  lexical as (
    select id,
           row_number() over (
             order by ts_rank_cd(tsv, websearch_to_tsquery('spanish', query_text)) desc
           ) as rank
    from visible
    where tsv @@ websearch_to_tsquery('spanish', query_text)
    order by ts_rank_cd(tsv, websearch_to_tsquery('spanish', query_text)) desc
    limit candidate_count
  ),
  fused as (
    select coalesce(s.id, l.id) as id,
           s.rank as vector_rank,
           l.rank as text_rank,
           coalesce(1.0 / (rrf_k + s.rank), 0.0)
         + coalesce(1.0 / (rrf_k + l.rank), 0.0) as score
    from semantic s
    full outer join lexical l on l.id = s.id
  )
  select v.id, v.document_id, v.slug, v.title, v.kind, v.heading_path, v.content,
         f.vector_rank::integer, f.text_rank::integer, f.score
  from fused f
  join visible v on v.id = f.id
  order by f.score desc
  limit match_count;
$$;

comment on function search_chunks is
  'Búsqueda híbrida (vectorial + full-text español) fusionada con Reciprocal Rank Fusion.';
