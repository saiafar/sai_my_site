/**
 * Sesión del panel de administración.
 *
 * Una sola persona entra aquí, así que no hay tabla de usuarios ni almacén de
 * sesiones: la sesión es una cookie firmada que se valida sola. El servidor no
 * guarda nada, lo que además significa que un despliegue no echa a nadie.
 *
 * Todo este módulo usa Web Crypto y no `node:crypto` porque lo importa el
 * proxy (src/proxy.ts), que corre en el runtime edge, donde los módulos de Node no
 * existen. Por el mismo motivo lee `process.env` directamente en lugar de pasar
 * por `src/lib/env.ts`: ese módulo carga dotenv al importarse —necesario para
 * los scripts de CLI— y dotenv toca el sistema de ficheros. En la aplicación
 * Next no hace falta: Next ya carga `.env.local` por su cuenta.
 *
 * La verificación de la contraseña en sí (scrypt) vive aparte, en `clave.ts`,
 * porque solo la ejecuta la ruta de entrada, que sí corre en Node.
 */

export const COOKIE_SESION = 'admin_sesion';

/** Duración de la sesión. Una semana: es un panel privado de un sitio personal. */
export const DURACION_SESION_S = 7 * 24 * 60 * 60;

/**
 * Hash de la contraseña tal cual está en el entorno, o `undefined` si no se ha
 * configurado. Sin él el panel está cerrado: es preferible que no se pueda
 * entrar a que exista un modo "sin contraseña" que alguien active sin querer.
 */
export function hashAdmin(): string | undefined {
  const valor = process.env['ADMIN_PASSWORD_HASH'];
  return valor && valor.trim() !== '' ? valor.trim() : undefined;
}

/**
 * La clave de firma se deriva del hash de la contraseña en vez de vivir en su
 * propia variable de entorno. Dos ventajas: una variable menos que configurar en
 * Dokploy, y cambiar la contraseña invalida por construcción todas las sesiones
 * abiertas, que es exactamente lo que se espera al cambiarla.
 */
async function claveFirma(hash: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`sesion-admin|${hash}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function aBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * El tipo de retorno se fija sobre un ArrayBuffer concreto y no sobre el
 * ArrayBufferLike genérico que devuelve Uint8Array.from: crypto.subtle no acepta
 * vistas que pudieran estar respaldadas por un SharedArrayBuffer.
 */
function deBase64Url(texto: string): Uint8Array<ArrayBuffer> {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/');
  const binario = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  const bytes = new Uint8Array(new ArrayBuffer(binario.length));
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

/** Emite el valor de la cookie: carga útil con la caducidad, y su firma. */
export async function firmarSesion(hash: string, ahora = Date.now()): Promise<string> {
  const carga = aBase64Url(
    new TextEncoder().encode(
      JSON.stringify({ exp: Math.floor(ahora / 1000) + DURACION_SESION_S }),
    ),
  );
  const firma = await crypto.subtle.sign(
    'HMAC',
    await claveFirma(hash),
    new TextEncoder().encode(carga),
  );
  return `${carga}.${aBase64Url(new Uint8Array(firma))}`;
}

/**
 * Comprueba firma y caducidad. Devuelve un booleano y no el contenido porque no
 * hay nada dentro que interese: la única pregunta es si quien trae la cookie la
 * obtuvo de esta aplicación.
 *
 * Se usa `crypto.subtle.verify` en lugar de comparar cadenas: la comparación
 * normal termina en el primer carácter distinto, y ese tiempo distinto es
 * información sobre la firma correcta.
 */
export async function verificarSesion(
  cookie: string | undefined,
  ahora = Date.now(),
): Promise<boolean> {
  const hash = hashAdmin();
  if (!hash || !cookie) return false;

  const [carga, firma] = cookie.split('.');
  if (!carga || !firma) return false;

  try {
    const valida = await crypto.subtle.verify(
      'HMAC',
      await claveFirma(hash),
      deBase64Url(firma),
      new TextEncoder().encode(carga),
    );
    if (!valida) return false;

    const { exp } = JSON.parse(new TextDecoder().decode(deBase64Url(carga))) as { exp?: number };
    return typeof exp === 'number' && exp * 1000 > ahora;
  } catch {
    // Cookie manipulada o de un formato anterior: no es un error del servidor,
    // simplemente no vale.
    return false;
  }
}

/** Opciones de la cookie, en un solo sitio para que entrada y salida coincidan. */
export function opcionesCookie(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}
