'use client';

import { useState } from 'react';

/**
 * Formulario de contacto.
 *
 * El mensaje se guarda en la base de datos propia y solo después se reenvía al
 * webhook, así que no se pierde aunque la automatización esté caída. La
 * consecuencia para quien escribe es que necesita saber que ha llegado: el
 * estado de envío es explícito y el formulario no se limpia hasta que el
 * servidor confirma.
 *
 * Al lado se publica la dirección de correo. No sobra: el formulario sirve para
 * que el mensaje quede registrado con lo que esa persona había mirado antes, y
 * el correo para quien prefiere escribir desde su propio buzón.
 *
 * El campo trampa está oculto para la vista y para los lectores de pantalla, y
 * marcado como no autocompletable: una persona no puede rellenarlo sin querer.
 */
import { getDictionary, type Lang } from '@/lib/i18n';

const MAX_MENSAJE = 2_000;

type Estado = 'inactivo' | 'enviando' | 'enviado';

export function FormularioContacto({ lang = 'es' }: { lang?: Lang }) {
  const dict = getDictionary(lang);
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
        setError(datos.error ?? dict.contactForm.errorGeneric);
        setEstado('inactivo');
        return;
      }

      setEstado('enviado');
      setNombre('');
      setEmail('');
      setMensaje('');
    } catch {
      setError(dict.contactForm.errorGeneric);
      setEstado('inactivo');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="rounded-bloque bg-crema p-8 text-center text-tinta sm:p-10">
        <p className="text-[22px] font-bold tracking-[-0.02em] sm:text-[28px]">
          ✓ {dict.contactForm.successTitle}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted sm:text-[17px]">
          {dict.contactForm.successDesc}
        </p>
        <button
          type="button"
          onClick={() => setEstado('inactivo')}
          className="mt-6 cursor-pointer rounded-full bg-tinta px-5 py-3 font-mono text-[13px] text-crema transition-colors hover:bg-noche-raised"
        >
          {dict.contactForm.sendAnother}
        </button>
      </div>
    );
  }

  // Los campos van en crema sobre la banda naranja: un campo de formulario
  // tiene que parecer hueco, y sobre naranja solo lo parece si es más claro.
  const campo =
    'w-full border border-tinta/20 bg-crema px-5 py-4 text-[16px] text-tinta placeholder:text-tinta/45 focus:border-tinta focus:outline-none';

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        void enviar();
      }}
      className="space-y-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contacto-nombre" className="sr-only">
            {dict.contactForm.name}
          </label>
          <input
            id="contacto-nombre"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            placeholder={dict.contactForm.namePlaceholder}
            autoComplete="name"
            maxLength={80}
            required
            className={`${campo} rounded-full`}
          />
        </div>

        <div>
          <label htmlFor="contacto-email" className="sr-only">
            {dict.contactForm.email}
          </label>
          <input
            id="contacto-email"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            placeholder={dict.contactForm.emailPlaceholder}
            autoComplete="email"
            maxLength={254}
            required
            className={`${campo} rounded-full`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contacto-mensaje" className="sr-only">
          {dict.contactForm.message}
        </label>
        <textarea
          id="contacto-mensaje"
          value={mensaje}
          onChange={(evento) => setMensaje(evento.target.value)}
          placeholder={dict.contactForm.messagePlaceholder}
          rows={5}
          maxLength={MAX_MENSAJE}
          required
          className={`${campo} resize-y rounded-tarjeta`}
        />
      </div>

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
        <p role="alert" className="font-mono text-[13px] font-bold text-tinta">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="max-w-sm font-mono text-[11px] leading-relaxed text-tinta/65">
          {dict.contactForm.privacy}
        </p>

        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-tinta px-6 py-4 font-mono text-[14px] font-bold text-crema transition-colors hover:bg-noche-raised disabled:pointer-events-none disabled:opacity-40"
        >
          <span>{estado === 'enviando' ? dict.contactForm.sending : dict.contactForm.submit}</span>
          {estado !== 'enviando' ? (
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          ) : null}
        </button>
      </div>
    </form>
  );
}
