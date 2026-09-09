/** Normaliza un texto libre a un slug estable: minúsculas, sin acentos, con guiones. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // marcas diacríticas combinantes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
