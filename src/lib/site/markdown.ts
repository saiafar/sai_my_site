import { Marked } from 'marked';

/**
 * Extensiones de vídeo soportadas para sustitución automática en sintaxis markdown.
 */
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

/**
 * Expresión regular para identificar URLs de YouTube y extraer su ID.
 */
const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

/**
 * Expresión regular para identificar URLs de Vimeo y extraer su ID.
 */
const VIMEO_REGEX = /(?:vimeo\.com\/(?:video\/)?)(\d+)/i;

/**
 * Instancia configurada de Marked para el sitio.
 *
 * Adapta imágenes y vídeos para que se integren armoniosamente en el sistema
 * de diseño oscuro:
 *  - Envuelve imágenes en <figure> con <figcaption> si traen descripción o título.
 *  - Detecta si el enlace de imagen apunta a un archivo de vídeo (.mp4, .webm, etc.)
 *    y emite una etiqueta semántica <video controls playsinline preload="metadata">.
 *  - Detecta enlaces a plataformas como YouTube o Vimeo y genera un iframe embebido responsive.
 *  - Desenrosca los párrafos <p> que contengan solo un <figure> para mantener el DOM limpio y válido.
 */
const markedInstance = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    image({ href, title, text }) {
      const caption = title || text;
      const captionHtml = caption
        ? `<figcaption class="prose-caption">${caption}</figcaption>`
        : '';

      // 1. Detección de video de YouTube
      const ytMatch = href.match(YOUTUBE_REGEX);
      if (ytMatch) {
        const videoId = ytMatch[1];
        return (
          `<figure class="prose-media prose-iframe">` +
          `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}" ` +
          `title="${title || text || 'Video'}" ` +
          `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ` +
          `allowfullscreen loading="lazy"></iframe>` +
          captionHtml +
          `</figure>`
        );
      }

      // 2. Detección de video de Vimeo
      const vimeoMatch = href.match(VIMEO_REGEX);
      if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        return (
          `<figure class="prose-media prose-iframe">` +
          `<iframe src="https://player.vimeo.com/video/${videoId}" ` +
          `title="${title || text || 'Video'}" ` +
          `allow="autoplay; fullscreen; picture-in-picture" ` +
          `allowfullscreen loading="lazy"></iframe>` +
          captionHtml +
          `</figure>`
        );
      }

      // 3. Detección de archivo de vídeo local / remoto directo
      if (VIDEO_EXTENSIONS.test(href)) {
        return (
          `<figure class="prose-media prose-video">` +
          `<video controls playsinline preload="metadata" src="${href}">` +
          `Tu navegador no soporta la reproducción de este vídeo.` +
          `</video>` +
          captionHtml +
          `</figure>`
        );
      }

      // 4. Imagen estándar con carga diferida (lazy)
      return (
        `<figure class="prose-media prose-image">` +
        `<img src="${href}" alt="${text}" loading="lazy" />` +
        captionHtml +
        `</figure>`
      );
    },
  },
  hooks: {
    postprocess(html) {
      // Evita que el navegador envuelva elementos de bloque <figure> dentro de <p>
      return html.replace(/<p>\s*(<figure[\s\S]*?<\/figure>)\s*<\/p>/g, '$1');
    },
  },
});

/**
 * Convierte Markdown a HTML con soporte enriquecido para imágenes, vídeos y figuras.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  if (!markdown) return '';
  return await markedInstance.parse(markdown);
}
