/**
 * Comprobación de sesión desde el servidor.
 *
 * Vive aparte de `sesion.ts` porque usa `next/headers`, que no existe en el
 * runtime edge del proxy. La firma y la verificación criptográfica están
 * allí; aquí solo se saca la cookie de la petición en curso.
 */
import { cookies } from 'next/headers';
import { COOKIE_SESION, verificarSesion } from './sesion.ts';

export async function haySesion(): Promise<boolean> {
  const tarro = await cookies();
  return verificarSesion(tarro.get(COOKIE_SESION)?.value);
}
