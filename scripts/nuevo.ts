/**
 * Crea un documento nuevo en la base de conocimiento.
 *
 * Existe porque escribir veinte fichas seguidas a mano tiene dos costes que no
 * aportan nada: repetir el frontmatter —donde un simple dos puntos sin comillas
 * rompe la ingestión— y decidir cada vez qué secciones poner.
 *
 * Todo lo que crea nace con `visibilidad: private`. Es deliberado: un documento
 * a medio escribir se ingesta pero no aparece en la web ni el asistente puede
 * citarlo, así que se puede dejar a medias sin que nadie lo vea. Publicarlo es
 * cambiar una palabra cuando esté listo.
 *
 * Uso:
 *   npm run nuevo -- proyecto "Migración del ERP a PostgreSQL"
 *   npm run nuevo -- experiencia "Consultora Tal"
 *   npm run nuevo -- nota "Por qué particionar por rango"
 *   npm run nuevo -- tecnologia "PostgreSQL"
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { slugify } from '../src/lib/knowledge/slug.ts';

const CARPETAS = {
  perfil: 'perfil',
  experiencia: 'experiencia',
  proyecto: 'proyectos',
  tecnologia: 'tecnologias',
  nota: 'notas',
} as const;

type Tipo = keyof typeof CARPETAS;

/**
 * Los apuntes bajo cada encabezado son el andamiaje: se borran al escribir. Van
 * en el cuerpo y no en un comentario porque un comentario se olvida, y como el
 * documento nace privado, nadie los va a leer por accidente.
 */
const PLANTILLAS: Record<Tipo, string> = {
  proyecto: `## Contexto

Qué existía antes y por qué era un problema. Concreto: volúmenes, tiempos,
número de usuarios, coste. Los números son lo que distingue una experiencia real
de una lista de tecnologías.

## Mi papel

Qué hiciste tú exactamente y qué hizo el resto del equipo. Sé honesto con el
límite: es lo primero que se comprueba en una entrevista.

## Decisiones técnicas

Qué elegiste, **qué descartaste y por qué**. Esta es la sección más valiosa del
documento: «elegí Laravel» no dice nada, «elegí Laravel sobre X porque el equipo
ya lo conocía y el plazo era de seis semanas» dice cómo decides.

## Retos

Qué salió mal, qué costó más de lo previsto, qué aprendiste a la fuerza. Aquí es
donde un currículum miente por omisión y donde este formato te diferencia.

## Resultado

Qué cambió de forma medible. Si tienes un porcentaje, dale su denominador: «un
60 %» no dice nada sin saber sobre qué base y en cuánto tiempo.
`,
  experiencia: `## El puesto

Qué empresa, qué hacía, cuál era tu responsabilidad real y con qué autonomía.

## Qué construí

Los proyectos de la etapa. Si alguno da para contexto, decisión y resultado,
sácalo a su propia ficha en proyectos/ y déjalo aquí en una línea con un enlace.
Si solo da para tres frases, se queda aquí como sección.

## Cómo era el equipo

Tamaño, a quién reportabas, a quién dirigías. Ayuda a situar el alcance de lo
que cuentas.

## Qué me llevé

Lo que aprendiste en esta etapa y no en otra.
`,
  tecnologia: `## Cómo la uso

En qué proyectos y para qué. Concreto.

## Qué me gusta y qué no

Después de años usándola. Una opinión razonada vale más que una lista de
características, y es lo que demuestra que la has usado de verdad.

## Cuándo NO la elegiría

La pregunta que separa a quien conoce una herramienta de quien la ha leído.
`,
  nota: `## El problema

Qué te encontraste.

## Qué probé

Incluido lo que no funcionó.

## Qué aprendí

La conclusión, en una frase que se entienda sola.
`,
  perfil: `## Quién soy

## Cómo trabajo

## Con qué trabajo habitualmente
`,
};

function frontmatter(tipo: Tipo, titulo: string): string {
  const comunes = [
    `title: ${titulo.includes(':') ? `"${titulo}"` : titulo}`,
    'summary: ',
  ];

  const propios: Record<Tipo, string[]> = {
    proyecto: ['organizacion: ', 'rol: ', 'inicio: ', 'fin: ', 'parte_de: '],
    experiencia: ['organizacion: ', 'rol: ', 'inicio: ', 'fin: '],
    tecnologia: [],
    nota: ['inicio: '],
    perfil: ['inicio: '],
  };

  return [
    '---',
    ...comunes,
    ...propios[tipo],
    'tecnologias: []',
    '# Cámbialo a public cuando el documento esté listo para verse.',
    'visibilidad: private',
    '---',
    '',
  ].join('\n');
}

async function main(): Promise<void> {
  const [tipoBruto, ...resto] = process.argv.slice(2);
  const titulo = resto.join(' ').trim();

  const tipo = tipoBruto as Tipo;
  if (!tipoBruto || !(tipoBruto in CARPETAS) || !titulo) {
    console.error(
      'Uso: npm run nuevo -- <tipo> "Título del documento"\n' +
        `Tipos: ${Object.keys(CARPETAS).join(', ')}\n\n` +
        'Ejemplo:  npm run nuevo -- proyecto "Migración del ERP a PostgreSQL"',
    );
    process.exitCode = 1;
    return;
  }

  const carpeta = CARPETAS[tipo];
  const slug = slugify(titulo);
  const ruta = path.join(process.cwd(), 'knowledge', carpeta, `${slug}.md`);

  // Nunca sobreescribir: el corpus es trabajo escrito a mano y perderlo por un
  // título repetido sería absurdo.
  try {
    await access(ruta);
    console.error(`Ya existe ${path.relative(process.cwd(), ruta)}. No se ha tocado.`);
    process.exitCode = 1;
    return;
  } catch {
    // No existe, que es lo que queremos.
  }

  await mkdir(path.dirname(ruta), { recursive: true });
  await writeFile(ruta, frontmatter(tipo, titulo) + PLANTILLAS[tipo]);

  console.log(
    `  ✓  ${path.relative(process.cwd(), ruta)}\n\n` +
      `  Nace privado: se ingesta pero no aparece en la web ni el asistente lo cita.\n` +
      `  Cuando esté listo, cambia "visibilidad: private" por "public" y ejecuta:\n\n` +
      `      npm run ingest\n`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exitCode = 1;
});
