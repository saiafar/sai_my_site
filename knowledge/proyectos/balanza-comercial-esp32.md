---
title: Balanza comercial con ESP32 e interfaz POS móvil
summary: "Producto de hardware y software: una balanza que transmite el peso por wifi y bluetooth mediante una placa Arduino ESP32, con interfaz de punto de venta en React Native."
organizacion: Portalweb
rol: Desarrollo de hardware y software
inicio: 2018-10
fin: 2023-01
tecnologias: [arduino, esp32, react-native, javascript]
parte_de: experiencia/portalweb
visibilidad: public
---

## Contexto

Portalweb quiso vender una balanza propia, no solo el software que la usa. Eso
convirtió el encargo en un producto de hardware con su parte de software, no en
un desarrollo web más.

## Qué hace

La balanza transmite el peso por wifi y bluetooth a través de una placa Arduino
ESP32. Del otro lado, una interfaz de punto de venta en React Native recibe ese
peso en un dispositivo móvil.

Los dos canales de transmisión responden a situaciones distintas: bluetooth
para el emparejamiento directo con un dispositivo cercano, wifi para integrarse
en la red del establecimiento.

## Por qué es distinto del resto

Es el único proyecto de mi trayectoria en el que el resultado es un objeto
físico que se vende. Los plazos, los errores y las revisiones no funcionan igual
cuando corregir implica reprogramar placas que ya están montadas.
