-- =============================================================================
-- Base de conocimiento
--
-- Principio de diseño: los ficheros Markdown de knowledge/ son la ÚNICA fuente
-- de verdad. Estas tablas son una proyección generada por el pipeline de
-- ingestión; se pueden borrar y reconstruir enteras sin pérdida de información.
-- De ahí que no haya columnas editables a mano ni panel de administración que
-- escriba aquí: si se edita la proyección, la siguiente ingestión lo revierte.
-- =============================================================================

-- Un documento = un fichero Markdown.
create table documents (
  id            bigint generated always as identity primary key,

  -- Identidad estable derivada de la ruta del fichero: "proyectos/mi-proyecto".
  slug          text        not null unique,
  source_path   text        not null unique,

  kind          text        not null
                check (kind in ('perfil','experiencia','proyecto','tecnologia','nota')),
  title         text        not null,
  summary       text,
  body          text        not null,   -- Markdown sin el frontmatter.

  -- Frontmatter completo. Deliberadamente sin esquema: permite añadir campos a
  -- los documentos sin migrar la base de datos. Los campos que necesitan índice
  -- o criterio de ordenación se promueven a columnas (ver starts_on/ends_on).
  metadata      jsonb       not null default '{}',

  visibility    text        not null default 'public'
                check (visibility in ('public','private')),
  lang          text        not null default 'es',

  -- Cronología: columnas propias porque la portada ordena por ellas.
  -- ends_on nulo = actualidad.
  starts_on     date,
  ends_on       date,

  -- Hash del fichero de origen. Permite que la ingestión sea idempotente:
  -- si no ha cambiado, no se reprocesa ni se regeneran sus embeddings.
  content_hash  text        not null,
  version       integer     not null default 1,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index documents_kind_idx       on documents (kind);
create index documents_visibility_idx on documents (visibility);
create index documents_starts_on_idx  on documents (starts_on desc nulls last);
create index documents_metadata_idx   on documents using gin (metadata jsonb_path_ops);

-- Taxonomía de tecnologías, derivada del frontmatter de los documentos.
create table technologies (
  id         bigint generated always as identity primary key,
  slug       text not null unique,
  name       text not null,
  category   text not null default 'otra'
             check (category in ('lenguaje','framework','base_de_datos','infraestructura','herramienta','otra')),
  created_at timestamptz not null default now()
);

create table document_technologies (
  document_id   bigint not null references documents(id)    on delete cascade,
  technology_id bigint not null references technologies(id) on delete cascade,
  primary key (document_id, technology_id)
);

create index document_technologies_tech_idx on document_technologies (technology_id);

-- Relaciones entre documentos (un proyecto pertenece a una experiencia, una
-- nota amplía un proyecto...). Un grafo ligero en vez de una jerarquía rígida:
-- la estructura real de una trayectoria profesional raramente es un árbol.
create table document_links (
  source_id bigint not null references documents(id) on delete cascade,
  target_id bigint not null references documents(id) on delete cascade,
  relation  text   not null
            check (relation in ('parte_de','usa','continua','relacionado')),
  primary key (source_id, target_id, relation),
  check (source_id <> target_id)
);

create index document_links_target_idx on document_links (target_id);

-- -----------------------------------------------------------------------------
-- Fragmentos indexables
--
-- Un chunk = una sección semántica del documento (delimitada por encabezados),
-- no una ventana de N tokens. Con documentos cortos y bien estructurados, cortar
-- por tamaño fijo parte ideas por la mitad y degrada el retrieval.
-- -----------------------------------------------------------------------------
create table chunks (
  id            bigint generated always as identity primary key,
  document_id   bigint  not null references documents(id) on delete cascade,
  ordinal       integer not null,

  -- Ruta de encabezados hasta esta sección: {'Proyecto X','Retos técnicos'}.
  heading_path  text[]  not null default '{}',

  -- content    : el texto tal cual, es lo que se cita al usuario.
  -- embed_input: el mismo texto precedido del título del documento y de la ruta
  --              de encabezados. Un fragmento aislado que dice "migramos a
  --              particionado por rango" no se parece a la pregunta "¿qué hizo
  --              en el proyecto X?"; con el contexto delante, sí. Es la mejora
  --              de calidad más barata que existe en un corpus pequeño.
  --              No incluye el prefijo que exige el modelo de embeddings
  --              ("passage: "), que se añade en tiempo de ejecución para no
  --              acoplar el almacenamiento a un modelo concreto.
  content       text    not null,
  embed_input   text    not null,

  char_count    integer not null,
  content_hash  text    not null,

  -- Nulo mientras el fragmento está pendiente de vectorizar.
  embedding     vector(384),
  -- Qué modelo produjo el vector. Sin esto, cambiar de modelo de embeddings
  -- deja vectores de dos espacios distintos mezclados en la misma tabla y las
  -- distancias dejan de significar nada, en silencio.
  embedded_with text,
  embedded_at   timestamptz,

  -- Índice full-text sobre embed_input (incluye título y encabezados) con el
  -- diccionario español: aporta stemming y descarta palabras vacías.
  tsv tsvector generated always as (to_tsvector('spanish', embed_input)) stored,

  created_at timestamptz not null default now(),

  unique (document_id, ordinal)
);

-- HNSW con distancia coseno: los embeddings se almacenan normalizados, así que
-- coseno y producto interno son equivalentes; coseno es el que menos sorpresas
-- da si algún día se cambia a un modelo que no normalice.
create index chunks_embedding_idx on chunks using hnsw (embedding vector_cosine_ops);
create index chunks_tsv_idx       on chunks using gin  (tsv);
create index chunks_document_idx  on chunks (document_id);
create index chunks_trgm_idx      on chunks using gin  (content gin_trgm_ops);

-- Trazabilidad de las ingestiones: cuántos documentos y fragmentos se han
-- procesado, con qué modelo y cuánto ha tardado.
create table ingest_runs (
  id                bigint generated always as identity primary key,
  started_at        timestamptz not null default now(),
  finished_at       timestamptz,
  status            text not null default 'running'
                    check (status in ('running','ok','error')),
  documents_seen    integer not null default 0,
  documents_changed integer not null default 0,
  documents_deleted integer not null default 0,
  chunks_written    integer not null default 0,
  embeddings_made   integer not null default 0,
  embedding_model   text,
  error             text
);
