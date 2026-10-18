/**
 * Identificador aleatorio, también fuera de un contexto seguro.
 *
 * `crypto.randomUUID()` solo existe en contextos seguros: HTTPS y localhost. En
 * producción el sitio va por HTTPS y está, pero al abrir `next dev` desde otro
 * equipo de la red —`http://192.168.1.x:3000`, que es HTTP y no es localhost— el
 * navegador no lo expone, y la llamada revienta con «crypto.randomUUID is not a
 * function». El síntoma despista porque el resto de `crypto` sí está.
 *
 * `getRandomValues()`, en cambio, se expone siempre, así que el repuesto compone
 * el UUID a mano con los mismos bits aleatorios. Tiene que ser un UUID válido y
 * no una cadena cualquiera: `/api/telemetria` lo valida con una expresión
 * regular y la columna `page_views.view_id` es de tipo `uuid`, así que un
 * identificador con otra forma se rechazaría sin decir por qué.
 */
export function uuid(): string {
  const api = globalThis.crypto;
  if (typeof api?.randomUUID === 'function') return api.randomUUID();

  const bytes = new Uint8Array(16);
  if (typeof api?.getRandomValues === 'function') {
    api.getRandomValues(bytes);
  } else {
    // Último recurso. No es criptográfico, y no hace falta que lo sea: esto
    // identifica una vista de página durante los segundos que dura, no una
    // sesión ni a una persona.
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Los dos cuartetos que marcan versión 4 y variante RFC 4122.
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
