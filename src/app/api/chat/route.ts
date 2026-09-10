/**
 * Endpoint del asistente.
 *
 * Deliberadamente fino. Toda la lógica —validación, límite por visitante,
 * caché, presupuesto, recuperación, generación y registro— vive en
 * answerQuestion(), que no sabe nada de HTTP. Esta función solo traduce entre
 * una petición web y esa llamada, lo que permite ejercitar el pipeline entero
 * desde el CLI sin levantar un servidor.
 */
import { NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/rag/answer';
import { clientKeyFrom } from '@/lib/rag/limits';

// El modelo de embeddings carga binarios nativos de ONNX: necesita Node, no el
// runtime Edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatBody {
  question?: unknown;
  conversationId?: unknown;
}

/**
 * Identifica al visitante detrás de Traefik.
 *
 * x-forwarded-for puede traer una cadena de proxies; el primer elemento es el
 * cliente original. Se toma solo ese y nunca se almacena: clientKeyFrom lo
 * convierte en un hash con sal, de modo que se puede contar cuántas preguntas
 * lleva alguien sin guardar quién es.
 */
function clientKeyOf(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const real = request.headers.get('x-real-ip') ?? '';
  const ip = (forwarded.split(',')[0] ?? '').trim() || real.trim() || 'desconocido';
  return clientKeyFrom(ip, request.headers.get('user-agent') ?? '');
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición no válido.' }, { status: 400 });
  }

  const question = typeof body.question === 'string' ? body.question : '';
  const conversationId = typeof body.conversationId === 'string' ? body.conversationId : undefined;

  if (!question.trim()) {
    return NextResponse.json({ error: 'Falta la pregunta.' }, { status: 400 });
  }

  const userAgent = request.headers.get('user-agent') ?? '';

  try {
    const result = await answerQuestion(question, {
      clientKey: clientKeyOf(request),
      ...(conversationId ? { conversationId } : {}),
      ...(userAgent ? { userAgent } : {}),
    });

    return NextResponse.json(
      {
        answer: result.answer,
        sources: result.sources,
        cached: result.cached,
        latencyMs: result.latencyMs,
        refused: Boolean(result.refusalReason),
      },
      // Un rechazo por exceso de peticiones es un 429; el resto de rechazos
      // (pregunta inválida, presupuesto agotado) son respuestas legítimas con
      // contenido, no errores de la petición.
      { status: result.refusalReason?.includes('peticiones') ? 429 : 200 },
    );
  } catch (error) {
    // El detalle se registra en el servidor; al visitante se le da un mensaje
    // que no expone la estructura interna del sistema.
    console.error('[api/chat]', error);
    return NextResponse.json(
      { error: 'El asistente no está disponible en este momento.' },
      { status: 503 },
    );
  }
}
