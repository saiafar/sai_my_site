/**
 * Resalta los fragmentos marcados con ** en un texto del diccionario.
 *
 * El párrafo de presentación destaca cinco cosas dentro de una frase corrida.
 * Partirlo en claves separadas —«texto antes», «lo destacado», «texto después»—
 * haría imposible traducirlo: en otro idioma el orden de la frase cambia y los
 * trozos dejan de encajar. Marcándolo dentro de la propia cadena, cada idioma
 * decide dónde va el énfasis.
 *
 * El color de cada marca lo decide quien llama, no el texto: en el diseño los
 * años van en naranja, los sectores en tinta y los oficios en lila, y eso es
 * una decisión de diseño que no tiene por qué viajar dentro de una cadena
 * traducible. Si hay menos clases que marcas, la última se repite.
 */
const POR_DEFECTO = ['bg-lila'];

export function TextoDestacado({
  texto,
  clases = POR_DEFECTO,
}: {
  texto: string;
  /** Una clase por marca, en orden de aparición. */
  clases?: readonly string[];
}) {
  let marca = -1;

  return (
    <>
      {texto.split(/\*\*(.+?)\*\*/g).map((parte, indice) => {
        // Las posiciones impares son lo que estaba entre asteriscos.
        if (indice % 2 === 0) return <span key={indice}>{parte}</span>;
        marca += 1;
        const clase = clases[Math.min(marca, clases.length - 1)] ?? POR_DEFECTO[0];
        return (
          <strong
            key={indice}
            className={`mx-0.5 inline-block rounded-md px-2 py-0.5 align-[3px] font-mono text-[13px] font-bold sm:text-[16px] ${clase}`}
          >
            {parte}
          </strong>
        );
      })}
    </>
  );
}
