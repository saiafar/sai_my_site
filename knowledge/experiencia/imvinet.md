---
title: Líder de operaciones tecnológicas en Imvinet
summary: Dirección técnica de una empresa de señalización digital y diseño de ACO, el sistema que gestionaba el contenido de más de cien pantallas de clientes como Farmatodo y Empresas Polar.
organizacion: Imvinet C.A.
rol: Líder de operaciones tecnológicas
inicio: 2010-09
fin: 2013-03
tecnologias: [php, mysql, html, javascript, jquery, api-rest, java, cpp, actionscript, json, linux]
visibilidad: public
---

## El puesto

Dos años y medio, de septiembre de 2010 a marzo de 2013, en una empresa
venezolana de señalización digital: pantallas con contenido informativo y
publicitario gestionado a distancia, en clientes como Empresas Polar, las
tiendas y el centro de distribución de Farmatodo y cadenas de licorerías de todo
el país.

Mi cargo era líder de operaciones tecnológicas y en la práctica era el líder
técnico: dirigía el desarrollo y desarrollaba. Empezamos siendo dos
desarrolladores y a mitad de etapa fuimos tres. Reportaba directamente al
director y dueño de la empresa.

Fue mi primer puesto realmente versátil, con varios proyectos a la vez, y la
etapa en la que mi trabajo dejó de ser solo escribir código.

## ACO

El Administrador de Contenidos Online, mi mayor hito en la empresa: el sistema
que separó el contenido de la plantilla para una red de más de cien pantallas.
Tiene ficha propia.

## Gestor de colas para los mostradores de Farmatodo

En las farmacias, el cliente cogía un ticket y el turno se mostraba en un
contador digital con un pulsador. Como los mostradores ya tenían pantallas de
señalización, integré el número de turno en ellas: una banda superior con una
plantilla que mostraba el turno y lo anunciaba en voz alta por síntesis de voz,
mientras el resto de la pantalla seguía con su contenido.

El control desde los puestos de caja fue la parte interesante. Los equipos de
caja eran distintos de los reproductores, aunque compartían red local, así que
hice una aplicación residente en dos piezas: una DLL en C++ que registraba
combinaciones de teclas globales en segundo plano, y un módulo en Java con el
icono en la bandeja del sistema, la configuración y la comunicación en red.

La combinación fue por pragmatismo: la captura global de teclas necesitaba
código nativo, pero la parte de red me resultaba mucho más sencilla y fiable en
Java. La aplicación detectaba automáticamente las pantallas disponibles en la
red y enlazaba cada puesto con la suya.

## Mapa interactivo del Centro Comercial Costa Azul

Un directorio y mapa interactivo para cinco tótems táctiles de gran formato en
un centro comercial de la Isla de Margarita. Tiene ficha propia.

## Infraestructura y preventa

Administraba el servidor Linux de la oficina, donde vivían ACO y el resto de
proyectos, con sus copias de seguridad y sus despliegues. Participaba también en
las reuniones con clientes y preparaba las propuestas tecnológicas: la primera
vez que tuve que explicar una solución a quien la iba a pagar, no a quien la iba
a programar.

## La salida

Salí para cofundar un estudio propio, en buenos términos: seguí dando soporte
hasta encontrar a mi sustituto, del que me encargué yo mismo de la búsqueda y la
selección, y el director de Imvinet nos alquiló una oficina en el mismo edificio.
