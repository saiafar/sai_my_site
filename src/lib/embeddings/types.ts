/**
 * Contrato de vectorización, separado de su implementación.
 *
 * La distinción entre `embedPassages` y `embedQuery` no es adorno: los modelos
 * de la familia e5 se entrenaron con prefijos asimétricos ("query:" y
 * "passage:") y vectorizar una pregunta como si fuera un documento degrada la
 * recuperación de forma apreciable. Un contrato con un único método `embed()`
 * invitaría precisamente a ese error.
 */
export interface EmbeddingProvider {
  /** Identificador del modelo, que se guarda junto a cada vector. */
  readonly id: string;
  readonly dimensions: number;
  embedPassages(texts: readonly string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}
