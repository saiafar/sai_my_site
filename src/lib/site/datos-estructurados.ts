/**
 * Datos estructurados en JSON-LD.
 *
 * Existe por los buscadores con IA. Un modelo que lee la portada tiene que
 * deducir de la prosa quién es el sujeto, a qué se dedica y qué sabe hacer;
 * schema.org se lo dice sin interpretación de por medio. No sustituye al
 * contenido —lo que se cita sigue siendo el texto— pero elimina la ambigüedad
 * sobre los hechos básicos.
 *
 * El módulo solo construye objetos: ni toca la base de datos ni pinta nada, de
 * modo que se puede comprobar lo que emite sin levantar un navegador.
 *
 * Una regla que se respeta en todo el fichero: **no se declara nada que no se
 * pueda sostener**. Es contenido dirigido a máquinas, y una afirmación falsa
 * ahí es igual de falsa que en el texto visible, solo que nadie la revisa al
 * leer la página.
 */
import { env } from '../env.ts';
import { ENLACES } from './enlaces.ts';
import type { SiteDocument, Technology } from './queries.ts';

/** Identificador estable de la Persona, para referenciarla desde otros nodos. */
const ID_PERSONA = `${env.siteUrl}/#persona`;
const ID_SITIO = `${env.siteUrl}/#sitio`;

type Nodo = Record<string, unknown>;

const CONTEXTO = 'https://schema.org';

/** Quita las claves sin valor: schema.org prefiere la ausencia a un nulo. */
function limpio(nodo: Nodo): Nodo {
  return Object.fromEntries(
    Object.entries(nodo).filter(([, valor]) => {
      if (valor === null || valor === undefined || valor === '') return false;
      if (Array.isArray(valor) && valor.length === 0) return false;
      return true;
    }),
  );
}

const iso = (fecha: Date | null): string | undefined => fecha?.toISOString();

export interface EntradaPersona {
  perfil: SiteDocument | undefined;
  tecnologias: readonly Technology[];
  /** Ordenadas de más reciente a más antigua, como las devuelve getByKind. */
  experiencias: readonly SiteDocument[];
}

/**
 * La Persona.
 *
 * `worksFor` se omite deliberadamente. El cargo sale de la experiencia más
 * reciente, pero esa experiencia tiene fecha de fin: declarar que trabaja hoy
 * en esa empresa sería afirmar algo que dejó de ser cierto, y un dato
 * estructurado desactualizado es peor que ninguno porque se propaga a sitios
 * que ya no controlas.
 */
export function persona({ perfil, tecnologias, experiencias }: EntradaPersona): Nodo {
  const ultima = experiencias[0];
  const cargo = typeof ultima?.metadata['rol'] === 'string' ? ultima.metadata['rol'] : undefined;

  return limpio({
    '@context': CONTEXTO,
    '@type': 'Person',
    '@id': ID_PERSONA,
    // El título del perfil trae el nombre completo; el del sitio, la forma
    // corta con la que se le busca. Las dos ayudan a desambiguar.
    name: perfil?.title ?? env.siteOwner,
    alternateName: perfil?.title === env.siteOwner ? undefined : env.siteOwner,
    url: env.siteUrl,
    description: perfil?.summary ?? undefined,
    jobTitle: cargo,
    knowsAbout: tecnologias.map((t) => t.name),
    sameAs: [ENLACES.linkedin, ENLACES.github],
  });
}

/** El sitio, con la Persona como autora. */
export function sitioWeb(): Nodo {
  return {
    '@context': CONTEXTO,
    '@type': 'WebSite',
    '@id': ID_SITIO,
    url: env.siteUrl,
    name: `${env.siteOwner} — trayectoria profesional`,
    inLanguage: 'es',
    author: { '@id': ID_PERSONA },
  };
}

/**
 * Una ficha.
 *
 * Se emite `TechArticle` y no `SoftwareApplication` ni `CreativeWork` porque lo
 * que hay en la URL es, literalmente, un artículo técnico sobre un proyecto o
 * una etapa: tiene encabezados, cuerpo y autor. Declararlo como el software en
 * sí obligaría a inventar campos que no existen —versión, sistema operativo,
 * precio— y la mayoría de esas fichas no son software.
 */
export function ficha(documento: SiteDocument): Nodo {
  const url = `${env.siteUrl}/${documento.slug}`;

  return limpio({
    '@context': CONTEXTO,
    '@type': 'TechArticle',
    '@id': `${url}#articulo`,
    headline: documento.title,
    description: documento.summary ?? undefined,
    url,
    mainEntityOfPage: url,
    inLanguage: 'es',
    author: { '@id': ID_PERSONA },
    // datePublished es cuándo ocurrió lo que se cuenta; dateModified, cuándo se
    // reingestó el texto. Son cosas distintas y conviene no confundirlas: la
    // primera puede ser de 2013.
    datePublished: documento.startsOn ?? undefined,
    dateModified: iso(documento.updatedAt),
    keywords: documento.technologies.map((t) => t.name),
    isPartOf: { '@id': ID_SITIO },
  });
}

/** Migas de pan: Inicio → tipo → título. */
export function migas(documento: SiteDocument): Nodo {
  const seccion = documento.slug.split('/')[0] ?? documento.kind;

  return {
    '@context': CONTEXTO,
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: env.siteUrl },
      { '@type': 'ListItem', position: 2, name: seccion, item: `${env.siteUrl}/#${seccion}` },
      { '@type': 'ListItem', position: 3, name: documento.title },
    ],
  };
}

export interface PreguntaPublicada {
  pregunta: string;
  /** Respuesta en HTML, ya renderizada desde el Markdown. */
  respuestaHtml: string;
}

export function preguntasFrecuentes(entradas: readonly PreguntaPublicada[]): Nodo {
  return {
    '@context': CONTEXTO,
    '@type': 'FAQPage',
    '@id': `${env.siteUrl}/preguntas#faq`,
    inLanguage: 'es',
    isPartOf: { '@id': ID_SITIO },
    mainEntity: entradas.map((entrada) => ({
      '@type': 'Question',
      name: entrada.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: entrada.respuestaHtml },
    })),
  };
}
