-- =============================================================================
-- Telemetría de navegación.
--
-- El sitio no llevaba ninguna: los mensajes de contacto y las preguntas al
-- asistente ya se guardaban, pero de las visitas no quedaba rastro. Esta tabla
-- es la que alimenta el panel de administración.
--
-- Se recoge en casa y no solo con Google Analytics por dos motivos. Uno, que un
-- bloqueador de anuncios se come una parte grande de los eventos de GA, y aquí
-- interesa el número real. Y dos, que "¿ha entrado alguien a este proyecto?" se
-- responde agregando por el mismo slug que usan el corpus y el asistente, sin
-- tener que replicar el mapa de rutas en la configuración de otra herramienta.
--
-- No hay cookie ni identificador persistente: client_key es el mismo hash con
-- sal de la IP que ya usan el asistente y el formulario, así que esto no sigue a
-- nadie entre sesiones ni entre sitios.
-- =============================================================================

create table page_views (
  id            bigint generated always as identity primary key,

  -- Lo genera el navegador al abrir la página. Es lo que permite casar el aviso
  -- de "se ha abierto" con el de "se ha cerrado", que llegan en dos peticiones
  -- distintas y separadas por todo el tiempo que dure la visita. Sin él no hay
  -- forma de calcular una duración.
  view_id       uuid not null unique,

  path          text not null,
  -- Solo en las fichas del corpus. Se manda desde el servidor, ya resuelto, en
  -- lugar de deducirlo de la ruta: la ruta es un detalle de presentación y el
  -- slug es la clave real del documento.
  document_slug text,

  client_key    text not null,
  referrer      text,
  user_agent    text,

  -- Lo rellena el segundo aviso, al salir. Queda a null cuando el navegador se
  -- cierra sin llegar a mandarlo, así que los promedios deben ignorar los nulos
  -- en vez de contarlos como cero.
  duration_ms   integer,

  created_at    timestamptz not null default now()
);

create index page_views_created_idx  on page_views (created_at desc);
create index page_views_path_idx     on page_views (path, created_at desc);

-- Índice parcial: la inmensa mayoría de las vistas son de la portada y no
-- tienen slug. Indexar solo las fichas deja el índice en una fracción del
-- tamaño y es justo la consulta que hace el panel.
create index page_views_document_idx on page_views (document_slug, created_at desc)
  where document_slug is not null;

-- Para cruzar una visita con el mensaje o la conversación que vino después.
create index page_views_client_idx on page_views (client_key, created_at desc);
