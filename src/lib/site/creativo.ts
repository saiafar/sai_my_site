/**
 * Trabajo gráfico: identidad, 3D y vídeo.
 *
 * Está aquí y no en `knowledge/` por la misma razón que el Lab: el corpus
 * responde preguntas sobre la trayectoria de ingeniería, y un logo no se
 * explica con un párrafo citable. La sección es una galería con enlace a donde
 * están publicadas las piezas.
 *
 * Cada entrada es una imagen con su pie y su texto alternativo, en los dos
 * idiomas. El pie se escribe entero y no se compone de trozos («cliente» +
 * «qué se hizo») porque no todas las piezas tienen cliente: dos son renders de
 * arquitectura y una es un personaje.
 */
import type { Lang } from '../i18n';

export interface PiezaCreativa {
  id: string;
  /** Ruta bajo /public, ya convertida a WebP por `npm run imagenes`. */
  imagen: string;
  pie: string;
  alt: string;
  /** La primera ocupa el doble de ancho y de alto en la rejilla. */
  destacada?: boolean;
}

interface PiezaData {
  id: string;
  imagen: string;
  destacada?: boolean;
  es: { pie: string; alt: string };
  en: { pie: string; alt: string };
}

const PIEZAS: PiezaData[] = [
  {
    id: 'arquitectura-usa',
    imagen: '/imagenes/creativo/arquitectura-usa.webp',
    destacada: true,
    es: {
      pie: 'render + vídeo · propuesta arquitectónica EE. UU.',
      alt: 'Render de una vivienda unifamiliar con jardín y fuente',
    },
    en: {
      pie: 'render + video · architectural proposal, USA',
      alt: 'Render of a detached house with a garden and a fountain',
    },
  },
  {
    id: 'personaje-3d',
    imagen: '/imagenes/creativo/personaje-3d.webp',
    es: { pie: '3D · personaje', alt: 'Personaje 3D con casco y armadura' },
    en: { pie: '3D · character', alt: '3D character wearing a helmet and armour' },
  },
  {
    id: 'arquitectura-casa',
    imagen: '/imagenes/creativo/arquitectura-casa.webp',
    es: { pie: 'modelado + render', alt: 'Render de una casa de dos plantas con garaje triple' },
    en: { pie: 'modelling + render', alt: 'Render of a two-storey house with a triple garage' },
  },
  {
    id: 'dcolores',
    imagen: '/imagenes/creativo/dcolores.webp',
    es: { pie: 'DColores · logo', alt: 'Logo de DColores, una mariposa multicolor' },
    en: { pie: 'DColores · logo', alt: 'DColores logo, a multicoloured butterfly' },
  },
  {
    id: 'fate-tax',
    imagen: '/imagenes/creativo/fate-tax.webp',
    es: { pie: 'Fate Tax · logo + web', alt: 'Logo de Fate Tax Services con un león' },
    en: { pie: 'Fate Tax · logo + website', alt: 'Fate Tax Services logo with a lion' },
  },
  {
    id: 'mantishop',
    imagen: '/imagenes/creativo/mantishop.webp',
    es: { pie: 'MantiShop · identidad', alt: 'Identidad de MantiShop aplicada en una camiseta' },
    en: { pie: 'MantiShop · identity', alt: 'MantiShop identity applied to a T-shirt' },
  },
  {
    id: 'sanchez-tree-service',
    imagen: '/imagenes/creativo/sanchez-tree-service.webp',
    es: { pie: 'Sánchez Tree Service · logo', alt: 'Logo de Sánchez Tree Service con un árbol' },
    en: { pie: 'Sánchez Tree Service · logo', alt: 'Sánchez Tree Service logo with a tree' },
  },
  {
    id: 'tony-astra',
    imagen: '/imagenes/creativo/tony-astra.webp',
    es: { pie: 'Tony Astra · logo + skin', alt: 'Logo de Tony Astra en una alfombrilla de ratón' },
    en: { pie: 'Tony Astra · logo + skin', alt: 'Tony Astra logo on a mouse mat' },
  },
];

export function getPiezasCreativas(lang: Lang = 'es'): PiezaCreativa[] {
  return PIEZAS.map((pieza) => ({
    id: pieza.id,
    imagen: pieza.imagen,
    ...(pieza.destacada ? { destacada: true } : {}),
    ...(lang === 'en' ? pieza.en : pieza.es),
  }));
}
