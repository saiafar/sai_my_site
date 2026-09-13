/**
 * Genera el valor de ADMIN_PASSWORD_HASH.
 *
 *   npm run admin:clave
 *
 * La contraseña se pide por terminal y no se pasa como argumento, porque un
 * argumento queda en el historial del intérprete de órdenes y en la lista de
 * procesos. Tampoco se escribe en ningún fichero: lo que sale por pantalla es
 * solo el hash, que es lo que se pega en Dokploy o en .env.local.
 */
import { createInterface } from 'node:readline';
import { derivarClave } from '../src/lib/admin/clave.ts';

/** Lee una línea sin mostrar lo que se teclea. */
function pedirOculto(pregunta: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

    // readline escribe cada pulsación en la salida; interceptarla es la forma
    // de que la contraseña no quede visible en la pantalla ni en el scrollback.
    const salida = rl as unknown as { output: NodeJS.WriteStream; _writeToOutput?: unknown };
    let primera = true;
    salida._writeToOutput = function (texto: string) {
      if (primera) {
        salida.output.write(texto);
        primera = false;
        return;
      }
      if (texto.includes('\n')) salida.output.write('\n');
    };

    rl.question(pregunta, (respuesta) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

async function main(): Promise<void> {
  const contrasena = await pedirOculto('Contraseña del panel: ');
  const repetida = await pedirOculto('Repítela: ');

  if (contrasena.length < 12) {
    throw new Error(
      'Usa al menos 12 caracteres. Esta contraseña protege la bandeja de mensajes y ' +
        'la URL a la que se reenvían: es la única puerta que tiene el panel.',
    );
  }
  if (contrasena !== repetida) throw new Error('No coinciden.');

  console.log('\nAñade esta línea al entorno (Dokploy → Environment, o .env.local):\n');
  console.log(`ADMIN_PASSWORD_HASH=${await derivarClave(contrasena)}\n`);
  console.log('Cambiarla más adelante cierra todas las sesiones abiertas del panel.');
}

main().catch((error: unknown) => {
  console.error('\n' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
