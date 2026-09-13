/**
 * Puerta del panel de administración.
 *
 * El fichero se llama `proxy.ts` y no `middleware.ts`: Next 16 renombró la
 * convención y avisa de que la antigua está obsoleta.
 *
 * Se comprueba aquí, antes de que Next resuelva la ruta, y no solo dentro de
 * cada página: un layout que redirige llega tarde: en el App Router el layout y
 * la página se renderizan en paralelo, así que la consulta a la base de datos de
 * una página protegida ya se habría lanzado. El proxy corta antes de nada.
 *
 * Esto es la puerta, no la cerradura: cada ruta de /api/admin vuelve a verificar
 * la sesión por su cuenta. Si un cambio futuro en el `matcher` deja una ruta
 * fuera por descuido, el fallo debe ser que sobra una comprobación, no que falta
 * la única que había.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_SESION, verificarSesion } from '@/lib/admin/sesion';

/** Rutas del panel accesibles sin sesión, porque son las que la crean. */
const PUBLICAS = ['/admin/entrar', '/api/admin/entrar'];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (PUBLICAS.some((ruta) => pathname === ruta)) return NextResponse.next();

  if (await verificarSesion(request.cookies.get(COOKIE_SESION)?.value)) {
    return NextResponse.next();
  }

  // A una llamada de API se le responde con un código, no con una redirección a
  // una página HTML que su cliente no sabría interpretar.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
  }

  const destino = request.nextUrl.clone();
  destino.pathname = '/admin/entrar';
  destino.search = '';
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
