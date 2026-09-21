---
title: Chispa Sport, estadísticas de béisbol y softbol
summary: Plataforma que daba a las ligas amateurs el mismo nivel de estadísticas que una liga profesional, con estadísticas situacionales, API, plugin de WordPress y app móvil.
organizacion: Chispa Sport
rol: Arquitecto y desarrollador único
inicio: 2014-07
fin: 2016-07
parte_de: experiencia/freelance-2014-2016
tecnologias: [php, laravel, postgresql, html, css, javascript, api-rest, wordpress, phonegap]
visibilidad: public
---

## Contexto

En béisbol y softbol el anotador oficial registra a mano cada jugada en una hoja
de papel: la alineación, el detalle por entrada y los totales de bateo, defensa
y lanzadores. Las ligas profesionales convierten eso en estadísticas; las ligas
menores y amateurs, no.

Chispa Sport nació para cerrar esa distancia: centralizar las estadísticas de
ligas, equipos y jugadores y ofrecer a una liga amateur lo mismo que maneja una
profesional.

## Mi papel

Lo desarrollé íntegramente yo: el modelo de datos, el backend, la API, las
aplicaciones móviles y el diseño de las interfaces y del logotipo. El cliente
—con quien trabajaba codo a codo, aunque no había sociedad— se ocupaba de
conseguir las ligas y la parte comercial.

## Decisiones técnicas

**El modelo de datos fue el problema real, no el desarrollo.** La jerarquía
—ligas, campeonatos, equipos, jugadores y temporadas— es la parte fácil. Lo
difícil son los *splits*: el promedio de bateo de un jugador contra lanzadores
zurdos o derechos, con las bases llenas, con dos outs en la última entrada, en
un estadio concreto o frente a un rival determinado.

Eso obliga a guardar mucho más que lo que aparece en la hoja de anotación: hay
que registrar el contexto de cada jugada, no su resultado. Diseñé la base en
PostgreSQL con esa exigencia por delante, y es lo que convirtió el producto en
algo difícil de copiar.

**Distribución flexible.** En lugar de imponer una web, cada liga o equipo podía
tener su sitio completo o instalar un plugin de WordPress conectado a la API y
mostrar en su propia web el calendario, los resultados y las fichas de jugador.

**De PHP nativo a Laravel.** La primera versión era PHP sin framework. La
segunda la migré yo entera a Laravel, con rutas web y rutas API, que es lo que
permitió que el plugin y la aplicación móvil consumieran los mismos datos. Fue
mi primer proyecto con Laravel, el framework con el que más he trabajado desde
entonces.

## La app de anotación

Para eliminar el papel y la carga manual posterior desarrollé una aplicación
móvil con la que el anotador registraba el partido en directo: cada lanzamiento,
el tipo de contacto, la dirección de la bola sobre un diagrama del campo, el
movimiento de los corredores y las sustituciones.

Mientras el anotador anotaba, la aplicación de resultados se actualizaba en
vivo. Lo resolví con consultas periódicas cuidadas: la aplicación preguntaba a
la API si el partido seguía abierto y solo consultaba mientras el usuario estaba
mirando ese partido; en cuanto la API informaba de que estaba cerrado, cargaba
los datos definitivos una sola vez y dejaba de preguntar.

Estaba desarrollada, pero no llegó a publicarse: el proyecto se paralizó en ese
momento.

## Resultado

Unas cinco ligas completas con sus equipos y unos quince equipos más de forma
individual. El mayor alcance fueron las estadísticas de la Liga Venezolana de
Softbol y las de una copa internacional de softbol celebrada en Venezuela.

La aplicación de resultados fue la primera que publiqué en Google Play.

El proyecto se paralizó en 2016 por circunstancias del cliente y la situación
del país. Se mantuvo lo que estaba en marcha, pero no hubo desarrollos nuevos.
