/**
 * Lectura de la página de preguntas frecuentes.
 *
 * El contenido vive en `contenido/preguntas.md` y no en la base de datos, a
 * diferencia del resto del sitio. La razón es que estas respuestas se generan a
 * partir del corpus: si entraran en él, el asistente acabaría citando respuestas
 * derivadas de sus propios documentos, y una cadena así degrada en cada vuelta.
 * Fuera de `knowledge/`, el ciclo no puede cerrarse.
 *
 * El parser vive aquí y no en el script que genera los borradores para que los
 * dos usen exactamente el mismo: un formato interpretado de dos maneras acaba,
 * antes o después, con el script pisando lo que la página muestra.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface EntradaPregunta {
  pregunta: string;
  /** Markdown. Vacío mientras no se haya generado o escrito la respuesta. */
  respuesta: string;
}

export interface Preguntas {
  /** Todo lo anterior al primer `##`: texto escrito a mano. */
  preambulo: string;
  entradas: EntradaPregunta[];
}

export const RUTA_PREGUNTAS = path.join(process.cwd(), 'contenido', 'preguntas.md');

/** Parte el Markdown en preámbulo y entradas. */
export function parsearPreguntas(markdown: string): Preguntas {
  const partes = markdown.split(/^## /m);
  const preambulo = (partes.shift() ?? '').trimEnd();

  const entradas = partes.map((bloque) => {
    const salto = bloque.indexOf('\n');
    return salto === -1
      ? { pregunta: bloque.trim(), respuesta: '' }
      : { pregunta: bloque.slice(0, salto).trim(), respuesta: bloque.slice(salto + 1).trim() };
  });

  return { preambulo, entradas };
}

export function serializarPreguntas({ preambulo, entradas }: Preguntas): string {
  const cuerpo = entradas.map((e) => `## ${e.pregunta}\n\n${e.respuesta}\n`).join('\n');
  return `${preambulo}\n\n${cuerpo}`;
}

/**
 * Lee el fichero y devuelve solo las entradas con respuesta.
 *
 * Una pregunta sin respuesta es un borrador a medias: publicarla con un hueco
 * sería peor que no publicarla, y además el JSON-LD emitiría una Question sin
 * acceptedAnswer, que es una estructura inválida.
 */
export async function leerPreguntas(): Promise<Preguntas> {
  const markdown = await readFile(RUTA_PREGUNTAS, 'utf8').catch(() => '');
  if (markdown === '') return { preambulo: '', entradas: [] };

  const { preambulo, entradas } = parsearPreguntas(markdown);
  return { preambulo, entradas: entradas.filter((e) => e.respuesta !== '') };
}
