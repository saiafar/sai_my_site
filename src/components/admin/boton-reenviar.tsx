'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Reintenta la entrega de un mensaje a N8N.
 *
 * Tras un reintento correcto se refresca la página en lugar de tachar la fila
 * en el cliente: el estado real lo tiene la base de datos, y duplicarlo aquí
 * abre la puerta a que el panel muestre como entregado algo que no lo está.
 */
export function BotonReenviar({ id }: { id: number }) {
  const router = useRouter();
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'error'>('listo');
  const [error, setError] = useState<string | null>(null);

  async function reenviar(): Promise<void> {
    setEstado('enviando');
    setError(null);

    try {
      const respuesta = await fetch('/api/admin/reenviar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const datos = (await respuesta.json().catch(() => ({}))) as {
        entregado?: boolean;
        error?: string;
      };

      if (datos.entregado) {
        router.refresh();
        return;
      }
      setEstado('error');
      setError(datos.error ?? 'No se ha podido entregar.');
    } catch {
      setEstado('error');
      setError('No se ha podido conectar.');
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={reenviar}
        disabled={estado === 'enviando'}
        className="border border-line px-2 py-0.5 text-[11px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Reintentar'}
      </button>
      {error ? <span className="text-[11px] text-accent">{error}</span> : null}
    </span>
  );
}
