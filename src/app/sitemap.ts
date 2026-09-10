import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { env } from '@/lib/env';

/**
 * Mapa del sitio.
 *
 * Se genera desde la base de datos y no a mano: las URL publicadas son
 * exactamente los documentos públicos ingestados, de modo que publicar un
 * Markdown nuevo lo añade aquí sin que nadie tenga que acordarse.
 *
 * Si el sitio no es indexable devuelve una lista vacía, para no ofrecer un mapa
 * de rutas que a la vez se está pidiendo no rastrear.
 */
export const dynamic = 'force-dynamic';

function baseUrl(): string {
  return `https://${process.env['SITE_DOMAIN'] ?? 'rafaiasvillan.com'}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!env.siteIndexable) return [];

  const base = baseUrl();
  const documentos = await query<{ slug: string; updated_at: Date }>(
    `select slug, updated_at from documents
      where visibility = 'public' and kind <> 'perfil'
      order by updated_at desc`,
  );

  return [
    { url: base, lastModified: documentos[0]?.updated_at ?? new Date(), priority: 1 },
    ...documentos.map((documento) => ({
      url: `${base}/${documento.slug}`,
      lastModified: documento.updated_at,
      priority: 0.7,
    })),
  ];
}
