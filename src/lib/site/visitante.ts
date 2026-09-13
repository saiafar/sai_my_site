/**
 * Identificación del visitante a partir de la petición HTTP.
 *
 * Vive aparte porque lo usan dos endpoints —el asistente y el formulario de
 * contacto— y porque es la única pieza del sistema que toca cabeceras de
 * proxy: mantenerla en un sitio evita que una de las dos se quede atrás si
 * algún día cambia la cadena de proxies.
 */
import { clientKeyFrom } from '../rag/limits.ts';

/**
 * x-forwarded-for puede traer una cadena de proxies; el primer elemento es el
 * cliente original. Se toma solo ese y nunca se almacena: clientKeyFrom lo
 * convierte en un hash con sal, de modo que se puede contar cuántas peticiones
 * lleva alguien sin guardar quién es.
 */
export function clientKeyOf(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const real = request.headers.get('x-real-ip') ?? '';
  const ip = (forwarded.split(',')[0] ?? '').trim() || real.trim() || 'desconocido';
  return clientKeyFrom(ip, request.headers.get('user-agent') ?? '');
}
