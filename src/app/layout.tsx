import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import './globals.css';

// next/font descarga y auto-aloja las fuentes durante la construcción: en
// producción no hay ninguna petición a Google, ni cookies de terceros, ni un
// salto de red antes de que el texto se pinte.
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--fuente-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--fuente-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rafaias Villán — Desarrollo backend, datos e IA',
  description:
    'Trayectoria profesional consultable: pregunta en lenguaje natural sobre proyectos, tecnologías y decisiones técnicas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
