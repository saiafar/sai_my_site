/**
 * Lecturas del panel de administración.
 *
 * Todas las consultas viven aquí, separadas de las páginas, por el mismo motivo
 * que en src/lib/site/queries.ts: una página que lleva su SQL dentro es una
 * página que nadie puede probar sin un navegador.
 *
 * Dos convenciones que se repiten:
 *
 *  - `pg` devuelve los enteros grandes y los `numeric` como cadenas, para no
 *    perder precisión en JavaScript. Se convierten aquí, en el borde, para que
 *    ninguna página tenga que acordarse.
 *  - Las duraciones nulas —visitas cuyo aviso de salida no llegó nunca— se
 *    excluyen de las medias en lugar de contarse como cero, que hundiría el
 *    promedio con visitas que en realidad no se midieron.
 */
import { query } from '../db/index.ts';

const num = (valor: unknown): number => Number(valor ?? 0);
const numONulo = (valor: unknown): number | null =>
  valor === null || valor === undefined ? null : Number(valor);

// -----------------------------------------------------------------------------
// Visitas
// -----------------------------------------------------------------------------

export interface ResumenVisitas {
  vistas: number;
  /** Visitantes distintos, contados por el hash de IP: aproximado por diseño. */
  visitantes: number;
  duracionMediaMs: number | null;
}

export async function resumenVisitas(dias: number): Promise<ResumenVisitas> {
  const filas = await query<Record<string, unknown>>(
    `select count(*)                                   as vistas,
            count(distinct client_key)                 as visitantes,
            avg(duration_ms) filter (where duration_ms is not null) as duracion
       from page_views
      where created_at >= now() - ($1 || ' days')::interval`,
    [String(dias)],
  );

  const fila = filas[0] ?? {};
  return {
    vistas: num(fila['vistas']),
    visitantes: num(fila['visitantes']),
    duracionMediaMs: numONulo(fila['duracion']),
  };
}

export interface DiaConVisitas {
  dia: string;
  vistas: number;
  visitantes: number;
}

/**
 * Serie diaria, con los días sin visitas incluidos.
 *
 * El `generate_series` no es un adorno: un gráfico que solo dibuja los días con
 * datos comprime los huecos y hace parecer continuo lo que fueron tres visitas
 * sueltas en un mes.
 */
export async function visitasPorDia(dias: number): Promise<DiaConVisitas[]> {
  const filas = await query<Record<string, unknown>>(
    `with calendario as (
       select generate_series(
         (now() - ($1 || ' days')::interval)::date,
         now()::date,
         '1 day'::interval
       )::date as dia
     )
     select calendario.dia,
            count(page_views.id)                  as vistas,
            count(distinct page_views.client_key) as visitantes
       from calendario
       left join page_views on page_views.created_at::date = calendario.dia
      group by calendario.dia
      order by calendario.dia`,
    [String(dias)],
  );

  return filas.map((f) => ({
    dia: String(f['dia'] instanceof Date ? f['dia'].toISOString().slice(0, 10) : f['dia']),
    vistas: num(f['vistas']),
    visitantes: num(f['visitantes']),
  }));
}

export interface FilaPagina {
  clave: string;
  vistas: number;
  visitantes: number;
  duracionMediaMs: number | null;
}

export async function paginasMasVistas(dias: number, limite = 12): Promise<FilaPagina[]> {
  const filas = await query<Record<string, unknown>>(
    `select path                                       as clave,
            count(*)                                   as vistas,
            count(distinct client_key)                 as visitantes,
            avg(duration_ms) filter (where duration_ms is not null) as duracion
       from page_views
      where created_at >= now() - ($1 || ' days')::interval
      group by path
      order by vistas desc
      limit $2`,
    [String(dias), limite],
  );
  return filas.map(aFilaPagina);
}

/** Solo las fichas del corpus: es la respuesta a «¿han entrado a este proyecto?». */
export async function documentosMasVistos(dias: number, limite = 12): Promise<FilaPagina[]> {
  const filas = await query<Record<string, unknown>>(
    `select document_slug                              as clave,
            count(*)                                   as vistas,
            count(distinct client_key)                 as visitantes,
            avg(duration_ms) filter (where duration_ms is not null) as duracion
       from page_views
      where document_slug is not null
        and created_at >= now() - ($1 || ' days')::interval
      group by document_slug
      order by vistas desc
      limit $2`,
    [String(dias), limite],
  );
  return filas.map(aFilaPagina);
}

function aFilaPagina(f: Record<string, unknown>): FilaPagina {
  return {
    clave: String(f['clave'] ?? ''),
    vistas: num(f['vistas']),
    visitantes: num(f['visitantes']),
    duracionMediaMs: numONulo(f['duracion']),
  };
}

export interface Origen {
  origen: string;
  vistas: number;
}

/**
 * De dónde llega la gente, agrupado por dominio.
 *
 * Se agrupa por dominio y no por URL completa porque lo que se quiere saber es
 * «de LinkedIn» o «de una búsqueda», no de qué publicación concreta; y porque
 * las URL completas traen parámetros de campaña que multiplican la misma fuente
 * en veinte filas distintas.
 */
