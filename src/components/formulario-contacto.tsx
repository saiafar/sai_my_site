'use client';

import { useState } from 'react';

/**
 * Formulario de contacto.
 *
 * El sitio no publica ninguna dirección de correo: los mensajes se guardan en
 * la base de datos. La consecuencia para quien escribe es que necesita saber
 * que su mensaje ha llegado, así que el estado de envío es explícito y el
 * formulario no se limpia hasta que el servidor confirma.
 *
 * El campo trampa está oculto para la vista y para los lectores de pantalla, y
 * marcado como no autocompletable: una persona no puede rellenarlo sin querer.
 */
const MAX_MENSAJE = 2_000;

type Estado = 'inactivo' | 'enviando' | 'enviado';

export function FormularioContacto() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [trampa, setTrampa] = useState('');
  const [estado, setEstado] = useState<Estado>('inactivo');
  const [error, setError] = useState<string | null>(null);

  async function enviar(): Promise<void> {
    if (estado === 'enviando') return;
    setEstado('enviando');
    setError(null);

    try {
      const peticion = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje, trampa }),
      });
      const datos = (await peticion.json()) as { ok?: boolean; error?: string };

      if (!peticion.ok || datos.error) {
        setError(datos.error ?? 'No se ha podido enviar el mensaje.');
        setEstado('inactivo');
        return;
      }

      setEstado('enviado');
      setNombre('');
      setEmail('');
      setMensaje('');
    } catch {
      setError('No se ha podido enviar el mensaje. Comprueba tu conexión.');
      setEstado('inactivo');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="rounded-xl border border-line-strong bg-surface-raised/60 p-6 text-center">
        <p className="text-[15px] text-ink">Mensaje enviado.</p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          Te responderé al correo que has indicado.
        </p>
        <button
          type="button"
          onClick={() => setEstado('inactivo')}
          className="mt-4 text-[12px] text-ink-faint underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          Escribir otro mensaje
        </button>
      </div>
    );
  }

  const campo =
    'w-full rounded-xl border border-line-strong bg-surface-raised/80 px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none';

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        void enviar();
      }}
      className="space-y-3"
      noValidate
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="contacto-nombre" className="sr-only">
            Tu nombre
          </label>
          <input
            id="contacto-nombre"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
            maxLength={80}
            required
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="contacto-email" className="sr-only">
            Tu correo electrónico
          </label>
          <input
            id="contacto-email"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            placeholder="Tu correo electrónico"
            autoComplete="email"
            maxLength={254}
            required
            className={campo}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contacto-mensaje" className="sr-only">
          Mensaje
        </label>
        <textarea
          id="contacto-mensaje"
          value={mensaje}
          onChange={(evento) => setMensaje(evento.target.value)}
          placeholder="Cuéntame en qué estás pensando: una vacante, un proyecto o una consulta técnica."
          rows={5}
          maxLength={MAX_MENSAJE}
          required
          className={`${campo} resize-y`}
        />
      </div>

      {/* Campo trampa. aria-hidden y tabIndex lo mantienen fuera del recorrido
          de teclado y de los lectores de pantalla. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="contacto-web">No rellenar</label>
        <input
          id="contacto-web"
          name="web"
          tabIndex={-1}
          autoComplete="off"
          value={trampa}
          onChange={(evento) => setTrampa(evento.target.value)}
        />
      </div>

      {error ? (
        <p role="alert" className="text-[13px] text-accent">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="max-w-sm text-[11px] leading-relaxed text-ink-faint">
          Tu nombre, tu correo y tu mensaje se guardan en la base de datos de este
          sitio, alojada en un servidor propio, y se usan únicamente para
          responderte. No se ceden a nadie.
        </p>

        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="rounded-lg border border-line-strong px-4 py-2 text-[13px] text-ink transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
        >
          {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </div>
    </form>
  );
}
