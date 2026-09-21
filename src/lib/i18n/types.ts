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
  };
  hero: {
    fallbackSubtitle: string;
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
    contact: {
      title: string;
      desc: string;
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
  };
  detail: {
    back: string;
    technologies: string;
    role: string;
    organization: string;
    links: string;
    notFound: string;
    notFoundDesc: string;
  };
  footer: {
    copy: string;
    privacy: string;
  };
}
