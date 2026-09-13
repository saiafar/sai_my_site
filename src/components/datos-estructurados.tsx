/**
 * Emite un bloque JSON-LD.
 *
 * El escapado de `<` no es paranoia de manual: el contenido de estos nodos sale
 * del corpus, y basta con que una ficha mencione una etiqueta HTML entre signos
 * de menor y mayor para que el navegador vea ahí el final del `<script>` y se
 * coma el resto del documento. Sustituirlo por su escape Unicode deja el JSON
 * igual de válido —`<` y `<` son el mismo carácter para JSON.parse— y
 * elimina el problema de raíz.
 */
export function DatosEstructurados({ datos }: { datos: Record<string, unknown> }) {
  const json = JSON.stringify(datos).replace(/</g, '\\u003c');

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
