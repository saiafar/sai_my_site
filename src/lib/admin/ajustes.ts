/**
 * Ajustes editables desde el panel.
 *
 * Lo que vive aquí y no en una variable de entorno es lo que cambia sin cambiar
 * el código: hoy, la URL del webhook de N8N al que se reenvían los mensajes de
 * contacto. Reorganizar un flujo en N8N no debería obligar a redesplegar el
 * sitio.
 *
 * Lo que sigue en el entorno es lo que no puede estar en la base de datos sin
 * una pescadilla que se muerde la cola —la cadena de conexión— y las
 * credenciales que no tiene sentido poder editar desde una pantalla web.
 */
import { query } from '../db/index.ts';

/** Claves conocidas. Tipadas para que un error de escritura no compile. */
export type ClaveAjuste = 'contacto.webhook_url' | 'contacto.webhook_secret';

interface FilaAjuste {
  key: ClaveAjuste;
  value: unknown;
}

/**
 * Caché muy corta en memoria del proceso.
 *
 * Cada envío del formulario necesita la URL del webhook, y consultarla en la
 * base de datos cada vez es una ida y vuelta que no aporta nada: el valor cambia
 * como mucho una vez al mes. Diez segundos es suficiente para que un cambio
 * hecho en el panel se note enseguida y para que una ráfaga de envíos no repita
 * la misma consulta.
 */
const CACHE_MS = 10_000;
let cache: { valores: Map<string, unknown>; hasta: number } | undefined;

async function cargar(): Promise<Map<string, unknown>> {
  if (cache && cache.hasta > Date.now()) return cache.valores;

  const filas = await query<FilaAjuste>('select key, value from site_settings');
  const valores = new Map<string, unknown>(filas.map((f) => [f.key, f.value]));
  cache = { valores, hasta: Date.now() + CACHE_MS };
  return valores;
}

/** Valor de texto de un ajuste, o cadena vacía si no está configurado. */
export async function leerAjusteTexto(clave: ClaveAjuste): Promise<string> {
  const valor = (await cargar()).get(clave);
  return typeof valor === 'string' ? valor : '';
}

/** Todos los ajustes de texto conocidos, para pintar el formulario del panel. */
export async function leerAjustes(): Promise<Record<ClaveAjuste, string>> {
  const valores = await cargar();
  const texto = (clave: ClaveAjuste): string => {
    const valor = valores.get(clave);
    return typeof valor === 'string' ? valor : '';
  };
  return {
    'contacto.webhook_url': texto('contacto.webhook_url'),
    'contacto.webhook_secret': texto('contacto.webhook_secret'),
  };
}

export async function guardarAjuste(clave: ClaveAjuste, valor: string): Promise<void> {
  await query(
    `insert into site_settings (key, value)
     values ($1, to_jsonb($2::text))
     on conflict (key)
       do update set value = excluded.value, updated_at = now()`,
    [clave, valor],
  );
  // Invalidar en vez de actualizar la entrada: si hay varios procesos, ninguno
  // puede fiarse de lo que tiene en memoria después de una escritura.
  cache = undefined;
}
