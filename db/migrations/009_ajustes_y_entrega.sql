-- =============================================================================
-- Ajustes editables y estado de entrega de los mensajes.
--
-- Hasta ahora toda la configuración vivía en variables de entorno, que es el
-- sitio correcto para lo que no cambia sin un despliegue: credenciales, modelo,
-- topes de gasto. La URL del webhook de N8N es de otra clase — se cambia al
-- reorganizar un flujo, y obligar a un redespliegue del sitio para eso es
-- desproporcionado—, así que vive en la base de datos y se edita desde el panel.
-- =============================================================================

create table site_settings (
  key        text primary key,
  -- jsonb y no text para que un ajuste futuro pueda ser una lista o un objeto
  -- sin necesitar otra migración.
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Reenvío de los mensajes de contacto a N8N.
--
-- El orden importa y es deliberado: el mensaje se guarda primero y se reenvía
-- después. Si el webhook está caído, N8N en mantenimiento o la URL mal escrita,
-- el mensaje no se pierde: queda aquí marcado como no entregado y el panel
-- ofrece reintentarlo. Un formulario de contacto que depende de que un servicio
-- externo esté vivo es un formulario que pierde clientes sin enterarse.
-- -----------------------------------------------------------------------------
alter table contact_messages
  add column delivered_at   timestamptz,
  add column delivery_error text,
  add column delivery_tries integer not null default 0;

-- Los pendientes de entrega son pocos y se consultan en cada carga del panel.
create index contact_messages_pendientes_idx
  on contact_messages (created_at desc)
  where delivered_at is null;
