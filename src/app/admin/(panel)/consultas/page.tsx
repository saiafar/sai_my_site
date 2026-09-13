import Link from 'next/link';
import { BotonReenviar } from '@/components/admin/boton-reenviar';
import { duracion, fecha } from '@/lib/admin/formato';
import {
  mensajesContacto,
  preguntasAsistente,
  rastrosDeVisitantes,
  type PasoDelRastro,
} from '@/lib/admin/metricas';

/**
 * Historial de lo que ha llegado por las dos vías: el formulario y el asistente.
 *
 * Las pestañas van por parámetro de URL y no por estado de cliente para que el
 * enlace a una pestaña concreta se pueda guardar y compartir, y para que la
 * página siga siendo un componente de servidor: solo se consulta lo que se está
 * mirando.
 */
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ ver?: string }>;
}

export default async function Consultas({ searchParams }: Props) {
  const { ver } = await searchParams;
  const pestana = ver === 'asistente' ? 'asistente' : 'contacto';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl tracking-tight text-ink">Consultas</h1>
        <nav className="mt-4 flex gap-4 border-b border-line">
          <Pestana href="/admin/consultas" texto="Mensajes" activa={pestana === 'contacto'} />
          <Pestana
            href="/admin/consultas?ver=asistente"
            texto="Preguntas al asistente"
            activa={pestana === 'asistente'}
          />
        </nav>
      </div>

      {pestana === 'contacto' ? <Mensajes /> : <Preguntas />}
    </div>
  );
}

function Pestana({ href, texto, activa }: { href: string; texto: string; activa: boolean }) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b pb-2 text-[13px] transition-colors ${
        activa
          ? 'border-accent text-ink'
          : 'border-transparent text-ink-faint hover:text-ink-muted'
      }`}
    >
      {texto}
    </Link>
  );
}

async function Mensajes() {
  const mensajes = await mensajesContacto(50);
  // Una sola consulta para los rastros de todos los mensajes de la página.
  const rastros = await rastrosDeVisitantes(
    mensajes.map((m) => m.clientKey).filter((clave): clave is string => clave !== null),
  );

  if (mensajes.length === 0) {
    return <p className="text-[13px] text-ink-faint">Todavía no ha escrito nadie.</p>;
  }

  return (
    <ul className="space-y-px bg-line">
      {mensajes.map((mensaje) => (
        <li key={mensaje.id} className="bg-ground p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-[14px] text-ink">
              {mensaje.nombre}{' '}
              <a
                href={`mailto:${mensaje.email}`}
                className="text-[13px] text-accent underline underline-offset-2"
              >
                {mensaje.email}
              </a>
            </p>
            <p className="text-[11px] text-ink-faint">{fecha(mensaje.creadoEn)}</p>
          </div>

          <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-muted">
            {mensaje.mensaje}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
            {mensaje.entregadoEn ? (
              <span className="text-ink-faint">Enviado a N8N · {fecha(mensaje.entregadoEn)}</span>
            ) : (
              <>
                <span className="text-accent">
                  No entregado
                  {mensaje.errorEntrega ? `: ${mensaje.errorEntrega}` : ''}
                  {mensaje.intentos > 0 ? ` (${mensaje.intentos} intentos)` : ''}
                </span>
                <BotonReenviar id={mensaje.id} />
              </>
            )}
          </div>

          <Rastro pasos={mensaje.clientKey ? rastros.get(mensaje.clientKey) : undefined} />
        </li>
      ))}
    </ul>
  );
}

async function Preguntas() {
  const preguntas = await preguntasAsistente(60);

  if (preguntas.length === 0) {
    return <p className="text-[13px] text-ink-faint">Nadie ha preguntado nada todavía.</p>;
  }

  return (
    <ul className="space-y-px bg-line">
      {preguntas.map((pregunta, indice) => (
        <li key={`${pregunta.creadaEn.toISOString()}-${indice}`} className="bg-ground p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[14px] text-ink">{pregunta.pregunta}</p>
            <p className="shrink-0 text-[11px] text-ink-faint">{fecha(pregunta.creadaEn)}</p>
          </div>

          <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-muted">
            {pregunta.respuesta ?? 'Sin respuesta registrada.'}
          </p>

          <p className="mt-3 text-[11px] text-ink-faint">
            {pregunta.latenciaMs === null ? '—' : `${(pregunta.latenciaMs / 1000).toFixed(1)} s`}
            {pregunta.costeUsd === null ? '' : ` · ${pregunta.costeUsd.toFixed(4)} $`}
            {pregunta.motivoRechazo ? ` · ${pregunta.motivoRechazo}` : ''}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Lo que vio esa persona antes de escribir. Es el cruce que justifica guardar la
 * telemetría en la misma base que los mensajes: saber que quien pregunta por un
 * presupuesto acababa de leer dos proyectos concretos cambia la respuesta.
 */
function Rastro({ pasos }: { pasos: PasoDelRastro[] | undefined }) {
  if (!pasos || pasos.length === 0) return null;

  return (
    <details className="mt-3 group">
      <summary className="cursor-pointer text-[11px] text-ink-faint transition-colors hover:text-ink-muted">
        Qué vio antes ({pasos.length})
      </summary>
      <ul className="mt-2 space-y-1 border-l border-line pl-3">
        {pasos.map((paso, indice) => (
          <li key={`${paso.path}-${indice}`} className="flex justify-between gap-4 text-[11px]">
            <span className="truncate text-ink-muted">{paso.documentSlug ?? paso.path}</span>
            <span className="shrink-0 text-ink-faint">
              {fecha(paso.creadoEn)} · {duracion(paso.duracionMs)}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
