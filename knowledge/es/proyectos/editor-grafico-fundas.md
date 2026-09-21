---
title: Editor gráfico web para personalizar fundas de móvil
summary: Un editor por capas en el navegador, con texto, imágenes, formas y máscaras sobre la plantilla de cada modelo de teléfono, y envío directo a la impresora del cliente.
organizacion: Estudio Creativo Saltamontes C.A.
rol: Diseño y desarrollo completo
inicio: 2013-03
fin: 2014-07
parte_de: experiencia/estudio-creativo-saltamontes
tecnologias: [javascript, canvas, php, html, css]
visibilidad: public
---

## Contexto

Una empresa imprimía carcasas de teléfono personalizadas con fotos y textos.
Necesitaba que el cliente compusiera su diseño él mismo, en el navegador, y que
lo que viera en pantalla fuera exactamente lo que después iba a imprimirse.

## Qué hacía

Al elegir el modelo de teléfono, el editor mostraba la máscara de esa carcasa
concreta: las zonas realmente imprimibles. Sobre ese lienzo se podía añadir
texto —moverlo, rotarlo, cambiar la tipografía, el color, el relleno, el borde y
la sombra—, imágenes que se movían, rotaban y escalaban libremente, formas, y
capas y máscaras aplicadas a las imágenes.

La composición se guardaba y se enviaba a imprimir directamente desde el sistema
a la impresora de fundas del cliente.

## Decisiones técnicas

**Una plantilla por modelo, no un recorte genérico.** La máscara de cada modelo
define dónde están la cámara, los botones y los bordes. Sin eso, el cliente
compone algo que al imprimirse queda cortado y la culpa se la lleva el producto,
no el diseño.

**Todo en el navegador, sin instalar nada.** El editor completo lo desarrollé en
JavaScript sobre canvas. Es, en la práctica, un pequeño Photoshop a medida: el
sistema de capas y máscaras fue la parte más laboriosa y la que hacía posible
todo lo demás.

## Mi papel

El editor lo diseñé y lo desarrollé entero yo.
