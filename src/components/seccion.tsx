/**
 * Cabecera de sección.
 *
 * Reproduce el patrón de la referencia: filete superior, nombre a la izquierda,
 * recuento a la derecha y una única línea de descripción debajo. El recuento
 * alineado a la derecha hace mucho trabajo con muy poca tinta —dice de un
 * vistazo cuánto hay sin que haya que contar— y es lo que permite que las
 * secciones se lean como un índice mientras se recorre la página.
 */
export function Seccion({
  id,
  titulo,
  descripcion,
  recuento,
  children,
}: {
  id: string;
  titulo: string;
  descripcion?: string;
  recuento?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line pt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-medium tracking-tight text-ink">{titulo}</h2>
        {recuento ? (
          <span className="shrink-0 text-[11px] text-ink-faint">{recuento}</span>
        ) : null}
      </div>

      {descripcion ? (
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-ink-muted">
          {descripcion}
        </p>
      ) : null}

      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Aviso para una sección sin contenido todavía. */
export function SeccionVacia({ mensaje }: { mensaje: string }) {
  return (
    <p className="rounded-lg border border-dashed border-line px-4 py-6 text-[13px] text-ink-faint">
      {mensaje}
    </p>
  );
}
