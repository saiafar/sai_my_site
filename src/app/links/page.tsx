import type { Metadata } from 'next';
import { VistaLinks } from '@/components/links/vista-links';
import { leerConfiguracionLinks } from '@/lib/site/links';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const config = await leerConfiguracionLinks();
  const titulo = `Links — ${config.nombre || env.siteOwner}`;
  const descripcion = `Enlaces y vías de contacto de ${config.nombre || env.siteOwner}: ${config.titular}. Ubicación, teléfono, email, LinkedIn, Behance y web.`;
  const url = `${env.siteUrl}/links`;

  return {
    title: titulo,
    description: descripcion,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'profile',
      url,
      title: titulo,
      description: descripcion,
      images: ['/og.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
      images: ['/og.jpg'],
    },
  };
}

export default async function LinksPage() {
  const config = await leerConfiguracionLinks();

  return <VistaLinks config={config} siteUrl={env.siteUrl} />;
}
