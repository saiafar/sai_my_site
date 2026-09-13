'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Aviso de visita.
 *
 * Se monta en cada página en lugar de una sola vez en el layout raíz, y es
 * deliberado: la ficha sabe a qué documento corresponde y el layout no. Podría
 * deducirse el slug de la ruta en el servidor, pero entonces una URL inventada
 * que devuelve 404 quedaría registrada como si alguien hubiera visitado un
 * proyecto. El sitio tiene dos rutas, así que ponerlo en las dos es explícito y
 * no cuesta nada.
 *
 * No guarda nada en el navegador: ni cookie, ni localStorage, ni identificador
 * que sobreviva a la recarga. El `viewId` vive lo que vive la página y solo sirve
 * para que el servidor pueda unir la apertura con el cierre.
 */
export function Telemetria({ documentSlug }: { documentSlug?: string }) {
  const ruta = usePathname();

  useEffect(() => {
    const viewId = crypto.randomUUID();
    const inicio = performance.now();
    let cerrado = false;

    void fetch('/api/telemetria', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        tipo: 'vista',
        viewId,
        path: ruta,
        documentSlug: documentSlug ?? null,
        // De dónde vino. En una navegación interna está vacío, que es lo
        // correcto: la primera página de la visita es la única que tiene origen.
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {
      // Sin conexión o con un bloqueador de por medio. No hay nada que hacer ni
      // nada que contarle al visitante.
    });

    const cerrar = (): void => {
      if (cerrado) return;
      cerrado = true;
      const cuerpo = JSON.stringify({
        tipo: 'salida',
        viewId,
        durationMs: Math.round(performance.now() - inicio),
      });
      // sendBeacon y no fetch: al cerrar la pestaña el navegador ya no espera a
      // ninguna promesa, pero sí se compromete a entregar un beacon.
      navigator.sendBeacon('/api/telemetria', new Blob([cuerpo], { type: 'application/json' }));
    };

    // Los dos hacen falta y no son intercambiables: en escritorio lo normal es
    // pagehide, y en móvil el navegador puede no dispararlo nunca porque la
    // pestaña pasa a segundo plano y muere ahí. El servidor ignora el segundo
    // aviso que llegue, así que sobra con que acierte uno.
    const alOcultarse = (): void => {
      if (document.visibilityState === 'hidden') cerrar();
    };
    window.addEventListener('pagehide', cerrar);
    document.addEventListener('visibilitychange', alOcultarse);

    return () => {
      window.removeEventListener('pagehide', cerrar);
      document.removeEventListener('visibilitychange', alOcultarse);
      // Navegación interna: la página se desmonta sin que el navegador se vaya
      // a ninguna parte, así que el cierre lo marca esto.
      cerrar();
    };
  }, [ruta, documentSlug]);

  return null;
}
