/**
 * Desplegable «ver más».
 *
 * Se usa `<details>` y no un componente de cliente con estado por tres motivos.
 * Funciona sin JavaScript, así que el contenido sigue siendo accesible si la
 * hidratación falla o tarda. El navegador ya resuelve la accesibilidad —foco,
 * teclado, anuncio del estado abierto o cerrado— mejor de lo que se reimplementa
 * a mano. Y lo que hay dentro está en el HTML servido aunque esté plegado, de
 * modo que un rastreador lo lee igual: plegar es una decisión de presentación,
 * no una forma de esconder contenido.
 *
 * El texto del resumen nombra lo que hay dentro y cuántas cosas son. «Ver más»
 * a secas obliga a abrir para averiguar si merece la pena.
 */
export function VerMas({
  texto,
  textoCerrar = 'Ver menos',
  children,
}: {
  texto: string;
  textoCerrar?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group mt-5">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg border border-line bg-surface/40 px-3 py-1.5 text-[12px] text-ink-muted transition-all duration-200 hover:border-accent/40 hover:text-ink">
        <span className="font-mono text-[13px] leading-none text-accent transition-transform duration-200 group-open:rotate-45 select-none">
          +
        </span>
        <span className="group-open:hidden">{texto}</span>
        <span className="hidden group-open:inline">{textoCerrar}</span>
      </summary>

      <div className="mt-5">{children}</div>
    </details>
  );
}
