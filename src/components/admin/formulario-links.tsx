'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ConfiguracionLinks, EnlaceAdicional } from '@/lib/site/links';

interface Props {
  inicial: ConfiguracionLinks;
}

type Aviso = { tono: 'bien' | 'mal'; texto: string } | null;

export function FormularioLinks({ inicial }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState<ConfiguracionLinks>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);

  const actualizarCampo = <K extends keyof ConfiguracionLinks>(campo: K, valor: ConfiguracionLinks[K]) => {
    setConfig((prev) => ({ ...prev, [campo]: valor }));
  };

  const agregarEnlaceExtra = () => {
    const nuevo: EnlaceAdicional = {
      id: crypto.randomUUID(),
      titulo: '',
      url: '',
      subtitulo: '',
      icono: 'otro',
      activo: true,
    };
    setConfig((prev) => ({
      ...prev,
      enlacesExtra: [...prev.enlacesExtra, nuevo],
    }));
  };

  const actualizarEnlaceExtra = (id: string, campo: keyof EnlaceAdicional, valor: unknown) => {
    setConfig((prev) => ({
      ...prev,
      enlacesExtra: prev.enlacesExtra.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)),
    }));
  };

  const eliminarEnlaceExtra = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      enlacesExtra: prev.enlacesExtra.filter((e) => e.id !== id),
    }));
  };

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setAviso(null);

    try {
      const res = await fetch('/api/admin/links', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setAviso({ tono: 'bien', texto: 'Configuración de enlaces guardada con éxito.' });
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setAviso({
          tono: 'mal',
          texto: errorData.error || 'No se pudo guardar la configuración.',
        });
      }
    } catch {
      setAviso({ tono: 'mal', texto: 'Error de conexión con el servidor.' });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-8">
      {/* Sección 1: Datos principales del perfil */}
      <div className="border border-line bg-surface p-6">
        <h2 className="text-[14px] font-medium text-ink">Cabecera del perfil</h2>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          Nombre y subtítulo que encabezan la página rafaiasvillan.com/links.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="block text-[12px] text-ink-faint">
              Nombre a mostrar
            </label>
            <input
              id="nombre"
              type="text"
              value={config.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              placeholder="Rafaías Villán"
              className="mt-1.5 w-full border border-line bg-ground px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
            />
          </div>

          <div>
            <label htmlFor="titular" className="block text-[12px] text-ink-faint">
              Titular / Especialidad
            </label>
            <input
              id="titular"
              type="text"
              value={config.titular}
              onChange={(e) => actualizarCampo('titular', e.target.value)}
              placeholder="Desarrollo backend, datos e IA"
              className="mt-1.5 w-full border border-line bg-ground px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Enlaces e información de contacto requerida */}
      <div className="border border-line bg-surface p-6">
        <h2 className="text-[14px] font-medium text-ink">Enlaces principales y contacto</h2>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          Estos datos se muestran como botones principales y tarjetas de contacto directo en la página.
        </p>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ubicacion" className="block text-[12px] text-ink-faint">
                Ubicación
              </label>
              <div className="relative mt-1.5">
                <input
                  id="ubicacion"
                  type="text"
                  value={config.ubicacion}
                  onChange={(e) => actualizarCampo('ubicacion', e.target.value)}
                  placeholder="A Coruña, España"
                  className="w-full border border-line bg-ground px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-faint">Se muestra bajo el titular con icono de ubicación.</p>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-[12px] text-ink-faint">
                Teléfono
              </label>
              <input
                id="telefono"
                type="text"
                value={config.telefono}
                onChange={(e) => actualizarCampo('telefono', e.target.value)}
                placeholder="+34 665078084"
                className="mt-1.5 w-full border border-line bg-ground px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
              />
              <p className="mt-1 text-[11px] text-ink-faint">Enlace de llamada tel: y WhatsApp directo.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-[12px] text-ink-faint">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={config.email}
                onChange={(e) => actualizarCampo('email', e.target.value)}
                placeholder="rafaiasvillan@gmail.com"
                className="mt-1.5 w-full border border-line bg-ground px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
              />
            </div>

            <div>
              <label htmlFor="web" className="block text-[12px] text-ink-faint">
                Sitio Web
              </label>
              <input
                id="web"
                type="url"
                value={config.web}
                onChange={(e) => actualizarCampo('web', e.target.value)}
                placeholder="https://rafaiasvillan.com/"
                className="mt-1.5 w-full border border-line bg-ground px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="linkedin" className="block text-[12px] text-ink-faint">
                LinkedIn
              </label>
              <input
                id="linkedin"
                type="url"
                value={config.linkedin}
                onChange={(e) => actualizarCampo('linkedin', e.target.value)}
                placeholder="https://www.linkedin.com/in/rafaiasvillan"
                className="mt-1.5 w-full border border-line bg-ground px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
              />
            </div>

            <div>
              <label htmlFor="behance" className="block text-[12px] text-ink-faint">
                Behance
              </label>
              <input
                id="behance"
                type="url"
                value={config.behance}
                onChange={(e) => actualizarCampo('behance', e.target.value)}
                placeholder="https://www.behance.net/rafaiasvillan"
                className="mt-1.5 w-full border border-line bg-ground px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cvTitulo" className="block text-[12px] text-ink-faint">
                Título del CV (para descarga)
              </label>
              <input
                id="cvTitulo"
                type="text"
                value={config.cvTitulo ?? ''}
                onChange={(e) => actualizarCampo('cvTitulo', e.target.value)}
                placeholder="CV PDF Rafaias Villan Desarrollador"
                className="mt-1.5 w-full border border-line bg-ground px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
              />
              <p className="mt-1 text-[11px] text-ink-faint">Texto mostrado en la tarjeta de descarga del currículum.</p>
            </div>

            <div>
              <label htmlFor="cvUrl" className="block text-[12px] text-ink-faint">
                Ruta / URL del archivo PDF del CV
              </label>
              <input
                id="cvUrl"
                type="text"
                value={config.cvUrl ?? ''}
                onChange={(e) => actualizarCampo('cvUrl', e.target.value)}
                placeholder="/cv-rafaias-villan-desarrollador.pdf"
                className="mt-1.5 w-full border border-line bg-ground px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-line-strong"
              />
              <p className="mt-1 text-[11px] text-ink-faint">Por defecto: /cv-rafaias-villan-desarrollador.pdf (en el servidor).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 3: Enlaces adicionales opcionales */}
      <div className="border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-medium text-ink">Enlaces adicionales (opcional)</h2>
            <p className="mt-0.5 text-[12px] text-ink-faint">
              Añade enlaces extra a proyectos, GitHub, portafolios específicos o agendas.
            </p>
          </div>
          <button
            type="button"
            onClick={agregarEnlaceExtra}
            className="border border-line bg-surface-raised px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            + Añadir enlace
          </button>
        </div>

        {config.enlacesExtra.length === 0 ? (
          <p className="mt-4 text-[12px] italic text-ink-faint">No hay enlaces adicionales configurados.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {config.enlacesExtra.map((extra) => (
              <div
                key={extra.id}
                className="flex flex-col gap-3 rounded border border-line bg-ground p-3.5 sm:flex-row sm:items-center"
              >
                <div className="flex-1 grid gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    value={extra.titulo}
                    onChange={(e) => actualizarEnlaceExtra(extra.id, 'titulo', e.target.value)}
                    placeholder="Título (ej: GitHub)"
                    className="border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-line-strong"
                  />
                  <input
                    type="url"
                    value={extra.url}
                    onChange={(e) => actualizarEnlaceExtra(extra.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="border border-line bg-surface px-2.5 py-1.5 font-mono text-[12px] text-ink outline-none focus:border-line-strong"
                  />
                  <input
                    type="text"
                    value={extra.subtitulo || ''}
                    onChange={(e) => actualizarEnlaceExtra(extra.id, 'subtitulo', e.target.value)}
                    placeholder="Subtítulo opcional"
                    className="border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-line-strong"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <input
                      type="checkbox"
                      checked={extra.activo}
                      onChange={(e) => actualizarEnlaceExtra(extra.id, 'activo', e.target.checked)}
                      className="accent-accent"
                    />
                    Activo
                  </label>

                  <button
                    type="button"
                    onClick={() => eliminarEnlaceExtra(extra.id)}
                    className="text-[12px] text-ink-faint transition-colors hover:text-accent"
                    title="Eliminar enlace"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {aviso && (
        <p className={`text-[12px] ${aviso.tono === 'bien' ? 'text-ink-muted' : 'text-accent'}`}>
          {aviso.texto}
        </p>
      )}

      {/* Botón de guardar */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={guardando}
          className="bg-accent px-5 py-2 text-[13px] font-medium text-ground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {guardando ? 'Guardando cambios…' : 'Guardar enlaces'}
        </button>

        <a
          href="/links"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-line px-4 py-2 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          Ver página pública ↗
        </a>
      </div>
    </form>
  );
}
