---
title: Desarrollador full stack y líder técnico en PortalWeb
summary: "Cuatro años en soluciones de punto de venta para el comercio chileno: rescate de la boleta electrónica del SII, cartelería en cajas y balanzas, y dirección de la nueva plataforma Local Conectado."
organizacion: PortalWeb
rol: Desarrollador full stack y líder técnico
inicio: 2018-10
fin: 2023-01
tecnologias: [php, laravel, react, react-native, nodejs, electronjs, socket-io, esp32, arduino, cpp, mysql, sqlite, sql-server, wordpress, google-cloud, aws, linux, figma, cinema-4d, after-effects]
visibilidad: public
---

## El puesto

Cuatro años y tres meses, de octubre de 2018 a enero de 2023, en una empresa
chilena que ofrece a los comercios soluciones completas de punto de venta:
software para cajas, balanzas con pantalla táctil, facturación y boleta
electrónica, y soporte de software y hardware. En cada cliente se instalaba un
PC como servidor local con la base de datos, al que se conectaban cajas y
balanzas.

Trabajé el cien por cien en remoto desde Venezuela, reportando al dueño. Cuando
entré eran cuatro personas; un año antes de mi salida, doce.

No tuve cargo formal: la relación fue informal de principio a fin. Lo que hacía
era desarrollar y, a partir de la segunda mitad, dirigir técnicamente un equipo
de hasta cuatro desarrolladores.

## El problema que me abrió la puerta

El dueño necesitaba resolver un bloqueo concreto: el sistema de punto de venta
estaba hecho en C#, y el envío de documentos al Servicio de Impuestos Internos
lo hacía un módulo precompilado del que no tenían el código. El SII cambió sus
especificaciones, el módulo no se podía actualizar y la emisión de boletas quedó
bloqueada.

Venía de integrar la facturación electrónica argentina con AFIP en NeoSepelios,
así que me llamaron por eso. La integración que construí tiene ficha propia.

## portalDS y las pantallas en el punto de venta

Con mi experiencia en señalización digital propuse añadir pantallas orientadas
al cliente en las cajas y en las balanzas, que mostraran el detalle de la compra
y publicidad, pensadas para la compra de impulso. Desarrollé portalDS, el gestor
de contenidos de esas pantallas, y se integró en las cajas y en la balanza.

Las pantallas le dieron otra cara al producto y la empresa empezó a vender más
balanzas, y con cada balanza vendía el sistema completo. Es el origen del
aumento del sesenta por ciento en ventas, la cifra de mi trayectoria que
considero más sólida.

## Local Conectado

Con el aumento de ventas, el punto de venta antiguo en C# se quedó corto: yo le
daba soporte, pero cada parche provocaba otro problema. Decidimos construir una
plataforma nueva desde cero, y la lideré. Tiene ficha propia, igual que la
balanza con ESP32 que salió de ella.

Formé el equipo por el camino: primero un desarrollador con el que ya había
trabajado en NeoSepelios, después uno para el punto de venta móvil en React
Native y un desarrollador C# para mantener el sistema antiguo mientras
construíamos el nuevo, y finalmente una cuarta persona.

Mantener vivo el sistema que quieres sustituir, mientras lo sustituyes, es
probablemente lo más difícil de este tipo de proyectos, y es la razón por la que
dedicamos una persona entera a ello.

## Aprender sobre la marcha

El dueño quería cambios en la interfaz del punto de venta en C#, y yo nunca
había trabajado con C#. Lo aprendí sobre la marcha e hice los cambios. Mi forma
de trabajar es esa: si no sé algo, lo digo; pero lo investigo y al día siguiente
probablemente ya lo sepa.

## Infraestructura y soporte

Administraba los servidores de la empresa y sus despliegues: un Windows Server
en Google Cloud que alojaba el sistema antiguo, con la base de datos
centralizada desde la que se gestionaban las boletas, y la migración a Linux con
la llegada de Local Conectado.

Daba también soporte directo a los clientes. El sistema antiguo fallaba con
frecuencia, y atender esas llamadas fue uno de los motivos por los que
construimos el nuevo: cuando quien arregla la avería es quien decide la
arquitectura, la decisión sale distinta.

## Marketing

Hice el diseño gráfico, la gestión de redes y los vídeos promocionales de la
balanza y del punto de venta móvil, con el modelado 3D de los equipos en
Cinema 4D y la edición en After Effects. Aquí empecé también a usar Figma para
diseñar interfaces.
