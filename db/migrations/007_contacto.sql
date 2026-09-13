-- =============================================================================
-- Mensajes de contacto.
--
-- El sitio no publica ninguna dirección de correo: los mensajes se guardan
-- aquí. Eso elimina la superficie de spam del buzón, a cambio de que haya que
-- proteger el propio formulario, que es lo que hacen el límite por visitante y
-- el campo trampa del endpoint.
--
-- Se guarda el mínimo necesario para poder responder —nombre, correo y
-- mensaje— más lo que permite frenar un abuso. La dirección IP no se almacena
-- en claro, igual que en el asistente: solo su hash con sal.
-- =============================================================================

create table contact_messages (
  id          bigint generated always as identity primary key,

  name        text not null,
  email       text not null,
  message     text not null,

  -- Mismo identificador de visitante que usa el asistente, para poder
  -- relacionar un mensaje con la conversación que lo precedió.
  client_key  text,
  user_agent  text,

  -- Para gestionar la bandeja sin salir de la base de datos.
  status      text not null default 'nuevo'
              check (status in ('nuevo', 'leido', 'respondido', 'descartado')),

  created_at  timestamptz not null default now(),
  handled_at  timestamptz
);

create index contact_messages_status_idx  on contact_messages (status, created_at desc);
create index contact_messages_created_idx on contact_messages (created_at desc);
