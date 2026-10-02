import type { Metadata } from 'next';
import { FormularioLinks } from '@/components/admin/formulario-links';
import { PanelQr } from '@/components/admin/panel-qr';
import { leerConfiguracionLinks } from '@/lib/site/links';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Links — Panel — Rafaías Villán',
};

export default async function AdminLinksPage() {
  const config = await leerConfiguracionLinks();
  const enlaceDestino = `${env.siteUrl}/links`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl tracking-tight text-ink">Links</h1>
        <p className="mt-1 text-[13px] text-ink-faint">
          Configuración de la página estilo Linktree en <span className="font-mono text-ink-muted">/links</span> y código QR para compartir y copiar.
        </p>
      </div>

      {/* Tarjeta destacada del Código QR con logo para copiar y descargar */}
      <PanelQr enlaceDestino={enlaceDestino} />

      {/* Formulario de edición de links y contactos */}
      <FormularioLinks inicial={config} />
    </div>
  );
}
