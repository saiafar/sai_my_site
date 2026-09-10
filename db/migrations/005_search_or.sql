-- =============================================================================
-- Corrección de la mitad léxica de la búsqueda híbrida.
--
-- La versión anterior usaba websearch_to_tsquery, que une los términos con AND.
-- Para una pregunta en lenguaje natural eso es demasiado estricto: «¿ha
-- trabajado con hardware o electrónica?» se convierte en
-- 'trabaj & hardware & electron', y exige que un mismo fragmento contenga las
-- tres palabras. Ninguno lo hace, así que la rama léxica devolvía cero filas.
--
-- El fallo era invisible: la búsqueda seguía funcionando porque la rama
-- vectorial sí devolvía resultados, y el sistema se comportaba como vectorial
-- puro mientras aparentaba ser híbrido. Solo se detectó al medir el conjunto de
-- preguntas doradas y ver que la columna de posición léxica estaba vacía en
-- todos los resultados salvo en las consultas de una sola palabra.
--
-- La corrección es unir los lexemas con OR. No degrada la precisión porque
-- ts_rank_cd sigue puntuando por cuántos términos coinciden y con qué densidad:
-- un fragmento que contiene «hardware» queda por encima de otro que solo
-- contiene «trabajado». Y la fusión posterior es por posición en el ranking,
-- no por puntuación, así que lo único que importa es el orden.
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
  with consulta as (
    -- Los lexemas de la pregunta, ya normalizados por el diccionario español
    -- (sin palabras vacías y con la raíz extraída), unidos con OR.
    select (
      select string_agg(quote_literal(lexeme), ' | ')
        from unnest(to_tsvector('spanish', query_text))
    )::tsquery as q
  ),
  visible as (
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
    select v.id,
           row_number() over (order by ts_rank_cd(v.tsv, c.q) desc) as rank
    from visible v, consulta c
    where c.q is not null and v.tsv @@ c.q
    order by ts_rank_cd(v.tsv, c.q) desc
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
