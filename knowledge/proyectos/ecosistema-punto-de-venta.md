---
title: Ecosistema de servicios para puntos de venta
summary: Conjunto de servicios conectados al POS —cartelera digital, gestor de turnos y balanza de autoservicio— que elevaron las ventas de la compañía un 60 %.
organizacion: Portalweb
rol: Desarrollo y liderazgo técnico
inicio: 2018-10
fin: 2023-01
tecnologias: [php, laravel, nodejs, expressjs, electronjs, react, sqlite, javascript, socket-io]
parte_de: experiencia/portalweb
visibilidad: public
---

## Contexto

Portalweb vendía software para puntos de venta en Chile. La oportunidad no
estaba en el POS en sí, que ya existía, sino en los servicios que podían
conectarse a él y que el cliente no tenía.

## Qué se construyó

**Cartelera digital conectada al POS.** Las pantallas del establecimiento
muestran información que sale del propio punto de venta en lugar de contenido
cargado a mano. Construida con PHP y Laravel en servidor, Node.js para la
comunicación y Electron para la aplicación que corre en el equipo de la
pantalla.

**Gestor de turnos.** Node.js con Express.

**Balanza de autoservicio.** Interfaz para que el cliente pese el producto y
obtenga su propio vale, sin pasar por un dependiente. Node.js y React, con
SQLite en local.

Alrededor de esas tres piezas, varios microservicios más.

## Por qué separados

Cada servicio se vende por separado y funciona por separado, y esa es la razón
de que sean piezas distintas y no módulos de una aplicación: un cliente puede
querer la cartelera sin la balanza. También significa que un fallo en el gestor
de turnos no deja la tienda sin pantallas.

## Resultado

El conjunto de estos servicios elevó las ventas de la compañía un 60 %.
