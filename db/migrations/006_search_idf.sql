-- =============================================================================
-- Filtrado de la consulta léxica por rareza del término.
--
-- La migración anterior sustituyó AND por OR en la rama léxica y empeoró el
-- resultado: recall@5 bajó de 0,962 a 0,923. Con OR puro, palabras corrientes
-- del corpus —«trabajado», «empresa», «proyecto»— coinciden con un tercio de
-- los fragmentos y arrastran hacia arriba resultados genéricos. La rama léxica
-- pasó de no aportar nada a aportar ruido, que es peor.
--
-- Falta lo que hace BM25 y ts_rank_cd no: ponderar por rareza. Un término que
-- aparece en el 30 % de los fragmentos no distingue nada; uno que aparece en el
-- 4 % identifica el documento casi por sí solo. Medido sobre este corpus:
--
--     trabaj        31 %      hardwar        4 %
--     propi         33 %      electron       8 %
--     empres        25 %      multi-tenant   2 %
--
-- La corrección es descartar de la consulta los lexemas que superen un umbral
-- de frecuencia documental. Si todos lo superan, la consulta queda vacía y la
-- rama léxica no devuelve nada: la búsqueda degrada a vectorial pura, que es
-- exactamente el comportamiento correcto cuando la pregunta no contiene ningún
-- término discriminante.
--
-- El umbral es proporcional al tamaño del corpus, no un número absoluto, para
-- que siga teniendo sentido cuando el corpus crezca.
--
-- Hay que borrar la función antes de recrearla: añadir un parámetro cambia la
-- firma, y CREATE OR REPLACE crearía una sobrecarga en lugar de sustituirla,
-- dejando dos versiones y una llamada ambigua.
-- =============================================================================

drop function if exists search_chunks(vector, text, integer, integer, integer, text[]);

create function search_chunks(
  query_embedding vector(384),
  query_text      text,
  match_count     integer default 8,
  candidate_count integer default 40,
  rrf_k           integer default 60,
  filter_kinds    text[]  default null,
  -- Proporción máxima de fragmentos en los que puede aparecer un término para
  -- que se considere discriminante.
  df_max_ratio    double precision default 0.20
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
  with indexados as (
    select count(*)::numeric as n from chunks where embedding is not null
  ),
  consulta as (
    -- Lexemas de la pregunta, ya normalizados por el diccionario español, que
    -- son lo bastante infrecuentes como para discriminar. Se comparan con
    -- ::tsquery y no con to_tsquery('spanish', ...) porque el lexema ya viene
    -- derivado: volver a pasarlo por el diccionario lo derivaría dos veces y
    -- dejaría de coincidir consigo mismo.
    select string_agg(quote_literal(l.lexeme), ' | ')::tsquery as q
    from unnest(to_tsvector('spanish', query_text)) l
    where (
      select count(*) from chunks c
       where c.embedding is not null
         and c.tsv @@ quote_literal(l.lexeme)::tsquery
    )::numeric <= df_max_ratio * (select greatest(n, 1) from indexados)
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

comment on function search_chunks is
  'Búsqueda híbrida (vectorial + full-text español filtrado por rareza) fusionada con Reciprocal Rank Fusion.';
