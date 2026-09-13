/**
 * Cierre de sesión.
 *
 * Responde con una redirección para que funcione desde un formulario HTML
 * normal, sin JavaScript: el botón de salir no debería depender de que se haya
 * hidratado nada.
 */
import { NextResponse } from 'next/server';
import { COOKIE_SESION, opcionesCookie } from '@/lib/admin/sesion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  // 303 y no 302: obliga al navegador a pedir la página de destino con GET, en
  // lugar de reenviar el POST.
  const respuesta = NextResponse.redirect(new URL('/admin/entrar', request.url), 303);
  respuesta.cookies.set(COOKIE_SESION, '', opcionesCookie(0));
  return respuesta;
}
