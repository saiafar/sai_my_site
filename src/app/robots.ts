import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * robots.txt.
 *
 * Se genera en tiempo de ejecución y no como fichero estático porque depende de
 * SITE_INDEXABLE, que es una variable del despliegue: la misma imagen se sirve
 * indexable o no según el entorno, sin reconstruirla.
 *
 * Se acompaña siempre de la etiqueta meta robots del layout. Un robots.txt que
 * prohíbe rastrear no impide que una URL aparezca en los resultados si alguien
 * la enlaza —el buscador la lista sin haberla leído—, mientras que la etiqueta
 * meta sí excluye la página. Hacen falta las dos.
 */
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  if (!env.siteIndexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      // El endpoint del asistente cuesta dinero por llamada: ningún rastreador
      // tiene motivo para tocarlo. El panel, además, ni siquiera respondería:
      // se excluye para que no aparezca listado como URL bloqueada.
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] },
    ],
    sitemap: `https://${process.env['SITE_DOMAIN'] ?? 'rafaiasvillan.com'}/sitemap.xml`,
  };
}
