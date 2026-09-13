/**
 * Endpoint del formulario de contacto.
 *
 * Igual de fino que el del asistente: toda la lógica —campo trampa,
 * validación, límite y guardado— vive en recibirMensaje(), que no sabe nada de
 * HTTP.
 */
import { NextResponse } from 'next/server';
import { recibirMensaje } from '@/lib/contacto/index';
import { clientKeyOf } from '@/lib/site/visitante';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CuerpoContacto {
  nombre?: unknown;
  email?: unknown;
  mensaje?: unknown;
  trampa?: unknown;
}

const texto = (valor: unknown): string => (typeof valor === 'string' ? valor : '');

export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: CuerpoContacto;
  try {
    cuerpo = (await request.json()) as CuerpoContacto;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición no válido.' }, { status: 400 });
  }

  const userAgent = request.headers.get('user-agent') ?? '';

  try {
    const resultado = await recibirMensaje(
      {
        nombre: texto(cuerpo.nombre),
        email: texto(cuerpo.email),
        mensaje: texto(cuerpo.mensaje),
        trampa: texto(cuerpo.trampa),
      },
      { clientKey: clientKeyOf(request), ...(userAgent ? { userAgent } : {}) },
    );

    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.motivo }, { status: resultado.estado });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    // El detalle se registra en el servidor; al visitante se le da un mensaje
    // genérico.
    console.error('[api/contacto]', error);
    return NextResponse.json(
      { error: 'No se ha podido enviar el mensaje. Inténtalo de nuevo en un momento.' },
      { status: 503 },
    );
  }
}
