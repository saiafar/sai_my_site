import {
  documentosMasVistos,
  origenes,
  paginasMasVistas,
  resumenVisitas,
  visitasPorDia,
  type FilaPagina,
} from '@/lib/admin/metricas';
import { dia, duracion, numero } from '@/lib/admin/formato';
import { monthlySpendUsd } from '@/lib/rag/limits';
import { env } from '@/lib/env';

/**
 * Resumen de visitas.
 *
 * Los números salen de la telemetría propia y no de Google Analytics. Es
 * deliberado: un bloqueador de anuncios se come una parte grande de los eventos
 * de GA —y quien lee un sitio técnico los usa más que la media—, así que lo que
 * aquí se ve es el recuento real. GA4 sigue instalado para quien acepta el
 * aviso, y se consulta en su propia consola: lo que aporta son las dimensiones
 * que esto no tiene, no el total.
 */
export const dynamic = 'force-dynamic';

const VENTANA_DIAS = 30;

export default async function Resumen() {
  const [hoy, semana, mes, serie, paginas, documentos, fuentes, gasto] = await Promise.all([
    resumenVisitas(1),
    resumenVisitas(7),
    resumenVisitas(VENTANA_DIAS),
    visitasPorDia(VENTANA_DIAS),
    paginasMasVistas(VENTANA_DIAS),
    documentosMasVistos(VENTANA_DIAS),
    origenes(VENTANA_DIAS),
    monthlySpendUsd(),
  ]);

  const maximoDiario = Math.max(1, ...serie.map((d) => d.vistas));

  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-display text-2xl tracking-tight text-ink">Resumen</h1>
        <p className="mt-1 text-[13px] text-ink-faint">
          Últimos {VENTANA_DIAS} días. Sin cookies: los visitantes se cuentan por un hash de la IP,
          así que la cifra es una aproximación por lo bajo.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          {/* «24 h» y no «hoy»: la consulta es una ventana móvil desde ahora, no
              desde medianoche, que es lo que hace comparable la cifra a
              cualquier hora del día. */}
          <Dato titulo="Últimas 24 h" valor={numero(hoy.vistas)} pie={`${numero(hoy.visitantes)} visitantes`} />
          <Dato titulo="Visitas 7 días" valor={numero(semana.vistas)} pie={`${numero(semana.visitantes)} visitantes`} />
          <Dato titulo={`Visitas ${VENTANA_DIAS} días`} valor={numero(mes.vistas)} pie={`${numero(mes.visitantes)} visitantes`} />
          <Dato
            titulo="Tiempo medio"
            valor={duracion(mes.duracionMediaMs)}
            pie="por página vista"
          />
        </div>
      </section>

      <section>
        <h2 className="text-[13px] uppercase tracking-wider text-ink-faint">Visitas por día</h2>
        {/* Barras con divs y no una librería de gráficos: son treinta valores y
            una sola serie. Una dependencia de 40 kB para esto no se paga. */}
        <div className="mt-4 flex h-32 items-end gap-1">
          {serie.map((d) => (
            <div key={d.dia} className="group relative flex-1" title={`${dia(d.dia)}: ${d.vistas}`}>
              <div
                className="w-full bg-accent-soft transition-colors group-hover:bg-accent"
                style={{ height: `${Math.max(2, (d.vistas / maximoDiario) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-faint">
          <span>{serie[0] ? dia(serie[0].dia) : ''}</span>
          <span>{serie.at(-1) ? dia(serie.at(-1)!.dia) : ''}</span>
        </div>
      </section>

      <div className="grid gap-12 md:grid-cols-2">
        <Ranking
          titulo="Fichas más vistas"
          vacio="Todavía nadie ha abierto una ficha."
          filas={documentos}
        />
        <Ranking titulo="Páginas más vistas" vacio="Sin visitas registradas." filas={paginas} />
      </div>

      <section>
        <h2 className="text-[13px] uppercase tracking-wider text-ink-faint">De dónde llegan</h2>
        <ul className="mt-4 space-y-1.5">
          {fuentes.length === 0 ? (
            <li className="text-[13px] text-ink-faint">Sin datos todavía.</li>
          ) : (
            fuentes.map((fuente) => (
              <li key={fuente.origen} className="flex justify-between text-[13px]">
                <span className="text-ink-muted">{fuente.origen}</span>
                <span className="text-ink-faint">{numero(fuente.vistas)}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-[13px] uppercase tracking-wider text-ink-faint">Asistente</h2>
        <p className="mt-3 text-[13px] text-ink-muted">
          Gasto del mes en curso:{' '}
          <span className="text-ink">{gasto.toFixed(2)} $</span> de {env.monthlyBudgetUsd} $. Al
          alcanzar el tope el asistente deja de llamar al modelo y responde con un aviso.
        </p>
      </section>
    </div>
  );
}

function Dato({ titulo, valor, pie }: { titulo: string; valor: string; pie: string }) {
  return (
    <div className="bg-ground p-4">
      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{titulo}</p>
      <p className="mt-1.5 font-display text-3xl tracking-tight text-ink">{valor}</p>
      <p className="mt-0.5 text-[11px] text-ink-faint">{pie}</p>
    </div>
  );
}

function Ranking({
  titulo,
  vacio,
  filas,
}: {
  titulo: string;
  vacio: string;
  filas: FilaPagina[];
}) {
  const maximo = Math.max(1, ...filas.map((f) => f.vistas));

  return (
    <section>
      <h2 className="text-[13px] uppercase tracking-wider text-ink-faint">{titulo}</h2>
      {filas.length === 0 ? (
        <p className="mt-4 text-[13px] text-ink-faint">{vacio}</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {filas.map((fila) => (
            <li key={fila.clave}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="truncate text-[13px] text-ink-muted" title={fila.clave}>
                  {fila.clave}
                </span>
                <span className="shrink-0 text-[12px] text-ink-faint">
                  {numero(fila.vistas)} · {duracion(fila.duracionMediaMs)}
                </span>
              </div>
              <div className="mt-1 h-px bg-line">
                <div
                  className="h-px bg-accent"
                  style={{ width: `${(fila.vistas / maximo) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
