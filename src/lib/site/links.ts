import { query } from '@/lib/db';

export interface EnlaceAdicional {
  id: string;
  titulo: string;
  url: string;
  subtitulo?: string;
  icono?: string;
  activo: boolean;
}

export interface ConfiguracionLinks {
  nombre: string;
  titular: string;
  ubicacion: string;
  telefono: string;
  email: string;
  web: string;
  linkedin: string;
  behance: string;
  cvUrl?: string | undefined;
  cvTitulo?: string | undefined;
  enlacesExtra: EnlaceAdicional[];
}

export const CONFIG_LINKS_DEFECTO: ConfiguracionLinks = {
  nombre: 'Rafaías Villán',
  titular: 'Desarrollo backend, datos e IA',
  ubicacion: 'A Coruña, España',
  telefono: '+34 665078084',
  email: 'rafaiasvillan@gmail.com',
  web: 'https://rafaiasvillan.com/',
  linkedin: 'https://www.linkedin.com/in/rafaiasvillan',
  behance: 'https://www.behance.net/rafaiasvillan',
  cvUrl: '/cv-rafaias-villan-desarrollador.pdf',
  cvTitulo: 'CV PDF Rafaias Villan Desarrollador',
  enlacesExtra: [],
};

const CACHE_MS = 10_000;
let cache: { valor: ConfiguracionLinks; hasta: number } | undefined;

export async function leerConfiguracionLinks(): Promise<ConfiguracionLinks> {
  if (cache && cache.hasta > Date.now()) {
    return cache.valor;
  }

  try {
    const filas = await query<{ value: unknown }>(
      'select value from site_settings where key = $1',
      ['links.config'],
    );

    const primera = filas[0];
    if (primera && primera.value && typeof primera.value === 'object') {
      const v = primera.value as Partial<ConfiguracionLinks>;
      const config: ConfiguracionLinks = {
        nombre: typeof v.nombre === 'string' && v.nombre.trim() ? v.nombre.trim() : CONFIG_LINKS_DEFECTO.nombre,
        titular: typeof v.titular === 'string' && v.titular.trim() ? v.titular.trim() : CONFIG_LINKS_DEFECTO.titular,
        ubicacion: typeof v.ubicacion === 'string' ? v.ubicacion.trim() : CONFIG_LINKS_DEFECTO.ubicacion,
        telefono: typeof v.telefono === 'string' ? v.telefono.trim() : CONFIG_LINKS_DEFECTO.telefono,
        email: typeof v.email === 'string' ? v.email.trim() : CONFIG_LINKS_DEFECTO.email,
        web: typeof v.web === 'string' ? v.web.trim() : CONFIG_LINKS_DEFECTO.web,
        linkedin: typeof v.linkedin === 'string' ? v.linkedin.trim() : CONFIG_LINKS_DEFECTO.linkedin,
        behance: typeof v.behance === 'string' ? v.behance.trim() : CONFIG_LINKS_DEFECTO.behance,
        cvUrl: typeof v.cvUrl === 'string' ? v.cvUrl.trim() : CONFIG_LINKS_DEFECTO.cvUrl,
        cvTitulo: typeof v.cvTitulo === 'string' && v.cvTitulo.trim() ? v.cvTitulo.trim() : CONFIG_LINKS_DEFECTO.cvTitulo,
        enlacesExtra: Array.isArray(v.enlacesExtra) ? v.enlacesExtra : [],
      };
      cache = { valor: config, hasta: Date.now() + CACHE_MS };
      return config;
    }
  } catch (error) {
    console.error('Error al leer la configuración de links desde la base de datos:', error);
  }

  return CONFIG_LINKS_DEFECTO;
}

export async function guardarConfiguracionLinks(config: ConfiguracionLinks): Promise<void> {
  const normalizada: ConfiguracionLinks = {
    nombre: config.nombre?.trim() || CONFIG_LINKS_DEFECTO.nombre,
    titular: config.titular?.trim() || CONFIG_LINKS_DEFECTO.titular,
    ubicacion: config.ubicacion?.trim() ?? '',
    telefono: config.telefono?.trim() ?? '',
    email: config.email?.trim() ?? '',
    web: config.web?.trim() ?? '',
    linkedin: config.linkedin?.trim() ?? '',
    behance: config.behance?.trim() ?? '',
    cvUrl: config.cvUrl !== undefined ? config.cvUrl.trim() : CONFIG_LINKS_DEFECTO.cvUrl,
    cvTitulo: config.cvTitulo?.trim() || CONFIG_LINKS_DEFECTO.cvTitulo,
    enlacesExtra: Array.isArray(config.enlacesExtra)
      ? config.enlacesExtra.map((e) => ({
          id: e.id || crypto.randomUUID(),
          titulo: e.titulo?.trim() || '',
          url: e.url?.trim() || '',
          subtitulo: e.subtitulo?.trim() || '',
          icono: e.icono || 'otro',
          activo: Boolean(e.activo),
        }))
      : [],
  };

  await query(
    `insert into site_settings (key, value)
     values ($1, $2::jsonb)
     on conflict (key)
       do update set value = excluded.value, updated_at = now()`,
    ['links.config', JSON.stringify(normalizada)],
  );

  cache = undefined;
}
