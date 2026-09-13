/**
 * Reenvío de los mensajes de contacto a N8N.
 *
 * La regla que ordena todo este módulo: **el mensaje ya está guardado cuando
 * esto se ejecuta**. El webhook es una notificación, no la vía de entrega. Si
 * N8N está caído, la URL mal escrita o el flujo desactivado, el visitante recibe
 * su acuse de recibo igual y el mensaje espera en la base de datos con la marca
 * de no entregado, para reintentarlo desde el panel. Un formulario que depende
 * de que un servicio externo esté vivo pierde clientes sin enterarse.
 */
import { createHmac } from 'node:crypto';
import { query } from '../db/index.ts';
import { leerAjusteTexto } from '../admin/ajustes.ts';

/**
 * N8N está en la misma máquina, así que responde en milisegundos. El tope
 * existe para el caso contrario: un webhook que acepta la conexión y no
 * contesta dejaría al visitante mirando un indicador de carga indefinidamente.
 */
const TIMEOUT_MS = 5_000;

export interface ResultadoEntrega {
  entregado: boolean;
  /** Código HTTP devuelto por N8N, si llegó a responder. */
  estado?: number;
  error?: string;
}

export interface MensajeParaWebhook {
  id: number | null;
  nombre: string;
  email: string;
  mensaje: string;
  recibidoEn: string;
  /** true cuando lo manda el botón «probar» del panel y no una persona. */
  prueba?: boolean;
}

/**
 * Envía un cuerpo al webhook configurado, firmado.
 *
 * La firma va en una cabecera para que el flujo de N8N pueda comprobar que la
 * petición sale de este sitio. Una URL de webhook es un secreto débil: aparece
 * en registros, en el historial del navegador y en cualquier captura de
 * pantalla del panel. Con la firma, conocer la URL no basta para inyectar
 * mensajes falsos en la bandeja.
 */
export async function enviarAWebhook(mensaje: MensajeParaWebhook): Promise<ResultadoEntrega> {
  const url = await leerAjusteTexto('contacto.webhook_url');
  if (!url) return { entregado: false, error: 'No hay webhook configurado.' };

  const secreto = await leerAjusteTexto('contacto.webhook_secret');
  const cuerpo = JSON.stringify({ origen: 'rafaiasvillan.com', ...mensaje });

  const cabeceras: Record<string, string> = { 'content-type': 'application/json' };
  if (secreto) {
    cabeceras['x-firma'] = `sha256=${createHmac('sha256', secreto).update(cuerpo).digest('hex')}`;
  }

  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: cabeceras,
      body: cuerpo,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!respuesta.ok) {
      return {
        entregado: false,
        estado: respuesta.status,
        error: `El webhook respondió ${respuesta.status}.`,
      };
    }
    return { entregado: true, estado: respuesta.status };
  } catch (error) {
    // Incluye el timeout, el DNS que no resuelve y el certificado inválido.
    return {
      entregado: false,
      error: error instanceof Error ? error.message : 'Error desconocido.',
    };
  }
}

/**
 * Reenvía un mensaje ya guardado y anota el resultado en su fila.
 *
 * Se lee el mensaje de la base de datos en lugar de recibirlo por parámetro
 * para que el reintento desde el panel y el envío inicial recorran exactamente
 * el mismo camino: si divergieran, el reintento podría «arreglar» un mensaje que
 * en realidad nunca se mandó bien.
 */
export async function entregarMensaje(id: number): Promise<ResultadoEntrega> {
  const filas = await query<{
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: Date;
  }>(
    'select id, name, email, message, created_at from contact_messages where id = $1',
    [id],
  );

  const fila = filas[0];
  if (!fila) return { entregado: false, error: 'El mensaje no existe.' };

  const resultado = await enviarAWebhook({
    id: Number(fila.id),
    nombre: fila.name,
    email: fila.email,
    mensaje: fila.message,
    recibidoEn: fila.created_at.toISOString(),
  });

  await query(
    `update contact_messages
        set delivered_at   = case when $2 then now() else delivered_at end,
            delivery_error = $3,
            delivery_tries = delivery_tries + 1
      where id = $1`,
    [id, resultado.entregado, resultado.entregado ? null : (resultado.error ?? 'Error.')],
  );

  return resultado;
}
