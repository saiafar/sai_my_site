/**
 * El Lab: proyectos personales y pruebas de tecnología.
 *
 * No viven en `knowledge/` y por tanto el asistente no los cita. La razón es la
 * misma por la que las preguntas frecuentes están fuera del corpus: el corpus es
 * la trayectoria profesional, lo que se puede afirmar de un trabajo hecho para
 * alguien. Un experimento sin cliente, sin plazo y a medio hacer no es una
 * afirmación de ese tipo, y meterlo dentro haría que una pregunta sobre
 * experiencia real pudiera responderse con un juego a medias.
 *
 * Cada entrada lleva su texto en los dos idiomas, como las recomendaciones: son
 * pocas y se escriben a mano, así que un fichero de datos es más barato que una
 * tabla y una pantalla de administración.
 */
import type { Lang } from '../i18n';

/** Para qué sirve el filtro. Solo aparecen las categorías que tienen algo. */
export type CategoriaLab = 'ia' | 'hardware' | 'graficos' | 'juegos' | 'herramientas';

/**
 * En qué punto está. Es la única promesa que hace esta sección: lo que está a
 * medias se dice que está a medias.
 */
export type EstadoLab = 'curso' | 'prototipo' | 'produccion' | 'archivado';

/**
 * Qué se pinta en la cabecera de la tarjeta.
 *
 * `imagen` es una captura real. `chat` y `hud` son recreaciones dibujadas con
 * HTML, y van rotuladas como tales: un experimento a medias no tiene captura
 * que enseñar, y una imagen de archivo que insinúe un producto terminado sería
 * mentir sobre el estado del trabajo. `bloque` es el caso en que no hay ni una
 * cosa ni la otra y queda solo el color.
 */
export type VisualLab = 'imagen' | 'chat' | 'hud' | 'bloque';

export interface Experimento {
  id: string;
  categoria: CategoriaLab;
  estado: EstadoLab;
  /** Rótulo propio de la ficha: «IA · educación», «Juego · pixel art». */
  etiqueta: string;
  titulo: string;
  resumen: string;
  visual: VisualLab;
  /** Color de la cabecera de la tarjeta. */
  colorVisual: string;
  /** La tarjeta entera en tinta, para romper la fila. */
  invertida?: boolean;
  imagen?: string;
  imagenAlt?: string;
  /** Algo que se puede abrir y probar. Sin enlace no se pinta ninguno. */
  enlace?: string;
  enlaceTexto?: string;
}

interface Localizado {
  etiqueta: string;
  titulo: string;
  resumen: string;
  imagenAlt?: string;
  enlaceTexto?: string;
}

interface ExperimentoData {
  id: string;
  categoria: CategoriaLab;
  estado: EstadoLab;
  visual: VisualLab;
  colorVisual: string;
  invertida?: boolean;
  imagen?: string;
  enlace?: string;
  es: Localizado;
  en: Localizado;
}

export const CATEGORIAS_LAB: Record<CategoriaLab, Record<Lang, string>> = {
  ia: { es: 'IA', en: 'AI' },
  hardware: { es: 'Hardware', en: 'Hardware' },
  graficos: { es: 'Gráficos', en: 'Graphics' },
  juegos: { es: 'Juegos', en: 'Games' },
  herramientas: { es: 'Herramientas', en: 'Tools' },
};

/** El símbolo de cada estado. El texto lo pone el diccionario. */
export const SIMBOLO_ESTADO: Record<EstadoLab, string> = {
  curso: '●',
  prototipo: '◐',
  produccion: '✓',
  archivado: '○',
};

