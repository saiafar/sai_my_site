/**
 * Recogida de vistas de página.
 *
 * Dos avisos por visita, que llegan en peticiones separadas:
 *
 *   { tipo: 'vista',  ... }   al abrir la página, crea la fila.
 *   { tipo: 'salida', ... }   al abandonarla, le añade la duración.
 *
 * Se separan porque la duración no se conoce hasta el final, y el final es
 * precisamente el momento en que el navegador está cerrando la pestaña y ya no
 * ejecuta nada: el segundo aviso sale con sendBeacon, que el navegador se
 * compromete a entregar aunque la página haya muerto.
 *
 * El endpoint no devuelve datos nunca. Ante cualquier entrada rara responde 204
 * y no guarda: un error aquí no debe ensuciar la consola del visitante ni
 * decirle a quien esté probando qué forma tiene que tener la petición para
 * colar filas.
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/index';
import { checkRateLimit } from '@/lib/rag/limits';
import { clientKeyOf } from '@/lib/site/visitante';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Tope por visitante y hora. Alto a propósito: una persona leyendo el sitio
 * genera unas pocas decenas de vistas, así que esto no estorba a nadie real y
 * sigue impidiendo que un bucle de curl llene la tabla.
 */
const LIMITE_POR_HORA = 300;

/**
 * Rastreadores declarados. No pretende ser exhaustivo —quien quiera disfrazarse
 * lo hace en una línea—, solo evitar que Googlebot y los verificadores de
 * enlaces de las redes sociales inflen las cifras, que es el caso real.
 */
const ROBOTS = /bot|crawl|spider|slurp|preview|monitor|curl|wget|headless|lighthouse/i;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const recorta = (valor: unknown, max: number): string | null =>
  typeof valor === 'string' && valor.trim() !== '' ? valor.trim().slice(0, max) : null;

/** Respuesta única: sin cuerpo, sin pistas. */
const sinContenido = (): NextResponse => new NextResponse(null, { status: 204 });

export async function POST(request: Request): Promise<NextResponse> {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (ROBOTS.test(userAgent)) return sinContenido();

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return sinContenido();
  }

  const viewId = recorta(cuerpo['viewId'], 36);
  if (!viewId || !UUID.test(viewId)) return sinContenido();

  try {
    const clientKey = clientKeyOf(request);

    if (cuerpo['tipo'] === 'salida') {
      const duracion = Number(cuerpo['durationMs']);
      // Se descartan las negativas y las absurdas: una pestaña abierta toda la
      // noche en segundo plano no es tiempo de lectura, y una sola de esas
      // arrastra la media de todo el mes.
      if (!Number.isFinite(duracion) || duracion < 0 || duracion > 2 * 60 * 60 * 1000) {
        return sinContenido();
      }

      // La condición sobre duration_ms hace la operación idempotente: pagehide y
      // visibilitychange se disparan los dos al cerrar, y el primero que llegue
      // es el bueno.
      await query(
        `update page_views
            set duration_ms = $2
          where view_id = $1 and duration_ms is null and client_key = $3`,
        [viewId, Math.round(duracion), clientKey],
      );
      return sinContenido();
    }

    const path = recorta(cuerpo['path'], 500);
    // El panel no se mide a sí mismo.
    if (!path || !path.startsWith('/') || path.startsWith('/admin')) return sinContenido();

    const limite = await checkRateLimit(`telemetria:${clientKey}`, LIMITE_POR_HORA);
    if (!limite.allowed) return sinContenido();

    await query(
      `insert into page_views (view_id, path, document_slug, client_key, referrer, user_agent)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (view_id) do nothing`,
      [
        viewId,
        path,
        recorta(cuerpo['documentSlug'], 300),
        clientKey,
        recorta(cuerpo['referrer'], 500),
        userAgent.slice(0, 500) || null,
      ],
    );
  } catch (error) {
    // Que la analítica falle no puede notarse en el sitio.
    console.error('[api/telemetria]', error);
  }

  return sinContenido();
}
