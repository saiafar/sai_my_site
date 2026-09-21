---
title: ACO, gestor de contenidos para una red de pantallas
summary: Sistema que separó el contenido de la plantilla en más de cien pantallas de señalización digital, con programación horaria, sincronización por API y funcionamiento sin conexión.
organizacion: Imvinet C.A.
rol: Diseño de la solución y desarrollo
inicio: 2010-09
fin: 2013-03
parte_de: experiencia/imvinet
tecnologias: [php, mysql, api-rest, java, actionscript, json, javascript, jquery, html]
visibilidad: public
---

## Contexto

Las pantallas de señalización digital funcionaban con plantillas organizadas en
una parrilla de programación, y el contenido iba incrustado dentro de cada
plantilla. Cambiar un solo dato —un precio, un texto— obligaba a republicar la
parrilla completa y esperar a que se sincronizara y se recargara en el
reproductor. Si en ese momento el reproductor no tenía Internet, el cambio
sencillamente no llegaba.

Con más de cien pantallas repartidas entre la fábrica de Empresas Polar, las
tiendas y el centro de distribución de Farmatodo y clientes de todo el país, eso
era el cuello de botella del negocio.

## Decisiones técnicas

**Separar el contenido de la plantilla.** Las plantillas dejaron de llevar los
datos dentro y pasaron a leerlos de una base local en el propio reproductor.
Desde un panel web se ve qué plantillas hay publicadas en cada cliente y se
cambia lo que muestran, sin tocar la parrilla.

**Sincronizar en vez de publicar.** Un agente escrito en Java, instalado en cada
reproductor, consulta periódicamente la API, compara con lo que ya tiene y
descarga solo lo que ha cambiado: textos, imágenes, vídeos y sonidos. Todo queda
en local, así que las pantallas siguen funcionando aunque se caiga la conexión.
Fue mi primer sistema con una API.

**Plantillas con campos configurables.** Desde el gestor se da de alta cada
plantilla y se define cuántos campos tiene y de qué tipo: fondo, título, texto,
sonido. Cada plantilla puede tener una estructura distinta, y una vez definida
se le carga contenido y se programa. Esa es la clave de su versatilidad.

**Independencia tecnológica de la plantilla.** Como la plantilla lee sus datos
en local, da igual con qué esté hecha. Eso permitió pasar de Flash a HTML sin
tocar el sistema, algo que no habría sido posible con el contenido incrustado.
Es la decisión que mejor ha envejecido.

## Programación de contenidos

Para una fecha y hora concretas, por franjas horarias recurrentes —una plantilla
muestra un contenido por la mañana y otro por la noche— o por días. Texto,
imágenes, vídeo y sonido.

## Arquitectura

Panel y backend en PHP con MySQL, primero en PHP nativo y después reescritos
sobre un framework; una API REST que expone a los reproductores el contenido
programado; el agente en Java en cada equipo; y en el reproductor, un archivo
maestro con la definición de las plantillas y una carpeta por plantilla con su
programación y sus recursos. Las plantillas animadas, en ActionScript 3 y
después en HTML.

## Mi papel

La concepción y el diseño de la solución completa —panel, API, agente y formato
de datos en el reproductor—, el desarrollo del panel y de la API, el agente en
Java, el módulo de plantillas, y el diseño de la interfaz, el nombre y el
logotipo. El desarrollo lo hice en pareja con otro desarrollador al que propuse
incorporar a la empresa.
