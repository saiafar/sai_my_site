export type Lang = 'es' | 'en';

export interface Dictionary {
  lang: Lang;
  langLabel: string;
  otherLang: Lang;
  otherLangLabel: string;
  meta: {
    title: string;
    description: string;
  };
  nav: {
    projects: string;
    experience: string;
    stack: string;
    ask: string;
    contact: string;
    faq: string;
    /** Navegación del rediseño: cinco destinos y la llamada a la acción. */
    work: string;
    creative: string;
    lab: string;
    journey: string;
    askSite: string;
    about: string;
    menu: string;
    close: string;
  };
  hero: {
    fallbackSubtitle: string;
    /** Distintivo de disponibilidad, junto al selector de idioma. */
    badge: string;
    scroll: string;
    /** Cifras de la cinta que corre bajo el hero. Admiten {n}. */
    ticker: string[];
  };
  intro: {
    kicker: string;
    /** Tres líneas: se parte por | y la última se pinta en naranja. */
    title: string;
    photoAlt: string;
    /** Lo que va entre ** se pinta destacado. Admite {n}. */
    body: string;
  };
  chat: {
    prompt: string;
    placeholder: string;
    submit: string;
    disclaimer: string;
    sourcesTitle: string;
    clear: string;
    suggestions: string[];
    loading: string;
    /** Versión corta, para el botón mientras busca. */
    searching: string;
    /** Línea de estado bajo la caja: reposo y las tres fases reales. */
    idle: string;
    steps: { vector: string; search: string; write: string };
    /** «✓ respondido con {n} fuentes · {ms} ms». */
    done: string;
    empty: string;
    networkError: string;
  };
  sections: {
    experience: {
      title: string;
      desc: string;
      singular: string;
      plural: string;
      empty: string;
      seeMore: string; // ej. "Ver las {n} etapas anteriores"
    };
    projects: {
      title: string;
      desc: string;
      empty: string;
      seeMore: string; // ej. "Ver los otros {n} proyectos"
    };
    stack: {
      title: string;
      desc: string;
      singular: string;
      plural: string;
      empty: string;
      seeMore: string; // ej. "Ver las otras {n} tecnologías"
    };
    notes: {
      title: string;
      desc: string;
      singular: string;
      plural: string;
    };
    testimonials: {
      title: string;
      desc: string;
      singular: string;
      plural: string;
      empty: string;
      seeMore: string;
      /** Línea de encabezado: «{n} recomendaciones públicas…». */
      kicker: string;
      readAll: string;
      readFull: string;
    };
    work: {
      title: string;
      /** «Cada uno, un capítulo · ( {n} de {total} )». */
      lead: string;
      moreTitle: string;
      moreCta: string;
      cardCta: string;
      empty: string;
    };
    creative: {
      kicker: string;
      title: string;
      desc: string;
      cta: string;
    };
    lab: {
      badge: string;
      title: string;
      desc: string;
      all: string;
      legendTitle: string;
      status: {
        curso: string;
        prototipo: string;
        produccion: string;
        archivado: string;
      };
      empty: string;
    };
    journey: {
      title: string;
      first: string;
      now: string;
      cardCta: string;
      /** «+ {n} etapas anteriores ({desde} – {hasta})». */
      seeMore: string;
      stackTitle: string;
      empty: string;
    };
    assistant: {
      kicker: string;
      title: string;
      desc: string;
      /** Leyenda del mapa, en singular: lo que es cada símbolo. */
      /** Nombre de la sección del perfil en el mapa. */
      mapProfile: string;
      mapSectionsLegend: string;
      mapDocumentsLegend: string;
      mapFragmentsLegend: string;
      mapPath: string;
    };
    about: {
      kicker: string;
      title: string;
      desc: string;
      codeCta: string;
      allCta: string;
    };
    contact: {
      title: string;
      desc: string;
      badge: string;
      emailQuestion: string;
    };
  };
  contactForm: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    successTitle: string;
    successDesc: string;
    errorRequired: string;
    errorEmail: string;
    errorGeneric: string;
    sendAnother: string;
    /** Qué se hace con los datos. Va junto al botón, no en una página aparte. */
    privacy: string;
  };
  detail: {
    back: string;
    technologies: string;
    role: string;
    organization: string;
    period: string;
    links: string;
    notFound: string;
    notFoundDesc: string;
    /** Plantilla de caso: vuelta al índice, numeración y bloques. */
    backToProjects: string;
    caseLabel: string;
    images: string;
    results: string;
    nextCase: string;
  };
  footer: {
    copy: string;
    privacy: string;
  };
  consent: {
    ariaLabel: string;
    message: string;
    decline: string;
    accept: string;
  };
}