const EXPERIMENTOS: ExperimentoData[] = [
  {
    id: 'tutor-eso',
    categoria: 'ia',
    estado: 'curso',
    visual: 'chat',
    colorVisual: 'bg-lila',
    es: {
      etiqueta: 'IA · educación',
      titulo: 'Tutor ESO',
      resumen:
        'Un agente de IA que no da la respuesta: enseña a resolver, organiza el estudio y detecta puntos débiles.',
    },
    en: {
      etiqueta: 'AI · education',
      titulo: 'Tutor ESO',
      resumen:
        'An AI agent that does not hand over the answer: it teaches how to solve, organises study time and spots weak points.',
    },
  },
  {
    id: 'nueva-vida-en-cristo',
    categoria: 'herramientas',
    estado: 'curso',
    // La captura de la app muestra la lista de alumnos con sus nombres
    // completos, así que no se publica hasta tener uno con datos de ejemplo.
    // Vale lo mismo que para las capturas de Kronaly.
    visual: 'bloque',
    colorVisual: 'bg-crema-honda',
    enlace: 'https://nvc-demo.rafaiasvillan.com/',
    es: {
      etiqueta: 'App · sin ánimo de lucro',
      titulo: 'Nueva Vida en Cristo',
      resumen:
        'App de discipulado: el maestro guía a su grupo paso a paso por el curso y sigue el avance de cada alumno.',
      enlaceTexto: 'Probar la demo →',
    },
    en: {
      etiqueta: 'App · non-profit',
      titulo: 'Nueva Vida en Cristo',
      resumen:
        'A discipleship app: the teacher walks their group through the course step by step and follows each student’s progress.',
      enlaceTexto: 'Try the demo →',
    },
  },
  {
    id: 'metro-fighter',
    categoria: 'juegos',
    estado: 'curso',
    visual: 'hud',
    colorVisual: 'bg-[#2a1e3a]',
    invertida: true,
    es: {
      etiqueta: 'Juego · pixel art',
      titulo: 'Metro Fighter',
      resumen:
        'Peleas 2D en el Metro de Caracas: llega al trabajo antes de las 8:00 y en el mejor estado posible.',
    },
    en: {
      etiqueta: 'Game · pixel art',
      titulo: 'Metro Fighter',
      resumen:
        '2D fighting in the Caracas metro: get to work before 8:00 and in the best shape you can manage.',
    },
  },
  {
    id: 'cielo-con-tu-clima',
    categoria: 'graficos',
    estado: 'curso',
    visual: 'imagen',
    colorVisual: 'bg-noche',
    // La propia ilustración del hero: el experimento es hacerla cambiar con la
    // hora y el clima, así que la imagen de la ficha es su estado de hoy.
    imagen: '/fondos/atardecer/fondo-hero-0-828.webp',
    es: {
      etiqueta: 'Gráficos · esta web',
      titulo: 'Un cielo que sigue tu clima',
      resumen:
        'El hero de esta web, en pixel art, cambia con la hora y el tiempo real de donde estés.',
      imagenAlt: 'Atardecer en pixel art, la ilustración del hero de este sitio',
    },
    en: {
      etiqueta: 'Graphics · this site',
      titulo: 'A sky that follows your weather',
      resumen:
        'The hero of this site, in pixel art, shifts with the local time and the real weather where you are.',
      imagenAlt: 'Pixel-art sunset, the hero illustration of this site',
    },
  },
];

export function getExperimentos(lang: Lang = 'es'): Experimento[] {
  return EXPERIMENTOS.map((item) => {
    const loc = lang === 'en' ? item.en : item.es;
    return {
      id: item.id,
      categoria: item.categoria,
      estado: item.estado,
      etiqueta: loc.etiqueta,
      titulo: loc.titulo,
      resumen: loc.resumen,
      visual: item.visual,
      colorVisual: item.colorVisual,
      ...(item.invertida ? { invertida: true } : {}),
      ...(item.imagen ? { imagen: item.imagen } : {}),
      ...(loc.imagenAlt ? { imagenAlt: loc.imagenAlt } : {}),
      ...(item.enlace ? { enlace: item.enlace } : {}),
      ...(loc.enlaceTexto ? { enlaceTexto: loc.enlaceTexto } : {}),
    };
  });
}
