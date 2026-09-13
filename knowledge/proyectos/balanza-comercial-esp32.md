---
title: Balanza PW, balanza comercial con ESP32 y punto de venta móvil
summary: "Producto de hardware y software: una balanza que transmite el peso por wifi y bluetooth mediante una placa ESP32, emparejada con MultiPOS PW, el punto de venta móvil en React Native."
organizacion: PortalWeb
rol: Desarrollo de hardware y software
inicio: 2018-10
fin: 2023-01
tecnologias: [arduino, esp32, react-native, javascript]
parte_de: experiencia/portalweb
visibilidad: public
destacado: true
---

## Contexto

PortalWeb quiso vender una balanza propia, la Balanza PW, no solo el software
que la usa. Eso convirtió el encargo en un producto de hardware con su parte de
software, no en un desarrollo web más.

El sistema anterior obligaba a usar siempre el mismo módulo de pesaje, porque
dependía de una biblioteca cerrada que no se podía modificar. Al construir el
software nuevo renovamos también el hardware, y ahí es donde entra el ESP32.

## Qué hace

Programé el ESP32 en Arduino para que controlara el módulo electrónico de
pesaje —la celda de carga— y transmitiera el peso en tiempo real por red, con
conectividad wifi y bluetooth.

La placa levanta además un pequeño servidor web en un puerto: el sistema escanea
la red, consulta ese puerto y la balanza responde con su número de serie, así
que **se detecta y se asocia sola**. En una tienda con varias balanzas, eso es
la diferencia entre instalar y configurar.

Los dos canales de transmisión abrieron dos formas de vender el producto:
por wifi, para comercios con infraestructura de red, con las balanzas
integradas en todo el sistema; y por bluetooth, para comercios pequeños sin red,
con la balanza emparejada directamente con MultiPOS PW, el punto de venta móvil
en React Native. Se llegó a vender solo el módulo de pesaje, sin pantalla,
emparejado con el terminal.

## Por qué es distinto del resto

Es el único proyecto de mi trayectoria en el que el resultado es un objeto
físico que se vende. Los plazos, los errores y las revisiones no funcionan igual
cuando corregir implica reprogramar placas que ya están montadas.
