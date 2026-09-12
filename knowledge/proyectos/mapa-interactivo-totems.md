---
title: Mapa interactivo para tótems táctiles de un centro comercial
summary: Directorio y buscador de rutas para cinco tótems del Centro Comercial Costa Azul, con planos animados, «usted está aquí» y rutas paso a paso, funcionando sin conexión.
organizacion: Imvinet C.A.
rol: Diseño de la interfaz, dirección del desarrollo y despliegue
inicio: 2010-09
fin: 2013-03
parte_de: experiencia/imvinet
tecnologias: [actionscript, php, mysql, javascript, jquery, html]
visibilidad: public
---

## Contexto

Cinco tótems con pantalla táctil de gran formato repartidos por el Centro
Comercial Costa Azul, en la Isla de Margarita, para que el visitante encontrara
una tienda y supiera cómo llegar hasta ella.

## Qué hacía

El mapa animado de las dos plantas del centro, con todos sus locales. Cada local
tenía un código de identificación, y desde el gestor se asociaba a su tienda con
el logotipo, el nombre, la información y fotos de la fachada y del interior,
para que la gente la reconociera de un vistazo.

Cada tótem tenía configurada su propia ubicación, así que la información se
mostraba siempre desde donde estaba el visitante. Al pulsar una tienda, el mapa
trazaba la ruta animada desde ese tótem con indicaciones paso a paso.

## Decisiones técnicas

**Rutas precalculadas en lugar de un algoritmo.** Las rutas eran capas animadas
predefinidas para cada tótem, y solo el tramo final se ajustaba según la tienda
concreta dentro de cada pasillo. Con cinco tótems y dos plantas, una animación
diseñada se ve mejor y falla menos que una ruta generada, y el coste de
mantenerla es asumible.

**Despliegue remoto, ejecución local.** Los mapas y la información se enviaban a
distancia a cada tótem y se guardaban en el propio equipo, de modo que el
sistema funcionaba sin conexión y cualquier cambio se volvía a desplegar en
remoto. Un tótem que depende de Internet en un centro comercial es un tótem
apagado la mitad del tiempo.

## Mi papel

El diseño visual y de la interfaz completa —cómo se mostraba y cómo se
navegaba—, la dirección del desarrollo del backend y el despliegue en los
tótems.
