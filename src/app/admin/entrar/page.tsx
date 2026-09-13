import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FormularioEntrada } from '@/components/admin/formulario-entrada';
import { haySesion } from '@/lib/admin/guardia';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
};

export default async function Entrar() {
  // Quien ya tiene sesión no debería ver un formulario de entrada.
  if (await haySesion()) redirect('/admin');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display text-2xl tracking-tight text-ink">Panel</h1>
      <p className="mt-1 mb-8 text-[13px] text-ink-faint">Visitas, consultas y ajustes.</p>
      <FormularioEntrada />
    </main>
  );
}
