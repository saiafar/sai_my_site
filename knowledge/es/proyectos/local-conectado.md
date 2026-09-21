---
title: Local Conectado, plataforma de punto de venta para el comercio
summary: "Ecosistema que sustituyó a un punto de venta heredado en C#: servidor local, balanza táctil, caja, punto de venta móvil y cartelería digital funcionando como un solo sistema."
organizacion: PortalWeb
rol: Liderazgo técnico y desarrollo
inicio: 2020-01
fin: 2023-01
tecnologias: [php, laravel, react, react-native, nodejs, electronjs, socket-io, sqlite, javascript, linux, google-cloud]
parte_de: experiencia/portalweb
visibilidad: public
destacado: true
---

## Contexto

PortalWeb vendía a los comercios chilenos soluciones completas de punto de
venta, con un sistema heredado escrito en C#. Yo le daba soporte, y cada parche
provocaba otro problema: no se adaptaba a los cambios y adaptarlo significaba
rehacerlo. Decidimos construir una plataforma nueva desde cero, y la lideré.

Local Conectado se llama así porque esa es la idea: la balanza, la caja, el
punto de venta móvil, las pantallas y el gestor de turnos funcionando como un
único sistema dentro del comercio, no como productos sueltos.

## Las piezas

**El servidor local del comercio**, con la base de datos, al que se conectan
todos los demás equipos.

**La Balanza PW**, con interfaz en React y backend en Laravel corriendo en ese
servidor local, sobre una base de datos independiente de la del sistema antiguo.
Tiene ficha propia por su parte de hardware.

**El punto de venta de caja** y **MultiPOS PW**, el punto de venta móvil: una
aplicación en React Native para un terminal Android con impresora, que se
conecta a las balanzas por bluetooth. Fui su líder técnico desde la
conceptualización hasta el despliegue.

**portalDS**, el gestor de contenidos de las pantallas de cartelería digital del
local, orientadas al cliente, que muestran el detalle de la compra y publicidad
pensando en la compra de impulso. Fue una propuesta mía a partir de mi
experiencia previa en señalización digital, y es lo que impulsó la venta de
balanzas.

**El gestor de turnos**, integrado en la balanza y en la caja para los
mostradores de charcutería o carnicería, con el turno visible en un contador
junto a la balanza o en las propias pantallas.

## Ventas flotantes

La decisión funcional que mejor resume el proyecto. En el sistema antiguo, una
venta empezada en una balanza quedaba atrapada en esa balanza. En el nuevo, se
recupera desde cualquier otra seleccionando al vendedor, y se pueden tener
varias ventas abiertas a la vez hasta cerrarlas.

Parece un detalle y no lo es: cambia cómo trabaja el dependiente en una
carnicería con tres balanzas y cola en todas.

## Balanza de autoservicio

Para comercios grandes de frutas y verduras. El cliente coloca el producto, lo
selecciona en la pantalla y la balanza imprime una etiqueta con un código que
pega en la bolsa. Al pasar por caja, el punto de venta lee ese código y lo
enlaza con la etiqueta generada, lo que permite comprobar producto y peso.

## Sustituir sin apagar

Lo más difícil de un proyecto así no es construir lo nuevo: es mantener vivo lo
viejo mientras tanto. Por eso, del equipo de hasta cuatro desarrolladores que
formé, uno se dedicaba exclusivamente a mantener el sistema en C# mientras el
resto construíamos el sustituto.
