/**
 * Entrada al panel.
 *
 * Es la única ruta del panel a la que se llega sin sesión, así que es la única
 * que alguien puede atacar por fuerza bruta. De ahí el límite por visitante y
 * hora, que reutiliza el mismo mecanismo que frena el abuso del asistente.
 */
import { NextResponse } from 'next/server';
import { verificarClave } from '@/lib/admin/clave';
import {
  COOKIE_SESION,
  DURACION_SESION_S,
  firmarSesion,
  hashAdmin,
  opcionesCookie,
} from '@/lib/admin/sesion';
import { checkRateLimit } from '@/lib/rag/limits';
import { clientKeyOf } from '@/lib/site/visitante';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Intentos por hora y visitante. Diez es holgado para quien se equivoca al teclear. */
const INTENTOS_POR_HORA = 10;

export async function POST(request: Request): Promise<NextResponse> {
  const hash = hashAdmin();
  if (!hash) {
    // Sin contraseña configurada el panel está cerrado, no abierto. El mensaje
    // es explícito porque este error solo lo puede ver quien administra el
    // sitio: nadie más conoce la ruta y no revela nada aprovechable.
    return NextResponse.json(
      { error: 'El panel no tiene contraseña configurada (ADMIN_PASSWORD_HASH).' },
      { status: 503 },
    );
  }

  let cuerpo: { contrasena?: unknown };
  try {
    cuerpo = (await request.json()) as { contrasena?: unknown };
  } catch {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  const contrasena = typeof cuerpo.contrasena === 'string' ? cuerpo.contrasena : '';
  if (contrasena === '') {
    return NextResponse.json({ error: 'Escribe la contraseña.' }, { status: 400 });
  }

  // El límite se consume antes de comprobar nada: si solo contara los fallos,
  // bastaría con acertar de vez en cuando para no agotarlo nunca.
  const limite = await checkRateLimit(`admin:${clientKeyOf(request)}`, INTENTOS_POR_HORA);
  if (!limite.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Prueba dentro de un rato.' },
      { status: 429 },
    );
  }

  if (!(await verificarClave(contrasena, hash))) {
    return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(
    COOKIE_SESION,
    await firmarSesion(hash),
    opcionesCookie(DURACION_SESION_S),
  );
  return respuesta;
}
