/**
 * Conversación con el asistente desde la terminal.
 *
 * Ejercita el pipeline completo —validación, límite, caché, presupuesto,
 * recuperación, generación, registro— sin servidor ni frontend. Sin
 * GEMINI_API_KEY usa el proveedor simulado, de modo que todo el camino se puede
 * validar sin clave y sin coste.
 *
 *   npm run chat -- "¿qué experiencia tiene con PostgreSQL?"
 *   npm run chat                    (modo interactivo)
 */
import { createInterface } from 'node:readline/promises';
import { closePool } from '../src/lib/db/index.ts';
import { providerIsReal } from '../src/lib/llm/index.ts';
import { answerQuestion, type AnswerResult } from '../src/lib/rag/answer.ts';
import { monthlySpendUsd } from '../src/lib/rag/limits.ts';
import { env } from '../src/lib/env.ts';

const CLIENT_KEY = 'cli-local';

function render(result: AnswerResult): void {
  console.log(`\n${result.answer}\n`);

  if (result.sources.length > 0) {
    console.log('  Fuentes:');
    for (const source of result.sources) {
      const section = source.section ? ` › ${source.section}` : '';
      console.log(`    [${source.marker}] ${source.title}${section}   (${source.slug})`);
    }
    console.log();
  }

  const cost = result.usage.costUsd > 0 ? `  ${result.usage.costUsd.toFixed(5)} $` : '';
  const cache = result.cached ? '  · desde caché' : '';
  console.log(
    `  ${result.model}  ·  ${result.usage.inputTokens}→${result.usage.outputTokens} tokens` +
      `  ·  ${result.latencyMs} ms${cost}${cache}\n`,
  );
}

async function main(): Promise<void> {
  const langIndex = process.argv.indexOf('--lang');
  const lang: 'es' | 'en' =
    langIndex !== -1 && process.argv[langIndex + 1] === 'en' ? 'en' : 'es';
  const args = process.argv.slice(2).filter((arg, i, arr) => arg !== '--lang' && arr[i - 1] !== '--lang');
  const question = args.join(' ').trim();

  if (!providerIsReal()) {
    console.log(
      '\n  Sin GEMINI_API_KEY: se usa el proveedor simulado.\n' +
        '  La recuperación y las fuentes son reales; el texto de la respuesta no.\n',
    );
  } else {
    const spent = await monthlySpendUsd();
    console.log(
      `\n  Modelo ${env.geminiModel} [${lang}]  ·  gasto del mes: ` +
        `${spent.toFixed(4)} $ de ${env.monthlyBudgetUsd} $\n`,
    );
  }

  if (question) {
    render(await answerQuestion(question, { clientKey: CLIENT_KEY, lang }));
    return;
  }

  // Modo interactivo: mantiene la conversación para que los turnos queden
  // agrupados en la misma fila de `conversations`.
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let conversationId: string | undefined;

  console.log(`  [${lang}] Escribe tu pregunta. Línea vacía o Ctrl-C para salir.\n`);
  for (;;) {
    const input = (await rl.question('  > ')).trim();
    if (!input) break;
    const result = await answerQuestion(input, {
      clientKey: CLIENT_KEY,
      lang,
      ...(conversationId ? { conversationId } : {}),
    });
    render(result);
  }
  rl.close();
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(closePool);
