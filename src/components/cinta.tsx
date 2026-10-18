/**
 * Cinta de cifras bajo el hero.
 *
 * La lista se pinta dos veces y el bucle la desplaza hasta la mitad exacta: al
 * llegar, la segunda copia ocupa el sitio donde empezó la primera y el reinicio
 * no se ve (ver .cinta en globals.css). La copia va con aria-hidden para que un
 * lector de pantalla no lea las mismas cifras dos veces.
 *
 * Es la única pieza del sitio que se mueve por su cuenta, sin que nadie haga
 * scroll. Se lo permite ser una franja de datos y no contenido: si se perdiera
 * la animación —«reducir movimiento» la detiene— las cifras siguen ahí, legibles.
 */
export function Cinta({ textos }: { textos: readonly string[] }) {
  if (textos.length === 0) return null;

  const fila = (oculta: boolean) =>
    textos.map((texto, indice) => (
      <span
        key={`${oculta ? 'copia' : 'original'}-${indice}`}
        aria-hidden={oculta ? true : undefined}
        className="whitespace-nowrap"
      >
        {texto}
      </span>
    ));

  return (
    <div className="overflow-hidden border-y border-tinta bg-naranja text-tinta">
      <div className="cinta w-max gap-8 py-3.5 font-mono text-[13px] font-bold uppercase sm:gap-12 sm:text-[15px]">
        {fila(false)}
        {fila(true)}
      </div>
    </div>
  );
}
