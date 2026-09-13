/**
 * Recepción de mensajes de contacto.
 *
 * El sitio no publica ninguna dirección de correo, así que este formulario es
 * la única vía de contacto y, por tanto, la única superficie que hay que
 * proteger. Tres defensas, de la más barata a la más cara:
 *
 *  1. Un campo trampa que una persona nunca ve ni rellena. La mayoría de los
 *     robots que recorren formularios rellenan todos los campos que encuentran.
 *  2. Validación de forma y longitud, que descarta lo evidente sin tocar la
 *     base de datos.
 *  3. Límite por visitante y hora, compartido con el del asistente pero con su
 *     propio cubo y un tope mucho más bajo: escribir cinco mensajes en una hora
 *     no es un uso legítimo.
 */
import { query } from '../db/index.ts';
import { checkRateLimit } from '../rag/limits.ts';

export const MAX_NOMBRE = 80;
export const MAX_MENSAJE = 2_000;

/** Envíos por hora y visitante. */
const LIMITE_POR_HORA = 5;

export interface MensajeEntrante {
  nombre: string;
  email: string;
  mensaje: string;
  /** Campo trampa: si llega con contenido, quien escribe no es una persona. */
  trampa?: string | undefined;
}

export type ResultadoContacto =
  | { ok: true }
  | { ok: false; motivo: string; estado: number };

/**
 * Validación de correo deliberadamente laxa.
 *
 * Cualquier expresión regular estricta rechaza direcciones válidas —las reglas
 * reales del formato son mucho más permisivas de lo que la gente cree— y no
 * evita que alguien escriba una dirección que existe pero no es suya. Solo se
 * comprueba que tenga la forma mínima; la verdad sobre una dirección solo la da
 * enviarle un correo.
 */
function pareceCorreo(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
}

export async function recibirMensaje(
  entrada: MensajeEntrante,
  contexto: { clientKey: string; userAgent?: string | undefined },
): Promise<ResultadoContacto> {
  // El robot recibe un éxito: decirle que ha fallado solo le enseña a evitar la
  // trampa la próxima vez.
  if (entrada.trampa && entrada.trampa.trim() !== '') return { ok: true };

  const nombre = entrada.nombre.trim();
  const email = entrada.email.trim();
  const mensaje = entrada.mensaje.trim();

  if (nombre.length < 2 || nombre.length > MAX_NOMBRE) {
    return { ok: false, motivo: 'Indica tu nombre.', estado: 400 };
  }
  if (!pareceCorreo(email) || email.length > 254) {
    return { ok: false, motivo: 'Revisa la dirección de correo.', estado: 400 };
  }
  if (mensaje.length < 10) {
    return { ok: false, motivo: 'Escribe un mensaje algo más largo.', estado: 400 };
  }
  if (mensaje.length > MAX_MENSAJE) {
    return {
      ok: false,
      motivo: `El mensaje no puede superar los ${MAX_MENSAJE} caracteres.`,
      estado: 400,
    };
  }

  // Cubo propio: un visitante puede preguntar mucho al asistente y aun así
  // tener derecho a escribir, y al revés.
  const limite = await checkRateLimit(`contacto:${contexto.clientKey}`, LIMITE_POR_HORA);
  if (!limite.allowed) {
    return { ok: false, motivo: limite.reason ?? 'Demasiados envíos.', estado: 429 };
  }

  await query(
    `insert into contact_messages (name, email, message, client_key, user_agent)
     values ($1, $2, $3, $4, $5)`,
    [nombre, email, mensaje, contexto.clientKey, contexto.userAgent ?? null],
  );

  return { ok: true };
}
