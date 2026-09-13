'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function FormularioEntrada() {
  const router = useRouter();
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      const respuesta = await fetch('/api/admin/entrar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contrasena }),
      });

      if (!respuesta.ok) {
        const datos = (await respuesta.json().catch(() => ({}))) as { error?: string };
        setError(datos.error ?? 'No se ha podido entrar.');
        setEnviando(false);
        return;
      }

      // refresh() además de push(): la cookie acaba de cambiar y sin esto el
      // router podría servir la versión en caché de /admin, que es la
      // redirección de vuelta aquí.
      router.push('/admin');
      router.refresh();
    } catch {
      setError('No se ha podido conectar.');
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="contrasena" className="block text-[12px] text-ink-faint">
          Contraseña
        </label>
        <input
          id="contrasena"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="mt-1.5 w-full border border-line bg-surface px-3 py-2 text-[14px] text-ink outline-none transition-colors focus:border-line-strong"
        />
      </div>

      {error ? <p className="text-[12px] text-accent">{error}</p> : null}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-accent px-3 py-2 text-[13px] text-ground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enviando ? 'Comprobando…' : 'Entrar'}
      </button>
    </form>
  );
}
