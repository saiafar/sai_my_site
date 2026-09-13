/**
 * Ajustes del panel: guardar el destino del formulario y probarlo.
 *
 * La comprobación de sesión se repite aquí aunque el proxy ya la haga. No
 * es redundancia gratuita: si algún día el `matcher` del proxy cambia y
 * deja esta ruta fuera, el fallo debe ser que sobra una comprobación, no que
 * cualquiera puede reescribir a dónde van los mensajes de contacto.
 */
import { NextResponse } from 'next/server';
import { guardarAjuste } from '@/lib/admin/ajustes';
import { haySesion } from '@/lib/admin/guardia';
import { enviarAWebhook } from '@/lib/contacto/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Cuerpo {
  accion?: unknown;
  webhookUrl?: unknown;
  webhookSecret?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await haySesion())) {
    return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
  }

  let cuerpo: Cuerpo;
  try {
    cuerpo = (await request.json()) as Cuerpo;
  } catch {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  if (cuerpo.accion === 'probar') {
    const resultado = await enviarAWebhook({
      id: null,
      nombre: 'Prueba desde el panel',
      email: 'prueba@rafaiasvillan.com',
      mensaje: 'Mensaje de prueba. Si lo ves en N8N, el flujo está bien conectado.',
      recibidoEn: new Date().toISOString(),
      // Marcado como prueba para que el flujo de N8N pueda descartarlo antes de
      // avisar por correo o crear una tarjeta en un tablero.
      prueba: true,
    });
    return NextResponse.json(resultado);
  }

  const url = typeof cuerpo.webhookUrl === 'string' ? cuerpo.webhookUrl.trim() : '';
  const secreto = typeof cuerpo.webhookSecret === 'string' ? cuerpo.webhookSecret.trim() : '';

  // Se acepta el vacío: es la forma de desactivar el reenvío y volver a
  // gestionar los mensajes solo desde el panel.
  if (url !== '') {
    let analizada: URL;
    try {
      analizada = new URL(url);
    } catch {
      return NextResponse.json({ error: 'La URL no es válida.' }, { status: 400 });
    }
    if (analizada.protocol !== 'https:' && analizada.protocol !== 'http:') {
      return NextResponse.json({ error: 'La URL debe ser http o https.' }, { status: 400 });
    }
  }

  await guardarAjuste('contacto.webhook_url', url);
  await guardarAjuste('contacto.webhook_secret', secreto);

  return NextResponse.json({ ok: true });
}
