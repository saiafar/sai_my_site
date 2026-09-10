# Logo

| Fichero | Qué es |
|---|---|
| `logo-original.png` | El logo tal como se recibió: PNG de 58 × 57 px. |
| `logo.svg` | **Maestro.** Reconstrucción vectorial del anterior; todos los iconos del sitio salen de aquí. |

`npm run icons` regenera a partir de `logo.svg` el favicon, el icono de iOS y la
copia que usa la web.

## Cómo se obtuvo el SVG

A 58 px el PNG no sirve para el hero: en una pantalla retina se ve borroso a
partir de unos 30 px de ancho. Se vectorizó una sola vez, separando sus dos
piezas:

- **El círculo** se ajustó por mínimos cuadrados a 630 puntos del borde,
  descartando los 90 donde las letras lo rompen. Error cuadrático medio: 0,22 px.
  Es un círculo geométrico, no un trazado.
- **Las letras** se trazaron con potrace sobre el canal alfa ampliado ×16 y
  desenfocado, para que la escalera de píxeles del original se convierta en
  rectas y curvas en lugar de en ondas.
- **El degradado** es lineal y vertical, `#ff7744` → `#ff5a69`, medido sobre el
  original.

Comparado con el PNG en la misma rejilla, difiere un 1,46 % de media. La
diferencia está en el suavizado del borde y en que el original viene recortado
arriba y abajo (el círculo mide 57,4 px en un lienzo de 57); la forma coincide.

**Si existe el original vectorial** (SVG, AI, PDF o un PNG grande de quien diseñó
el logo), sustituye `logo.svg` por él y ejecuta `npm run icons`. Siempre será más
fiel que una reconstrucción desde 58 px.