export async function origenes(dias: number, limite = 10): Promise<Origen[]> {
  const filas = await query<Record<string, unknown>>(
    `select coalesce(nullif(substring(referrer from '^https?://([^/]+)'), ''), 'directo') as origen,
            count(*) as vistas
       from page_views
      where created_at >= now() - ($1 || ' days')::interval
      group by 1
      order by vistas desc
      limit $2`,
    [String(dias), limite],
  );
  return filas.map((f) => ({ origen: String(f['origen'] ?? 'directo'), vistas: num(f['vistas']) }));
}

// -----------------------------------------------------------------------------
// Historial
// -----------------------------------------------------------------------------

export interface MensajeContacto {
  id: number;
  nombre: string;
  email: string;
  mensaje: string;
  estado: string;
  clientKey: string | null;
  creadoEn: Date;
  entregadoEn: Date | null;
  errorEntrega: string | null;
  intentos: number;
}

export async function mensajesContacto(limite = 100): Promise<MensajeContacto[]> {
  const filas = await query<Record<string, unknown>>(
    `select id, name, email, message, status, client_key, created_at,
            delivered_at, delivery_error, delivery_tries
       from contact_messages
      order by created_at desc
      limit $1`,
    [limite],
  );

  return filas.map((f) => ({
    id: num(f['id']),
    nombre: String(f['name'] ?? ''),
    email: String(f['email'] ?? ''),
    mensaje: String(f['message'] ?? ''),
    estado: String(f['status'] ?? 'nuevo'),
    clientKey: (f['client_key'] as string | null) ?? null,
    creadoEn: f['created_at'] as Date,
    entregadoEn: (f['delivered_at'] as Date | null) ?? null,
    errorEntrega: (f['delivery_error'] as string | null) ?? null,
    intentos: num(f['delivery_tries']),
  }));
}

export interface PreguntaAsistente {
  pregunta: string;
  respuesta: string | null;
  clientKey: string;
  creadaEn: Date;
  latenciaMs: number | null;
  costeUsd: number | null;
  motivoRechazo: string | null;
}

/**
 * Preguntas al asistente con su respuesta.
 *
 * La unión es por `turn` dentro de la misma conversación: es la forma que tiene
 * el esquema de emparejar lo que se preguntó con lo que se contestó. Se hace con
 * `left join` porque una pregunta puede no tener respuesta —el modelo falló, se
 * agotó el presupuesto— y esos casos son precisamente los que interesa ver.
 */
export async function preguntasAsistente(limite = 100): Promise<PreguntaAsistente[]> {
  const filas = await query<Record<string, unknown>>(
    `select pregunta.content   as pregunta,
            respuesta.content  as respuesta,
            conv.client_key,
            pregunta.created_at,
            respuesta.latency_ms,
            respuesta.cost_usd,
            respuesta.refusal_reason
       from messages pregunta
       join conversations conv on conv.id = pregunta.conversation_id
       left join messages respuesta
              on respuesta.conversation_id = pregunta.conversation_id
             and respuesta.turn = pregunta.turn
             and respuesta.role = 'assistant'
      where pregunta.role = 'user'
      order by pregunta.created_at desc
      limit $1`,
    [limite],
  );

  return filas.map((f) => ({
    pregunta: String(f['pregunta'] ?? ''),
    respuesta: (f['respuesta'] as string | null) ?? null,
    clientKey: String(f['client_key'] ?? ''),
    creadaEn: f['created_at'] as Date,
    latenciaMs: numONulo(f['latency_ms']),
    costeUsd: numONulo(f['cost_usd']),
    motivoRechazo: (f['refusal_reason'] as string | null) ?? null,
  }));
}

export interface PasoDelRastro {
  path: string;
  documentSlug: string | null;
  creadoEn: Date;
  duracionMs: number | null;
}

/**
 * Qué miraron unos visitantes concretos, antes de escribir o preguntar.
 *
 * Sale gratis porque las tres tablas —vistas, mensajes y conversaciones—
 * comparten el mismo `client_key`, y es lo que convierte «un mensaje de alguien»
 * en «alguien que leyó dos proyectos y luego escribió».
 *
 * Recibe todas las claves de golpe y no una por mensaje a propósito: la bandeja
 * pinta cincuenta mensajes, y una consulta por cada uno es el camino corto a que
 * el panel tarde segundos en cargar. La numeración por ventana recorta a los
 * últimos pasos de cada visitante dentro de la misma consulta.
 */
export async function rastrosDeVisitantes(
  claves: readonly string[],
  porVisitante = 8,
): Promise<Map<string, PasoDelRastro[]>> {
  const rastros = new Map<string, PasoDelRastro[]>();
  if (claves.length === 0) return rastros;

  const filas = await query<Record<string, unknown>>(
    `select client_key, path, document_slug, created_at, duration_ms
       from (
         select client_key, path, document_slug, created_at, duration_ms,
                row_number() over (partition by client_key order by created_at desc) as posicion
           from page_views
          where client_key = any($1)
       ) recientes
      where posicion <= $2
      order by client_key, created_at desc`,
    [[...new Set(claves)], porVisitante],
  );

  for (const f of filas) {
    const clave = String(f['client_key'] ?? '');
    const paso: PasoDelRastro = {
      path: String(f['path'] ?? ''),
      documentSlug: (f['document_slug'] as string | null) ?? null,
      creadoEn: f['created_at'] as Date,
      duracionMs: numONulo(f['duration_ms']),
    };
    const existente = rastros.get(clave);
    if (existente) existente.push(paso);
    else rastros.set(clave, [paso]);
  }

  return rastros;
}
