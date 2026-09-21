---
title: Líder de proyecto en NeoSepelios
summary: Rediseño de la plataforma de cartelería digital para funerarias y dirección de un equipo en remoto, con un sistema de ventas en tablet integrado con la AFIP argentina.
organizacion: NeoSepelios
rol: Desarrollador PHP y después líder de proyecto
inicio: 2016-07
fin: 2018-10
tecnologias: [php, lumen, angularjs, mysql, api-rest, html, css, javascript]
visibilidad: public
---

## El puesto

Dos años y tres meses, de julio de 2016 a octubre de 2018 (abarcando todo el año 2017), en una empresa
argentina de señalización digital especializada en funerarias, un nicho muy
concreto que después amplió su oferta con software de ventas y gestión para ese
mismo sector.

Trabajé el cien por cien en remoto desde Venezuela, reportando directamente al
CEO y dueño, que me contrató precisamente por mi experiencia previa en
señalización digital.

Entré para dar soporte al sistema de cartelería que ya existía. Propuse
rediseñarlo, lo reconstruí, y a partir de ahí la empresa amplió el equipo con
dos desarrolladores y pasé a líder de proyecto: dirigía el equipo y seguía
desarrollando.

## La nueva plataforma de cartelería

El sistema de partida eran pantallas con mini PC Android que abrían un WebView
apuntando a una URL: una página en PHP que recibía el cliente por parámetro,
buscaba sus datos y mostraba la plantilla correspondiente.

La plataforma que construí era más sencilla que ACO —sin plantillas dinámicas—
pero con una administración mucho más completa: una vista web universal que
funcionaba igual en un navegador que en el WebView de una pantalla, una parrilla
de programación con rotación de contenidos y cambio de vista por franja horaria,
datos propios por pantalla y un panel para gestionar clientes, pantallas,
contenidos y programación.

La construí con Lumen, el microframework de Laravel orientado a APIs, y
AngularJS tanto en el panel como en las vistas de las pantallas. Aquí empecé con
Angular.

## Ventas para funerarias, con facturación electrónica

Una aplicación web para tablet, a medio camino entre un ERP y un punto de venta,
para funerarias premium. Tiene ficha propia.

## Mensajes de condolencia en las pantallas

Un módulo para que familiares y amigos que no podían asistir enviaran un mensaje
con una imagen que se mostraba en la pantalla de la sala, dentro de la rotación
de la parrilla. Al contratar el servicio, la familia recibía un enlace para
compartir.

La parte delicada era la moderación, porque el contenido lo escribían terceros y
aparecía en un velatorio: un filtro de palabras censuraba automáticamente los
textos, y un familiar con acceso de administrador tenía que aprobar cada imagen
antes de publicarse.

Es el proyecto en el que tuve más presente que detrás de una pantalla hay una
situación concreta, y que el software tenía que estar a la altura de ella.

## Resultados

El rediseño de la cartelería y los servicios nuevos ampliaron la oferta de la
empresa y atrajeron clientes. De aquella etapa recuerdo un crecimiento
aproximado del cincuenta por ciento en ventas, una cifra que manejo con
prudencia porque viene de la memoria y no de un informe.
