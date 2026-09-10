import { FondoHero } from '@/components/fondo-hero';
import { BarraSuperior } from '@/components/barra-superior';
import { Asistente } from '@/components/asistente';
import { Seccion, SeccionVacia } from '@/components/seccion';
import { TarjetaProyecto, EntradaExperiencia } from '@/components/tarjetas';
import { Etiqueta } from '@/components/etiqueta';
import { Pie } from '@/components/pie';
import { EscenaHero } from '@/components/escena-hero';
import { getByKind, getStats, getTechnologies } from '@/lib/site/queries';
import { env } from '@/lib/env';

/**
 * Renderizado dinámico, no estático.
 *
 * El contenido no está en la base de datos cuando se construye la imagen: la
 * ingestión corre al arrancar el contenedor, después del build. Prerenderizar
 * aquí congelaría la página con datos que aún no existen y, peor, obligaría al
 * `docker build` a tener acceso a producción.
 */
export const dynamic = 'force-dynamic';

const GITHUB = 'https://github.com/saiafar/sai_my_site';

function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export default async function Home() {
  const [perfil, experiencias, proyectos, notas, tecnologias, stats] = await Promise.all([
    getByKind('perfil'),
    getByKind('experiencia'),
    getByKind('proyecto'),
    getByKind('nota'),
    getTechnologies(),
    getStats(),
  ]);

  const presentacion = perfil[0];

  return (
    <>
      <BarraSuperior github={GITHUB} sobreImagen />
      <EscenaHero />

      {/* Sin JavaScript no hay nadie que actualice --p: la escena se queda en
          su estado final, con todo el contenido visible. */}
      <noscript>
        <style>{'[data-escena],[data-escena-barra]{--p:1!important}'}</style>
      </noscript>

      {/* -----------------------------------------------------------------------
          Hero. Al abrir la página solo están la imagen, el logo y el nombre. Al
          hacer scroll el bloque del nombre se queda fijo en el centro mientras
          se encoge, la imagen se funde con el fondo y el texto sube desde abajo
          hasta juntarse con él; a partir de ahí todo sigue subiendo con la
          página. El mecanismo está descrito en globals.css («Escena de entrada»).

          --p empieza a 0 en el propio HTML para que el primer pintado ya sea el
          de la escena inicial, sin esperar a que cargue el JavaScript.
      ----------------------------------------------------------------------- */}
      <div data-escena className="relative" style={{ '--p': 0 } as React.CSSProperties}>
        <div className="relative">
          <FondoHero />

          <div aria-hidden className="escena-entrada" />

          {/* El nombre es el <h1>: identifica la página ante buscadores y
              lectores de pantalla. Se escribe en minúsculas y se pasa a
              mayúsculas con CSS, porque un lector de pantalla deletrea el texto
              que ya viene en mayúsculas en lugar de leerlo como un nombre. */}
          <div className="escena-bloque flex flex-col items-center px-6 text-center">
            {/* Dos copias del mismo logo superpuestas: debajo, en blanco (el
                filtro convierte en blanco cualquier forma conservando su
                transparencia, así que sirve también si se sustituye el logo);
                encima, el original, que aparece a lo largo del recorrido. Al
                principio el degradado naranja se confundiría con las nubes del
                atardecer; cuando la imagen ya se ha oscurecido, recupera su
                color. Es el mismo fichero, así que es una única descarga. */}
            <span className="escena-logo relative block">
              <img
                src="/logo.svg"
                alt=""
                width={72}
                height={72}
                className="escena-logo-blanco absolute inset-0 size-full brightness-0 invert"
              />
              <img
                src="/logo.svg"
                alt=""
                width={72}
                height={72}
                className="escena-logo-color relative size-full"
              />
            </span>
            <h1 className="escena-nombre font-brand font-semibold uppercase leading-none tracking-[0.14em] text-ink">
              {env.siteOwner}
            </h1>
          </div>

          <div aria-hidden data-recorrido className="escena-recorrido" />
        </div>

        <section className="mx-auto max-w-lectura px-6 pb-16 pt-6 text-center">
          <p
            className="escena-sube mx-auto max-w-md text-[14px] leading-relaxed text-ink-muted"
            style={{ '--desde': 0.35 } as React.CSSProperties}
          >
            {presentacion?.summary ??
              'Desarrollo backend, bases de datos e inteligencia artificial. Pregunta en lenguaje natural: el asistente responde con documentación real y cita de dónde sale cada dato.'}
          </p>

          <ul
            className="escena-sube mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-ink-faint"
            style={{ '--desde': 0.45 } as React.CSSProperties}
          >
            <li>
              <span className="text-ink-muted">{stats.proyectos}</span>{' '}
              {stats.proyectos === 1 ? 'proyecto' : 'proyectos'}
            </li>
            <li>
              <span className="text-ink-muted">{stats.tecnologias}</span>{' '}
              {stats.tecnologias === 1 ? 'tecnología' : 'tecnologías'}
            </li>
            <li>
              <span className="text-ink-muted">{stats.fragmentos}</span>{' '}
              {stats.fragmentos === 1 ? 'fragmento indexado' : 'fragmentos indexados'}
            </li>
            {stats.primerAno ? (
              <li>
                desde <span className="text-ink-muted">{stats.primerAno}</span>
              </li>
            ) : null}
          </ul>

          <div
            className="escena-sube mx-auto mt-9 max-w-xl"
            style={{ '--desde': 0.55 } as React.CSSProperties}
          >
            <Asistente />
          </div>
        </section>
      </div>

      <main className="mx-auto max-w-lectura space-y-14 px-6 pb-4">
        <Seccion
          id="experiencia"
          titulo="Experiencia"
          descripcion="Etapas profesionales, con lo que hice en cada una y con qué."
          recuento={plural(experiencias.length, 'etapa', 'etapas')}
        >
          {experiencias.length > 0 ? (
            <div className="space-y-6">
              {experiencias.map((documento) => (
                <EntradaExperiencia key={documento.slug} documento={documento} />
              ))}
            </div>
          ) : (
            <SeccionVacia mensaje="Todavía no hay experiencias en la base de conocimiento. Añade documentos en knowledge/experiencia/ y ejecuta npm run ingest." />
          )}
        </Seccion>

        <Seccion
          id="proyectos"
          titulo="Proyectos"
          descripcion="Cada ficha recoge el contexto, las decisiones técnicas y lo que salió mal."
          recuento={plural(proyectos.length, 'proyecto', 'proyectos')}
        >
          {proyectos.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {proyectos.map((documento) => (
                <TarjetaProyecto key={documento.slug} documento={documento} />
              ))}
            </div>
          ) : (
            <SeccionVacia mensaje="Todavía no hay proyectos. Añade documentos en knowledge/proyectos/ y ejecuta npm run ingest." />
          )}
        </Seccion>

        <Seccion
          id="stack"
          titulo="Stack"
          descripcion="Ordenado por cuánto hay escrito sobre cada tecnología, no alfabéticamente: la lista dice sobre qué se puede preguntar de verdad."
          recuento={plural(tecnologias.length, 'tecnología', 'tecnologías')}
        >
          {tecnologias.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tecnologias.map((tecnologia) => (
                <span
                  key={tecnologia.slug}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink-muted"
                >
                  {tecnologia.name}
                  <span className="text-[10px] text-ink-faint">{tecnologia.documentCount}</span>
                </span>
              ))}
            </div>
          ) : (
            <SeccionVacia mensaje="Las tecnologías se extraen del frontmatter de los documentos." />
          )}
        </Seccion>

        {notas.length > 0 ? (
          <Seccion
            id="notas"
            titulo="Notas"
            descripcion="Decisiones técnicas y aprendizajes escritos al detalle."
            recuento={plural(notas.length, 'nota', 'notas')}
          >
            <ul className="divide-y divide-line border-y border-line">
              {notas.map((nota) => (
                <li key={nota.slug}>
                  <a
                    href={`/${nota.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-3"
                  >
                    <span className="text-[13px] text-ink-muted transition-colors group-hover:text-ink">
                      {nota.title}
                    </span>
                    {nota.technologies[0] ? (
                      <Etiqueta>{nota.technologies[0].name}</Etiqueta>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </Seccion>
        ) : null}

        <Pie github={GITHUB} ano={new Date().getFullYear()} />
      </main>
    </>
  );
}
