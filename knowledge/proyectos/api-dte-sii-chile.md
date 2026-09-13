---
title: API de documentos tributarios electrónicos contra el SII de Chile
summary: "Integración propia con el Servicio de Impuestos Internos chileno que desbloqueó la emisión de boletas electrónicas cuando el módulo del proveedor dejó de poder actualizarse."
organizacion: Portalweb
rol: Desarrollo
inicio: 2018-10
fin: 2023-01
tecnologias: [php, laravel, xml, api-rest]
parte_de: experiencia/portalweb
visibilidad: public
destacado: true
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

La emisión de boletas electrónicas volvió a funcionar, y dejó de depender de un
módulo cerrado que no se podía actualizar: a partir de ahí, cada cambio de
especificación del SII se resolvía en código propio.

Con la API ya en marcha, desarrollé además un plugin de WordPress para que los
clientes que vendían por Internet emitieran también sus boletas a través de
ella, algo que antes no era posible.

## Relación con otros trabajos

Es la segunda integración con una hacienda nacional de mi trayectoria. La
primera fue la conexión con la AFIP argentina en Neo Sepelios, dos años antes.
