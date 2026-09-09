/**
 * Evaluación de la recuperación.
 *
 * Mide si el fragmento correcto llega al contexto del modelo. Es la métrica que
 * importa antes que ninguna otra, porque marca el techo de todo el sistema: un
 * LLM no puede citar lo que no ha recibido, así que ninguna mejora de prompt
 * compensa un recall bajo.
 *
 * Se mide sobre la recuperación y no sobre la respuesta generada a propósito:
 * es determinista, se ejecuta en segundos, no cuesta dinero y señala la causa
 * del fallo en vez del síntoma.
 *
 *   recall@k  — proporción de preguntas cuyo documento esperado está entre los
 *               k primeros resultados. Es la cifra que decide si el sistema
 *               puede funcionar.
 *   MRR       — media del inverso de la posición del primer acierto. Distingue
 *               entre acertar en el puesto 1 y acertar en el puesto 8, cosa que
 *               el recall no ve.
 *
 * Uso:
 *   npm run eval
 *   npm run eval -- --k 5 --verbose
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { closePool } from '../src/lib/db/index.ts';
import { retrieve } from '../src/lib/rag/retrieve.ts';

interface GoldenQuestion {
  pregunta: string;
  esperado: string[];
  seccion?: string;
  nota?: string;
}

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const kIndex = args.indexOf('--k');
const K = kIndex >= 0 ? Number(args[kIndex + 1]) : 5;

async function main(): Promise<void> {
  const raw = await readFile(path.join(process.cwd(), 'eval', 'questions.json'), 'utf8');
  const { preguntas } = JSON.parse(raw) as { preguntas: GoldenQuestion[] };

  const answerable = preguntas.filter((q) => q.esperado.length > 0);
  const unanswerable = preguntas.filter((q) => q.esperado.length === 0);

  let hits = 0;
  let reciprocalSum = 0;
  const failures: { pregunta: string; esperado: string[]; obtenido: string[] }[] = [];

  for (const question of answerable) {
    const results = await retrieve(question.pregunta, { matchCount: K });
    const slugs = results.map((r) => r.slug);
    const position = slugs.findIndex((slug) => question.esperado.includes(slug));

    if (position >= 0) {
      hits += 1;
      reciprocalSum += 1 / (position + 1);
      if (verbose) console.log(`  ✓  #${position + 1}  ${question.pregunta}`);
    } else {
      failures.push({ pregunta: question.pregunta, esperado: question.esperado, obtenido: slugs });
      console.log(`  ✗       ${question.pregunta}`);
    }
  }

  const total = answerable.length;
  console.log(`\n  recall@${K}  ${(hits / total).toFixed(3)}   (${hits}/${total})`);
  console.log(`  MRR        ${(reciprocalSum / total).toFixed(3)}`);

  if (failures.length && verbose) {
    console.log('\n  Fallos:');
    for (const failure of failures) {
      console.log(`    "${failure.pregunta}"`);
      console.log(`      esperaba: ${failure.esperado.join(', ')}`);
      console.log(`      obtuvo:   ${[...new Set(failure.obtenido)].join(', ') || '(nada)'}`);
    }
  }

  if (unanswerable.length) {
    console.log(
      `\n  ${unanswerable.length} pregunta(s) sin respuesta esperada: no puntúan aquí,` +
        `\n  se comprueban en la fase de generación (que el asistente admita no saberlo).`,
    );
  }

  // Umbral orientativo: por debajo de 0.8 el problema está en el corpus o en el
  // troceado, y afinar el prompt del modelo no lo va a arreglar.
  if (total > 0 && hits / total < 0.8) {
    console.log('\n  Recall por debajo de 0.8: revisa el troceado y la densidad del corpus');
    console.log('  antes de tocar nada de la generación.');
  }
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(closePool);
