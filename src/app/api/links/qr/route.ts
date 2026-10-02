import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { generarQrSvgConLogo } from '@/lib/site/qr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const enlaceDestino = `${env.siteUrl}/links`;
    const svg = await generarQrSvgConLogo(enlaceDestino);

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generando QR:', error);
    return NextResponse.json({ error: 'No se pudo generar el código QR.' }, { status: 500 });
  }
}
