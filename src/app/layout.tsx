import type { Metadata } from 'next';
import { Bricolage_Grotesque, Space_Mono } from 'next/font/google';
import { Consentimiento } from '@/components/consentimiento';
import { env } from '@/lib/env';
import './globals.css';

// next/font descarga y auto-aloja las fuentes durante la construcción: en
// producción no hay ninguna petición a Google, ni cookies de terceros, ni un
// salto de red antes de que el texto se pinte.
//
// Bricolage Grotesque es una sola familia variable para todo el texto. Se le
// pide el eje `opsz` además del grosor porque es lo que hace que funcione a los
// dos extremos de la escala: el eje de tamaño óptico aprieta el interletraje y
// afina los trazos a medida que crece el cuerpo, que es exactamente lo que
// necesita una página cuyos titulares llegan a 200 px y cuyo cuerpo baja a 13.
// Sin ese eje, el titular grande se vería basto y el texto pequeño, débil.
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--fuente-display',
  display: 'swap',
});

// El monoespacio no es decorativo: marca lo que anota el sistema —el número de
// sección, el recuento, el estado— frente a lo que afirma el texto. Solo se
// usan dos grosores y no es variable, así que cada uno es un fichero aparte.
const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--fuente-mono',
  display: 'swap',
});

const TITULO = 'Rafaías Villán — Desarrollo backend, datos e IA';
const DESCRIPCION =
  'Trayectoria profesional consultable: pregunta en lenguaje natural sobre proyectos, tecnologías y decisiones técnicas.';

export const metadata: Metadata = {
  // Sin esta base, las rutas relativas de las imágenes sociales se emiten tal
  // cual, y ni LinkedIn ni WhatsApp resuelven una ruta relativa: la tarjeta
  // saldría sin imagen.
  metadataBase: new URL(env.siteUrl),

  title: TITULO,
  description: DESCRIPCION,

  // Un enlace compartido sin esto sale como una línea de texto gris. Para un
  // sitio cuyo objetivo es que alguien lo abra desde LinkedIn, la tarjeta no es
  // decoración.
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: env.siteUrl,
    siteName: env.siteOwner,
    title: TITULO,
    description: DESCRIPCION,
    images: ['/og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
    images: ['/og.jpg'],
  },
  // Mientras el corpus no esté listo, el sitio se sirve con noindex. Va aquí
  // además de en robots.txt porque cada uno hace una cosa distinta: robots.txt
  // pide que no se rastree, esta etiqueta pide que no se indexe.
  robots: env.siteIndexable ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable}`}>
      <body>
        {children}
        {/*
          El identificador se lee en el servidor y baja como propiedad. Si no
          está configurado, el componente no pinta nada y el sitio no hace
          ninguna petición a Google: es lo que ocurre en desarrollo.
        */}
        <Consentimiento gaId={env.gaMeasurementId} />
      </body>
    </html>
  );
}
