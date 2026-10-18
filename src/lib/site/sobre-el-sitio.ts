/**
 * Preguntas sobre el sitio, no sobre la trayectoria.
 *
 * Son dos cosas distintas y por eso viven en dos sitios distintos. Las de
 * `contenido/preguntas.md` las responde el corpus —qué ha hecho, con qué— y se
 * generan a partir de él. Estas tres responden cómo funciona lo que el visitante
 * está usando, y las escribe quien lo construyó: no salen del corpus, y meterlas
 * en él haría que el asistente citase explicaciones de sí mismo.
 *
 * Son pocas a propósito. Es la duda razonable de alguien que acaba de leer que
 * un asistente responde sobre una persona: de dónde sale esto, puede
 * inventárselo, y qué hay debajo.
 */
import type { Lang } from '../i18n';

export interface PreguntaSitio {
  pregunta: string;
  respuesta: string;
}

const PREGUNTAS: Record<Lang, PreguntaSitio[]> = {
  es: [
    {
      pregunta: '¿De dónde salen las respuestas del asistente?',
      respuesta:
        'De una base de conocimiento propia escrita en Markdown, troceada por secciones y convertida en vectores que se almacenan en PostgreSQL con pgvector. Cada respuesta cita los fragmentos concretos en los que se apoya, y si la documentación no cubre la pregunta el asistente lo dice en lugar de improvisar.',
    },
    {
      pregunta: '¿Puede inventarse cosas sobre mi experiencia?',
      respuesta:
        'El modelo solo recibe los fragmentos recuperados y tiene prohibido completar con conocimiento general. Cada afirmación va marcada con la fuente que la respalda, así que cualquier dato es verificable pulsando la cita.',
    },
    {
      pregunta: '¿Qué tecnología hay detrás?',
      respuesta:
        'Next.js sobre Node, PostgreSQL 17 con pgvector para la búsqueda híbrida (vectorial y full-text fusionadas con Reciprocal Rank Fusion), embeddings generados en local con ONNX y un proveedor externo solo para redactar la respuesta. Todo en contenedores Docker sobre un servidor propio.',
    },
  ],
  en: [
    {
      pregunta: 'Where do the assistant’s answers come from?',
      respuesta:
        'From a curated Markdown knowledge base, split into semantic sections and vectorized in PostgreSQL with pgvector. Each response cites the exact chunks it relies upon, and if the documentation does not cover the question, the assistant admits it instead of improvising.',
    },
    {
      pregunta: 'Can it hallucinate details about experience?',
      respuesta:
        'The model only receives retrieved chunks and is explicitly forbidden from using general knowledge. Every statement is flagged with the backing source marker, making every detail verifiable by clicking the citation.',
    },
    {
      pregunta: 'What technology powers this website?',
      respuesta:
        'Next.js on Node, PostgreSQL 17 with pgvector for hybrid search (vector + full-text combined via Reciprocal Rank Fusion), quantized local embeddings via ONNX, and Google Gemini strictly for answer generation. Everything runs in Docker on a self-hosted server.',
    },
  ],
};

export function getPreguntasSitio(lang: Lang = 'es'): PreguntaSitio[] {
  return PREGUNTAS[lang] ?? PREGUNTAS.es;
}
