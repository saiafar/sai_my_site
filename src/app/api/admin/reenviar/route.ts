/**
 * Reintento de entrega de un mensaje que no llegó a N8N.
 *
 * Existe porque el formulario nunca falla de cara al visitante: si el webhook
 * estaba caído, el mensaje quedó guardado y marcado como pendiente, y esta ruta
 * es la que lo recupera una vez arreglado el flujo.
 */
import { NextResponse } from 'next/server';
import { haySesion } from '@/lib/admin/guardia';
import { entregarMensaje } from '@/lib/contacto/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await haySesion())) {
    return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
  }

  let cuerpo: { id?: unknown };
  try {
    cuerpo = (await request.json()) as { id?: unknown };
  } catch {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  const id = Number(cuerpo.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Identificador no válido.' }, { status: 400 });
  }

  return NextResponse.json(await entregarMensaje(id));
}
