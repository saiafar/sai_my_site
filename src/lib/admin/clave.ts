/**
 * Derivación y comprobación de la contraseña del panel.
 *
 * Separado de `sesion.ts` porque usa `node:crypto`: lo ejecutan la ruta de
 * entrada y el script `npm run admin:clave`, ambos en Node, nunca el proxy.
 *
 * Se usa scrypt y no un SHA directo porque el propósito es distinto. Un SHA está
 * diseñado para ser rápido, que es justo lo que no quieres cuando alguien se
 * lleva el hash y empieza a probar contraseñas: scrypt es deliberadamente lento
 * y consume memoria, de modo que probar un diccionario cuesta tiempo real.
 */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  clave: string,
  sal: Buffer,
  longitud: number,
) => Promise<Buffer>;

const LONGITUD = 32;

/** Genera el valor de ADMIN_PASSWORD_HASH para una contraseña dada. */
export async function derivarClave(contrasena: string): Promise<string> {
  const sal = randomBytes(16);
  const derivada = await scryptAsync(contrasena.normalize('NFKC'), sal, LONGITUD);
  return `scrypt$${sal.toString('hex')}$${derivada.toString('hex')}`;
}

/**
 * Comprueba una contraseña contra el valor almacenado.
 *
 * La comparación es de tiempo constante: `===` sobre dos cadenas termina en el
 * primer byte distinto, y medir esa diferencia permite reconstruir el hash
 * correcto byte a byte.
 */
export async function verificarClave(contrasena: string, almacenado: string): Promise<boolean> {
  const [algoritmo, salHex, hashHex] = almacenado.split('$');
  if (algoritmo !== 'scrypt' || !salHex || !hashHex) return false;

  let esperado: Buffer;
  try {
    esperado = Buffer.from(hashHex, 'hex');
  } catch {
    return false;
  }
  if (esperado.length !== LONGITUD) return false;

  const derivada = await scryptAsync(
    contrasena.normalize('NFKC'),
    Buffer.from(salHex, 'hex'),
    LONGITUD,
  );
  return timingSafeEqual(derivada, esperado);
}
