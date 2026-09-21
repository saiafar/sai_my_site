-- =============================================================================
-- Soporte para internacionalización (i18n: es / en)
--
--  1. Los documentos ahora tienen unicidad por (slug, lang) en lugar de solo slug,
--     permitiendo que una ficha en inglés comparta el mismo identificador de ruta
--     asociado a su idioma correspondiente.
--  2. Chunks incluye la columna lang para asociarse directamente al idioma.
--  3. La columna generada tsv utiliza el diccionario correspondiente (spanish o english)
--     según el valor de lang.
--  4. search_chunks recibe query_lang para segmentar y ponderar léxicamente en
--     el idioma de la consulta.
-- =============================================================================

-- 1. Unicidad de documentos por (slug, lang)
alter table documents drop constraint if exists documents_slug_key;
alter table documents drop constraint if exists documents_slug_lang_key;
alter table documents add constraint documents_slug_lang_key unique (slug, lang);

-- 2. Idioma en fragmentos (chunks)
alter table chunks add column if not exists lang text not null default 'es';
create index if not exists chunks_lang_idx on chunks (lang);

-- 3. Índice full-text adaptativo según el idioma del fragmento
drop index if exists chunks_tsv_idx;
alter table chunks drop column if exists tsv;
alter table chunks add column tsv tsvector generated always as (
  to_tsvector(case when lang = 'en' then 'english'::regconfig else 'spanish'::regconfig end, embed_input)
) stored;
create index chunks_tsv_idx on chunks using gin (tsv);

-- 4. Búsqueda híbrida multilingüe con filtrado estricto por idioma
drop function if exists search_chunks(vector, text, integer, integer, integer, text[], double precision);
drop function if exists search_chunks(vector, text, integer, integer, integer, text[], double precision, text);

create function search_chunks(
  query_embedding vector(384),
  query_text      text,
  match_count     integer default 8,
  candidate_count integer default 40,
  rrf_k           integer default 60,
  filter_kinds    text[]  default null,
  df_max_ratio    double precision default 0.20,
  query_lang      text    default 'es'
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
  with reg_cfg as (
    select (case when query_lang = 'en' then 'english'::regconfig else 'spanish'::regconfig end) as cfg
  ),
  indexados as (
    select count(*)::numeric as n
      from chunks
     where embedding is not null
       and lang = query_lang
  ),
  consulta as (
    -- Lexemas de la pregunta normalizados por el diccionario correspondiente al idioma
    select string_agg(quote_literal(l.lexeme), ' | ')::tsquery as q
    from reg_cfg, unnest(to_tsvector(reg_cfg.cfg, query_text)) l
    where (
      select count(*) from chunks c
       where c.embedding is not null
         and c.lang = query_lang
         and c.tsv @@ quote_literal(l.lexeme)::tsquery
    )::numeric <= df_max_ratio * (select greatest(n, 1) from indexados)
  ),
  visible as (
    select c.id, c.document_id, c.heading_path, c.content, c.embedding, c.tsv,
           d.slug, d.title, d.kind
    from chunks c
    join documents d on d.id = c.document_id
    where d.visibility = 'public'
      and d.lang = query_lang
      and c.lang = query_lang
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
  'Búsqueda híbrida multilingüe (vectorial + full-text filtrado por rareza) fusionada con Reciprocal Rank Fusion.';
