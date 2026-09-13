import { FormularioAjustes } from '@/components/admin/formulario-ajustes';
import { leerAjustes } from '@/lib/admin/ajustes';

/**
 * Ajustes editables.
 *
 * Solo está aquí lo que cambia sin cambiar el código. Las credenciales y los
 * topes de gasto siguen en variables de entorno: poder editarlos desde una
 * pantalla web añade una forma de tumbar el sitio que no compensa.
 */
export const dynamic = 'force-dynamic';

export default async function Ajustes() {
  const ajustes = await leerAjustes();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl tracking-tight text-ink">Ajustes</h1>
        <p className="mt-1 text-[13px] text-ink-faint">
          A dónde se reenvían los mensajes del formulario de contacto.
        </p>
      </div>

      <FormularioAjustes
        webhookUrl={ajustes['contacto.webhook_url']}
        webhookSecret={ajustes['contacto.webhook_secret']}
      />
    </div>
  );
}
