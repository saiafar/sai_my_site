import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const rutasPosibles = [
    path.join(process.cwd(), 'public', 'cv-rafaias-villan-desarrollador.pdf'),
    path.join(process.cwd(), 'public', 'cv-rafaias-villan.pdf'),
    '/app/public/cv-rafaias-villan-desarrollador.pdf',
    '/app/public/cv-rafaias-villan.pdf',
  ];

  let buffer: Buffer | null = null;
  for (const ruta of rutasPosibles) {
    try {
      buffer = await fs.readFile(/*turbopackIgnore: true*/ ruta);
      break;
    } catch {
      // Probar siguiente ruta
    }
  }

  if (!buffer) {
    return NextResponse.json({ error: 'Archivo CV no encontrado.' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Rafaias Villan - Desarrollador FullStack.pdf"',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
