/**
 * Enlaces externos del sitio.
 *
 * Centralizados porque los usan la barra superior, el pie y las dos páginas:
 * repetir la URL en cada sitio garantiza que algún día una de ellas se quede
 * atrás.
 */
export const ENLACES = {
  github: 'https://github.com/saiafar/sai_my_site',
  linkedin: 'https://www.linkedin.com/in/rafaiasvillan/',
  behance: 'https://www.behance.net/rafaiasvillan',
  // El rediseño publica la dirección junto al formulario: quien prefiere su
  // propio correo no debería tener que rellenar tres campos para escribir.
  email: 'rafaiasvillan@gmail.com',
} as const;
