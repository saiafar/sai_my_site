---
title: API de documentos tributarios electrónicos contra el SII de Chile
summary: Integración con el Servicio de Impuestos Internos chileno que mejoró un 70 % el proceso de creación de documentos tributarios electrónicos.
organizacion: Portalweb
rol: Desarrollo
inicio: 2018-10
fin: 2023-01
tecnologias: [php, laravel, xml, api-rest]
parte_de: experiencia/portalweb
visibilidad: public
---

## Contexto

En Chile, la facturación pasa por documentos tributarios electrónicos —los
DTE— que deben emitirse contra el Servicio de Impuestos Internos. Para los
clientes de Portalweb ese trámite era un cuello de botella del proceso de
venta.

## Solución

Una API que se conecta con el SII y encapsula la emisión de los DTE, construida
sobre PHP con Laravel, con XML para los documentos y REST hacia los sistemas
que la consumen.

Integrar con una administración tributaria tiene una particularidad respecto a
integrar con cualquier otra API: el formato no se negocia y los errores no se
reintentan alegremente, porque cada documento emitido tiene consecuencias
fiscales.

## Resultado

Mejora del 70 % en el proceso de creación de documentos tributarios
electrónicos.

## Relación con otros trabajos

Es la segunda integración con una hacienda nacional de mi trayectoria. La
primera fue la conexión con la AFIP argentina en Neo Sepelios, dos años antes.
