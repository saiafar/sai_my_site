'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  webhookUrl: string;
  webhookSecret: string;
}

type Aviso = { tono: 'bien' | 'mal'; texto: string } | null;

/**
 * Configuración del destino del formulario de contacto.
 *
 * El botón de probar es la mitad del valor de esta pantalla: sin él, la única
 * forma de saber si la URL es correcta es esperar a que escriba alguien de
 * verdad y comprobar si llegó, que es exactamente cuando no quieres descubrir
 * que estaba mal.
 */
export function FormularioAjustes({ webhookUrl, webhookSecret }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState(webhookUrl);
  const [secreto, setSecreto] = useState(webhookSecret);
  const [ocupado, setOcupado] = useState<'guardar' | 'probar' | null>(null);
  const [aviso, setAviso] = useState<Aviso>(null);

  async function llamar(accion: 'guardar' | 'probar'): Promise<void> {
    setOcupado(accion);
    setAviso(null);

    try {
      const respuesta = await fetch('/api/admin/ajustes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          accion === 'probar'
            ? { accion: 'probar' }
            : { webhookUrl: url, webhookSecret: secreto },
        ),
      });
      const datos = (await respuesta.json().catch(() => ({}))) as {
        ok?: boolean;
        entregado?: boolean;
        estado?: number;
        error?: string;
      };

      if (accion === 'probar') {
        setAviso(
          datos.entregado
            ? { tono: 'bien', texto: `N8N respondió ${datos.estado ?? 200}. El flujo está conectado.` }
            : { tono: 'mal', texto: datos.error ?? 'No se ha podido entregar.' },
        );
      } else if (respuesta.ok) {
        setAviso({ tono: 'bien', texto: 'Guardado.' });
        // Para que «probar» use ya el valor recién guardado y no el anterior:
        // el servidor lee la URL de la base de datos, no de este formulario.
        router.refresh();
      } else {
        setAviso({ tono: 'mal', texto: datos.error ?? 'No se ha podido guardar.' });
      }
    } catch {
      setAviso({ tono: 'mal', texto: 'No se ha podido conectar.' });
    } finally {
      setOcupado(null);
    }
  }

  function generarSecreto(): void {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    setSecreto([...bytes].map((b) => b.toString(16).padStart(2, '0')).join(''));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void llamar('guardar');
      }}
      className="max-w-2xl space-y-6"
    >
      <div>
        <label htmlFor="url" className="block text-[12px] text-ink-faint">
          URL del webhook de N8N
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://n8n.ejemplo.com/webhook/contacto"
          className="mt-1.5 w-full border border-line bg-surface px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
          Déjalo vacío para desactivar el reenvío. Los mensajes se guardan aquí de todas formas:
          esto es un aviso a N8N, no la vía de entrega.
        </p>
      </div>

      <div>
        <label htmlFor="secreto" className="block text-[12px] text-ink-faint">
          Secreto de firma
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="secreto"
            type="text"
            value={secreto}
            onChange={(e) => setSecreto(e.target.value)}
            className="w-full border border-line bg-surface px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
          />
          <button
            type="button"
            onClick={generarSecreto}
            className="shrink-0 border border-line px-3 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Generar
          </button>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
          Cada envío lleva la cabecera <code className="text-ink-muted">x-firma</code> con el
          HMAC-SHA256 del cuerpo usando este secreto. Compruébalo en N8N: una URL de webhook acaba
          en registros y capturas de pantalla, así que conocerla no debería bastar para colar
          mensajes falsos.
        </p>
      </div>

      {aviso ? (
        <p className={`text-[12px] ${aviso.tono === 'bien' ? 'text-ink-muted' : 'text-accent'}`}>
          {aviso.texto}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={ocupado !== null}
          className="bg-accent px-4 py-2 text-[13px] text-ground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {ocupado === 'guardar' ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => void llamar('probar')}
          disabled={ocupado !== null}
          className="border border-line px-4 py-2 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50"
        >
          {ocupado === 'probar' ? 'Enviando…' : 'Enviar mensaje de prueba'}
        </button>
      </div>
    </form>
  );
}
