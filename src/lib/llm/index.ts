/**
 * Selección de proveedor.
 *
 * Sin GEMINI_API_KEY se usa el proveedor simulado en lugar de fallar. Es
 * deliberado: clonar el repositorio, migrar, ingestar y preguntar debe
 * funcionar sin registrarse en ningún servicio. Que el proyecto sea explorable
 * sin claves forma parte de lo que demuestra.
 */
import { env } from '../env.ts';
import { FakeProvider } from './fake.ts';
import { GeminiProvider } from './gemini.ts';
import type { LLMProvider } from './types.ts';

let instance: LLMProvider | undefined;

export function getLLMProvider(): LLMProvider {
  instance ??= process.env['GEMINI_API_KEY'] ? new GeminiProvider() : new FakeProvider();
  return instance;
}

export function providerIsReal(): boolean {
  return Boolean(process.env['GEMINI_API_KEY']);
}

export { env };
export type { LLMProvider };
