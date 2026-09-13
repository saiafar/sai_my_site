import { FondoHero } from '@/components/fondo-hero';
import { BarraSuperior } from '@/components/barra-superior';
import { Asistente } from '@/components/asistente';
import { Seccion, SeccionVacia } from '@/components/seccion';
import { TarjetaProyecto, EntradaExperiencia } from '@/components/tarjetas';
import { Etiqueta } from '@/components/etiqueta';
import { Pie } from '@/components/pie';
import { EscenaHero } from '@/components/escena-hero';
import { FormularioContacto } from '@/components/formulario-contacto';
import { Telemetria } from '@/components/telemetria';
import { VerMas } from '@/components/ver-mas';
import { DatosEstructurados } from '@/components/datos-estructurados';
import * as jsonLd from '@/lib/site/datos-estructurados';
import { getByKind, getStats, getTechnologies } from '@/lib/site/queries';
import { ENLACES } from '@/lib/site/enlaces';
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

  /**
   * El titular vive en el frontmatter del perfil y no incrustado aquí: es
   * contenido, y el contenido de este sitio sale siempre de knowledge/. Se usan
   * dos campos propios en lugar del `summary` porque hacen trabajos distintos —
   * el summary describe el documento para el corpus y los datos estructurados;
   * el titular es lo primero que lee una persona.
   */
  const delPerfil = (clave: string): string | null => {
    const valor = presentacion?.metadata[clave];
    return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
  };
  const titular = delPerfil('titular');
  const subtitulo = delPerfil('subtitulo') ?? presentacion?.summary ?? null;

  /**
   * Cifras del hero.
   *
   * Se escriben a mano en el perfil en lugar de contarse del corpus, y es un
   * cambio deliberado respecto a cómo estaba antes. Los recuentos automáticos
   * medían el corpus, no la carrera: «131 fragmentos indexados» es un dato del
   * índice del buscador, y ocupaba el hueco más visible de la página. Las
   * fichas publicadas son además una selección, así que contarlas subestimaba
   * el trabajo real.
   *
   * Si el perfil no las trae, se recurre a los recuentos como antes: el hero
   * nunca se queda vacío.
   */
  /**
   * Proyectos destacados.
   *
   * La portada muestra una selección y no el catálogo entero. Dieciséis fichas
   * con el mismo peso visual significan que ninguna recibe más de la dieciseisava
   * parte de la atención, y elegir seis es en sí mismo una afirmación: dice cuál
   * considero mi mejor trabajo.
   *
   * La marca vive en el frontmatter de cada ficha —`destacado: true`— y no en una
   * lista dentro de este fichero, para que cambiar la selección sea editar un
   * Markdown y reingestar, como el resto del contenido. Sin ninguna marcada se
   * muestran todos, que es el comportamiento anterior.
   */
  const destacados = proyectos.filter((p) => p.metadata['destacado'] === true);
  const proyectosVisibles = destacados.length > 0 ? destacados : proyectos;
  const proyectosOcultos = proyectos.filter((p) => !proyectosVisibles.includes(p));

  /** Las tres últimas etapas a la vista; las anteriores, plegadas. */
  const ETAPAS_VISIBLES = 3;
  const experienciasVisibles = experiencias.slice(0, ETAPAS_VISIBLES);
  const experienciasOcultas = experiencias.slice(ETAPAS_VISIBLES);

  const cifrasPerfil = presentacion?.metadata['cifras'];
  const cifras = Array.isArray(cifrasPerfil)
    ? cifrasPerfil.filter((c): c is string => typeof c === 'string' && c.trim() !== '')
    : [
        `${stats.proyectos} ${stats.proyectos === 1 ? 'proyecto' : 'proyectos'}`,
        `${stats.tecnologias} ${stats.tecnologias === 1 ? 'tecnología' : 'tecnologías'}`,
        ...(stats.primerAno ? [`desde ${stats.primerAno}`] : []),
      ];

  return (
    <>
      <BarraSuperior github={ENLACES.github} linkedin={ENLACES.linkedin} sobreImagen />
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
          {/* El titular va antes que nada y en la tipografía de display: dice
              para qué sirve el trabajo, no qué cargo tiene quien lo hace. Un
              cargo seguido de una enumeración de áreas se lee como un
              currículum; esto se lee como una posición. */}
          {titular ? (
            <p
              className="escena-sube mx-auto max-w-2xl text-[24px] font-medium leading-snug tracking-tight text-ink sm:text-[28px]"
              style={{ '--desde': 0.3 } as React.CSSProperties}
            >
              {titular}
            </p>
          ) : null}

          <p
            className={`escena-sube mx-auto max-w-md text-[14px] leading-relaxed text-ink-muted${
              titular ? ' mt-4' : ''
            }`}
            style={{ '--desde': 0.38 } as React.CSSProperties}
          >
            {subtitulo ??
              'Desarrollo backend, bases de datos e inteligencia artificial. Pregunta en lenguaje natural: el asistente responde con documentación real y cita de dónde sale cada dato.'}
          </p>

          <ul
            className="escena-sube mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-ink-muted"
            style={{ '--desde': 0.45 } as React.CSSProperties}
          >
            {cifras.map((cifra) => (
              <li key={cifra}>{cifra}</li>
            ))}
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
            <>
              {/* Vienen ordenadas de más reciente a más antigua, así que las
                  tres primeras son las tres últimas etapas. Doce entradas
                  seguidas convierten la portada en un currículum; tres dicen
                  dónde está ahora y el resto queda a un clic. */}
              <div className="space-y-6">
                {experienciasVisibles.map((documento) => (
                  <EntradaExperiencia key={documento.slug} documento={documento} />
                ))}
              </div>

              {experienciasOcultas.length > 0 ? (
                <VerMas texto={`Ver las ${experienciasOcultas.length} etapas anteriores`}>
                  <div className="space-y-6">
                    {experienciasOcultas.map((documento) => (
                      <EntradaExperiencia key={documento.slug} documento={documento} />
                    ))}
                  </div>
                </VerMas>
              ) : null}
            </>
          ) : (
            <SeccionVacia mensaje="Todavía no hay experiencias en la base de conocimiento. Añade documentos en knowledge/experiencia/ y ejecuta npm run ingest." />
          )}
        </Seccion>

        <Seccion
          id="proyectos"
          titulo="Algunos proyectos"
          descripcion="Cada ficha recoge el contexto, las decisiones técnicas y lo que salió mal."
        >
          {proyectosVisibles.length > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {proyectosVisibles.map((documento) => (
                  <TarjetaProyecto key={documento.slug} documento={documento} />
                ))}
              </div>

              {proyectosOcultos.length > 0 ? (
                <VerMas texto={`Ver los otros ${proyectosOcultos.length} proyectos`}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {proyectosOcultos.map((documento) => (
                      <TarjetaProyecto key={documento.slug} documento={documento} />
                    ))}
                  </div>
                </VerMas>
              ) : null}
            </>
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

        {/* Llamada a la acción. Va al final del contenido y no antes: quien
            llega hasta aquí ya ha visto la trayectoria y los proyectos, así que
            es el punto donde el mensaje cuesta menos de escribir. El botón de
            la barra superior cubre a quien lo decide antes. */}
        {/*
          El cierre no usa <Seccion> como el resto, y es deliberado. Ese
          componente es un patrón de índice —titular pequeño y uniforme— que
          ayuda a recorrer la página; aquí hace falta lo contrario: peso, porque
          es lo último que se lee y lo único que pide algo.

          El titular va en la tipografía del resto del sitio, a un cuerpo mayor:
          el peso lo da el tamaño, no un cambio de letra.

          Desaparece la coletilla sobre el asistente que había aquí. Un cierre
          que ofrece dos cosas a la vez no pide ninguna, y el asistente ya ocupa
          la mitad del hero.
        */}
        <section
          id="contacto"
          data-aparecer
          className="scroll-mt-20 border-t border-line pt-10"
        >
          <h2 className="text-[22px] font-medium leading-snug tracking-tight text-ink sm:text-[26px]">
            Cuéntame qué quieres construir.
          </h2>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-muted">
            Da igual si es un puesto, un encargo o una idea que todavía no tiene forma. Respondo
            siempre.
          </p>

          <div className="mt-7">
            <FormularioContacto />
          </div>
        </section>

        <Pie github={ENLACES.github} linkedin={ENLACES.linkedin} ano={new Date().getFullYear()} />
      </main>

      <Telemetria />

      {/* Para los buscadores con IA: quién es el sujeto de esta página y qué
          sabe hacer, dicho sin que haya que deducirlo de la prosa. */}
      <DatosEstructurados
        datos={jsonLd.persona({ perfil: presentacion, tecnologias, experiencias })}
      />
      <DatosEstructurados datos={jsonLd.sitioWeb()} />
    </>
  );
}
