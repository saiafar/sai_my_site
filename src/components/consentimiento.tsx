'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDictionary, isValidLang, DEFAULT_LANG, type Lang } from '@/lib/i18n';

const CLAVE = 'analitica-google';
type Decision = 'si' | 'no';

/**
 * Aviso de cookies y etiqueta de Google Analytics.
 *
 * El sitio no pone una sola cookie por su cuenta —las fuentes se auto-alojan
 * justo para eso— así que la única razón por la que existe este aviso es GA4.
 * De ahí la regla que gobierna el componente: **la etiqueta de Google no se
 * carga hasta que alguien acepta**. Ni siquiera en modo de consentimiento
 * denegado, que sigue mandando peticiones sin cookie a Google antes de que
 * nadie haya dicho que sí.
 *
 * Las métricas del panel no dependen de esto: salen de la telemetría propia, que
 * no pone cookies ni guarda la IP y por tanto no necesita permiso. Rechazar aquí
 * deja al sitio exactamente como estaba antes de que existiera GA4, y el panel
 * sigue enseñando visitas y tiempos.
 *
 * La decisión se guarda en localStorage y no en una cookie, que sería
 * contradictorio: es el propio navegador el que recuerda que no quiere que lo
 * midan.
 */
export function Consentimiento({ gaId, lang: propLang }: { gaId: string; lang?: Lang }) {
  const pathname = usePathname();
  const [decision, setDecision] = useState<Decision | null>(null);
  // El primer render en el servidor no puede saber qué decidió este navegador.
  // Sin esta bandera, el aviso aparecería un instante a quien ya lo cerró hace
  // meses, en cada carga.
  const [leido, setLeido] = useState(false);

  const langSegment = pathname?.split('/')[1];
  const lang: Lang = propLang ?? (isValidLang(langSegment) ? langSegment : DEFAULT_LANG);
  const dict = getDictionary(lang).consent;

  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado === 'si' || guardado === 'no') setDecision(guardado);
    } catch {
      // Navegación privada con el almacenamiento bloqueado: se preguntará otra
      // vez, que es el comportamiento correcto cuando no se puede recordar.
    }
    setLeido(true);
  }, []);

  function decidir(valor: Decision): void {
    try {
      localStorage.setItem(CLAVE, valor);
    } catch {
      /* Igual que arriba: la decisión vale para esta sesión aunque no se pueda guardar. */
    }
    setDecision(valor);
  }

  if (!gaId || !leido) return null;

  if (decision === 'si') {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${gaId}');`}
        </Script>
      </>
    );
  }

  if (decision === 'no') return null;

  return (
    <div
      role="dialog"
      aria-label={dict.ariaLabel}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          {dict.message}
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decidir('no')}
            className="border border-line px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {dict.decline}
          </button>
          <button
            type="button"
            onClick={() => decidir('si')}
            className="bg-accent px-3 py-1.5 text-[12px] text-ground transition-opacity hover:opacity-90"
          >
            {dict.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
