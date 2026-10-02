'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ConfiguracionLinks } from '@/lib/site/links';

interface Props {
  config: ConfiguracionLinks;
  siteUrl: string;
}

export function VistaLinks({ config, siteUrl }: Props) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const [mostrarModalQr, setMostrarModalQr] = useState(false);

  const enlacesUrl = `${siteUrl}/links`;

  const copiarTexto = async (texto: string, clave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2500);
    } catch {
      // Fallback
    }
  };

  const descargarVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${config.nombre || 'Rafaías Villán'}`,
      `N:Villán;Rafaías;;;`,
      `TITLE:${config.titular || 'Desarrollo backend, datos e IA'}`,
      config.telefono ? `TEL;TYPE=CELL,VOICE:${config.telefono}` : '',
      config.email ? `EMAIL;TYPE=PREF,INTERNET:${config.email}` : '',
      config.web ? `URL:${config.web}` : '',
      config.ubicacion ? `ADR;TYPE=WORK:;;;${config.ubicacion};;;` : '',
      'NOTE:Contacto desde rafaiasvillan.com/links',
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(config.nombre || 'rafaias-villan').toLowerCase().replace(/\s+/g, '-')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Formatear teléfono para enlace tel: (eliminar espacios y caracteres no numéricos excepto +)
  const telHref = config.telefono ? `tel:${config.telefono.replace(/[^\d+]/g, '')}` : null;
  const whatsappHref = config.telefono ? `https://wa.me/${config.telefono.replace(/[^\d]/g, '')}` : null;

  return (
    <div className="relative min-h-screen bg-ground text-ink selection:bg-accent selection:text-ground">
      {/* Luz ambiente cálida y sutil de fondo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(225,93,59,0.12),transparent)]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col items-center justify-between px-5 py-12 sm:px-6">
        <main className="w-full flex-1 flex flex-col items-center">
          {/* Avatar / Logo */}
          <div className="group relative">
            <div className="relative size-24 rounded-full border border-line-strong bg-surface p-2 shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo.svg"
                alt={config.nombre || 'Rafaías Villán'}
                width={80}
                height={80}
                className="size-full object-contain"
              />
            </div>
            {/* Indicador de estado */}
            <span
              className="absolute bottom-1 right-1 size-4 rounded-full border-2 border-ground bg-emerald-500"
              title="Disponible para proyectos"
            />
          </div>

          {/* Nombre y titular */}
          <h1 className="mt-5 font-brand text-2xl font-bold uppercase tracking-[0.14em] text-ink sm:text-[26px]">
            {config.nombre || 'Rafaías Villán'}
          </h1>

          <p className="mt-1 text-center font-sans text-[14px] text-ink-muted sm:text-[15px]">
            {config.titular || 'Desarrollo backend, datos e IA'}
          </p>

          {/* Ubicación */}
          {config.ubicacion && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1 text-[12px] text-ink-muted backdrop-blur-sm">
              <svg className="size-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{config.ubicacion}</span>
            </div>
          )}

          {/* Botones de acción rápida: Guardar contacto y Mostrar QR */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={descargarVCard}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-[12px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-raised active:scale-95"
            >
              <svg className="size-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Guardar contacto (.vcf)
            </button>

            <button
              type="button"
              onClick={() => setMostrarModalQr(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-[12px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-raised active:scale-95"
            >
              <svg className="size-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <rect width="4" height="4" x="7" y="7"/>
                <rect width="4" height="4" x="13" y="7"/>
                <rect width="4" height="4" x="7" y="13"/>
                <path d="M13 13h4v4h-4z"/>
              </svg>
              Ver QR
            </button>

            <button
              type="button"
              onClick={() => void copiarTexto(enlacesUrl, 'enlace-links')}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-[12px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink active:scale-95"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              {copiado === 'enlace-links' ? '¡Enlace copiado!' : 'Compartir'}
            </button>
          </div>

          {/* Tarjetas de enlaces estilo Linktree */}
          <div className="mt-8 flex w-full flex-col gap-3.5">
            {/* 1. Sitio Web */}
            {config.web && (
              <a
                href={config.web}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:border-line-strong hover:bg-surface-raised hover:shadow-lg"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-raised text-ink transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                      <path d="M2 12h20"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[15px] font-medium text-ink transition-colors group-hover:text-white">
                      Sitio Web Oficial
                    </span>
                    <span className="block truncate font-mono text-[12px] text-ink-faint">
                      {config.web.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent">
                  ↗
                </span>
              </a>
            )}

            {/* 2. LinkedIn */}
            {config.linkedin && (
              <a
                href={config.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:border-line-strong hover:bg-surface-raised hover:shadow-lg"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-raised text-ink transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <svg className="size-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[15px] font-medium text-ink transition-colors group-hover:text-white">
                      LinkedIn
                    </span>
                    <span className="block truncate font-mono text-[12px] text-ink-faint">
                      {config.linkedin.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent">
                  ↗
                </span>
              </a>
            )}

            {/* 3. Behance */}
            {config.behance && (
              <a
                href={config.behance}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:border-line-strong hover:bg-surface-raised hover:shadow-lg"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-raised text-ink transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <svg className="size-5 fill-current" viewBox="0 0 24 24">
                      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-4.995 3-3.1 0-5.374-1.93-5.374-5.19 0-3.19 2.133-5.18 5.2-5.18 3.244 0 5.021 2.13 4.908 5.17h-7.391c.053 2.05 1.567 3.02 3.064 3.02 1.635 0 2.445-.75 2.843-1.63l1.745.81zm-4.908-5.32c-.086-1.55-1.123-2.14-2.23-2.14-1.309 0-2.257.77-2.428 2.14h4.658zM8.908 13.3c.731-.47 1.341-1.34 1.341-2.43 0-2.32-1.748-3.87-4.568-3.87H0v14h5.928c2.978 0 4.909-1.57 4.909-4.04 0-1.63-.847-3.03-1.929-3.66zm-5.74-4.5h2.348c1.372 0 2.227.75 2.227 1.95 0 1.15-.855 1.9-2.227 1.9H3.168V8.8zm2.569 9.7H3.168v-4.1h2.569c1.547 0 2.457.85 2.457 2.05 0 1.25-.91 2.05-2.457 2.05z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[15px] font-medium text-ink transition-colors group-hover:text-white">
                      Behance
                    </span>
                    <span className="block truncate font-mono text-[12px] text-ink-faint">
                      {config.behance.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent">
                  ↗
                </span>
              </a>
            )}

            {/* 4. Teléfono */}
            {config.telefono && telHref && (
              <div className="group relative flex items-center justify-between rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:border-line-strong hover:bg-surface-raised">
                <a href={telHref} className="flex flex-1 items-center gap-3.5 min-w-0">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-raised text-ink transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[15px] font-medium text-ink transition-colors group-hover:text-white">
                      Teléfono
                    </span>
                    <span className="block truncate font-mono text-[12px] text-ink-faint">
                      {config.telefono}
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-2 pl-2">
                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir WhatsApp"
                      className="rounded border border-line px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-line-strong hover:text-emerald-400"
                    >
                      WhatsApp
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => void copiarTexto(config.telefono, 'telefono')}
                    className="rounded border border-line px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                    title="Copiar teléfono"
                  >
                    {copiado === 'telefono' ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {/* 5. Email */}
            {config.email && (
              <div className="group relative flex items-center justify-between rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:border-line-strong hover:bg-surface-raised">
                <a href={`mailto:${config.email}`} className="flex flex-1 items-center gap-3.5 min-w-0">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-raised text-ink transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[15px] font-medium text-ink transition-colors group-hover:text-white">
                      Email
                    </span>
                    <span className="block truncate font-mono text-[12px] text-ink-faint">
                      {config.email}
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-2 pl-2">
                  <button
                    type="button"
                    onClick={() => void copiarTexto(config.email, 'email')}
                    className="rounded border border-line px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                    title="Copiar email"
                  >
                    {copiado === 'email' ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {/* 6. Enlaces adicionales configurados */}
            {config.enlacesExtra &&
              config.enlacesExtra
                .filter((e) => e.activo && e.url)
                .map((extra) => (
                  <a
                    key={extra.id}
                    href={extra.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:border-line-strong hover:bg-surface-raised hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-raised text-ink transition-colors group-hover:border-accent/40 group-hover:text-accent">
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[15px] font-medium text-ink transition-colors group-hover:text-white">
                          {extra.titulo || 'Enlace'}
                        </span>
                        {extra.subtitulo ? (
                          <span className="block truncate text-[12px] text-ink-faint">
                            {extra.subtitulo}
                          </span>
                        ) : (
                          <span className="block truncate font-mono text-[12px] text-ink-faint">
                            {extra.url.replace(/^https?:\/\//, '')}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent">
                      ↗
                    </span>
                  </a>
                ))}
          </div>
        </main>

        {/* Pie de página con enlace a la web completa */}
        <footer className="mt-12 w-full pt-6 text-center border-t border-line/60">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink hover:underline underline-offset-4"
          >
            ← Volver a {siteUrl.replace(/^https?:\/\//, '')}
          </Link>
          <p className="mt-2 text-[11px] text-ink-faint">
            © {new Date().getFullYear()} {config.nombre || 'Rafaías Villán'}
          </p>
        </footer>
      </div>

      {/* Modal interactivo para mostrar el código QR en pantalla */}
      {mostrarModalQr && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setMostrarModalQr(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMostrarModalQr(false)}
              className="absolute right-4 top-4 text-ink-faint transition-colors hover:text-ink"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center">
              <h3 className="font-brand text-lg font-bold uppercase tracking-wider text-ink">
                Escanea para conectar
              </h3>
              <p className="mt-1 text-[12px] text-ink-muted">
                Apunta con la cámara de tu móvil para abrir estos enlaces.
              </p>

              <div className="mt-6 rounded-xl border border-line bg-white p-4 shadow-inner">
                <img
                  src="/api/links/qr"
                  alt="Código QR"
                  width={220}
                  height={220}
                  className="size-[220px] object-contain"
                />
              </div>

              <p className="mt-4 font-mono text-[11px] text-ink-faint">
                {enlacesUrl}
              </p>

              <button
                type="button"
                onClick={() => void copiarTexto(enlacesUrl, 'modal-link')}
                className="mt-4 w-full rounded-lg bg-accent py-2.5 text-[13px] font-medium text-ground transition-opacity hover:opacity-90"
              >
                {copiado === 'modal-link' ? '¡Enlace copiado!' : 'Copiar enlace directo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
