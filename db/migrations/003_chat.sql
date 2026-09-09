-- =============================================================================
-- Conversaciones, telemetría y control de abuso
--
-- Un chat público conectado a una API de pago es, de partida, un vector de
-- abuso: cualquiera puede automatizar peticiones y consumir el presupuesto.
-- Estas tablas son las que permiten exponerlo a Internet sin sobresaltos, y de
-- paso las que dan material para medir y mejorar el asistente.
-- =============================================================================

create table conversations (
  id         uuid primary key default gen_random_uuid(),
  -- Nunca se guarda la IP en claro: solo un hash con sal para poder agrupar
  -- peticiones del mismo origen sin almacenar un dato personal identificable.
  client_key text not null,
  user_agent text,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index conversations_client_idx  on conversations (client_key, created_at desc);
create index conversations_created_idx on conversations (created_at desc);

create table messages (
  id              bigint generated always as identity primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  turn            integer not null,
  role            text not null check (role in ('user','assistant')),
  content         text not null,

  -- Qué se recuperó para responder: ids de fragmento y puntuaciones.
  -- Es lo que permite, ante una respuesta mala, distinguir si falló el
  -- retrieval (no encontró el fragmento correcto) o falló el modelo (lo tenía
  -- delante y aun así respondió mal). Sin esta columna, cada fallo es una
  -- conjetura.
  retrieval       jsonb,

  model           text,
  input_tokens    integer,
  output_tokens   integer,
  cost_usd        numeric(12,6),
  latency_ms      integer,
  -- Motivo por el que se rechazó o degradó la respuesta, si procede.
  refusal_reason  text,

  created_at timestamptz not null default now(),
  unique (conversation_id, turn, role)
);

create index messages_conversation_idx on messages (conversation_id, turn);
create index messages_created_idx      on messages (created_at desc);

-- Ventana fija de límite de peticiones. Vive en la base de datos y no en
-- memoria del proceso a propósito: sobrevive a los reinicios y a los despliegues
-- de Dokploy, que en un contenedor son frecuentes.
create table rate_limit_buckets (
  bucket_key   text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (bucket_key, window_start)
);

create index rate_limit_window_idx on rate_limit_buckets (window_start);

-- Caché de respuestas. Las preguntas a un CV se repiten muchísimo
-- ("¿qué experiencia tiene?"), así que cachear por pregunta normalizada evita
-- pagar dos veces por la misma respuesta y además la devuelve al instante.
create table response_cache (
  question_hash text primary key,
  question      text not null,
  answer        text not null,
  retrieval     jsonb,
  model         text,
  hits          integer not null default 0,
  created_at    timestamptz not null default now(),
  last_hit_at   timestamptz not null default now()
);

create index response_cache_last_hit_idx on response_cache (last_hit_at desc);

-- Gasto agregado por mes: el tope de presupuesto se consulta contra esta vista
-- antes de cada llamada al modelo.
create view monthly_usage as
select date_trunc('month', created_at)::date as month,
       count(*) filter (where role = 'assistant') as answers,
       coalesce(sum(input_tokens), 0)            as input_tokens,
       coalesce(sum(output_tokens), 0)           as output_tokens,
       coalesce(sum(cost_usd), 0)                as cost_usd
from messages
group by 1;
