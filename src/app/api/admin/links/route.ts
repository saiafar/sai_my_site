import { NextResponse } from 'next/server';
import { haySesion } from '@/lib/admin/guardia';
import {
  leerConfiguracionLinks,
  guardarConfiguracionLinks,
  type ConfiguracionLinks,
} from '@/lib/site/links';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  if (!(await haySesion())) {
    return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
  }

  const config = await leerConfiguracionLinks();
  return NextResponse.json(config);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await haySesion())) {
    return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  if (!cuerpo || typeof cuerpo !== 'object') {
    return NextResponse.json({ error: 'Datos no válidos.' }, { status: 400 });
  }

  const datos = cuerpo as Partial<ConfiguracionLinks>;

  await guardarConfiguracionLinks({
    nombre: datos.nombre || '',
    titular: datos.titular || '',
    ubicacion: datos.ubicacion || '',
    telefono: datos.telefono || '',
    email: datos.email || '',
    web: datos.web || '',
    linkedin: datos.linkedin || '',
    behance: datos.behance || '',
    enlacesExtra: Array.isArray(datos.enlacesExtra) ? datos.enlacesExtra : [],
  });

  return NextResponse.json({ ok: true });
}
