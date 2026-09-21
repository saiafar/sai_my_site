import { es } from './dictionaries/es.ts';
import { en } from './dictionaries/en.ts';
import type { Dictionary, Lang } from './types.ts';

export * from './types.ts';

export const DEFAULT_LANG: Lang = 'es';
export const SUPPORTED_LANGS: readonly Lang[] = ['es', 'en'] as const;

const DICTIONARIES: Record<Lang, Dictionary> = { es, en };

export function isValidLang(value: unknown): value is Lang {
  return typeof value === 'string' && (value === 'es' || value === 'en');
}

export function getDictionary(lang: unknown): Dictionary {
  if (isValidLang(lang)) return DICTIONARIES[lang];
  return DICTIONARIES[DEFAULT_LANG];
}
