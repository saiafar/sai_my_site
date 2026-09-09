/**
 * Interroga la base de conocimiento desde la terminal.
 *
 * Existe para poder juzgar la calidad de la recuperación sin frontend, sin API
 * y sin gastar un céntimo en el modelo de generación. Si el fragmento correcto
 * no aparece aquí, ningún LLM lo va a arreglar después: no puede citar lo que
 * no ha recibido. Es la herramienta con la que se afina el troceado.
 *
 * Uso:
 *   npm run ask -- "¿qué proyectos ha hecho con PostgreSQL?"
 *   npm run ask -- "..." --k 5 --full
 */
import { closePool } from '../src/lib/db/index.ts';
import { citationOf, retrieve } from '../src/lib/rag/retrieve.ts';

const args = process.argv.slice(2);
const showFull = args.includes('--full');
const kIndex = args.indexOf('--k');
const matchCount = kIndex >= 0 ? Number(args[kIndex + 1]) : 6;
const question = args.filter((a, i) => !a.startsWith('--') && i !== kIndex + 1).join(' ').trim();

async function main(): Promise<void> {
  if (!question) {
    console.error('Uso: npm run ask -- "tu pregunta"  [--k 6] [--full]');
    process.exitCode = 1;
    return;
  }

  const started = Date.now();
  const results = await retrieve(question, { matchCount });
  const elapsed = Date.now() - started;

  console.log(`\n  ${question}`);
  console.log(`  ${results.length} fragmento(s) en ${elapsed} ms\n`);

  if (results.length === 0) {
    console.log('  Sin resultados. Si el corpus no está vacío, revisa que los documentos');
    console.log('  sean "visibility: public" y que la ingestión haya generado embeddings.\n');
    return;
  }

  results.forEach((chunk, index) => {
    // v = posición en el ranking vectorial, t = en el full-text.
    // Un fragmento que aparece en ambos es una coincidencia sólida; uno que
    // solo aparece en uno indica de qué mitad de la búsqueda depende la
    // respuesta, que es justo lo que hay que saber al afinar el corpus.
    const v = chunk.vectorRank ?? '–';
    const t = chunk.textRank ?? '–';
    console.log(
      `  ${String(index + 1).padStart(2)}. [${chunk.score.toFixed(4)}]  v:${String(v).padStart(2)}  t:${String(t).padStart(2)}   ${citationOf(chunk)}`,
    );
    const text = showFull ? chunk.content : chunk.content.replace(/\s+/g, ' ').slice(0, 180) + '…';
    console.log(
      text.split('\n').map((line) => `        ${line}`).join('\n') + '\n',
    );
  });
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(closePool);
