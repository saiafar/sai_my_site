---
title: Kronaly, plataforma SaaS de recursos humanos y registro horario
summary: Plataforma multi-tenant desarrollada en solitario, en producción en las cuatro empresas de un grupo, con el registro de jornada conforme a la normativa española.
organizacion: Cucalón Estévez y Asociados
rol: Producto, arquitectura, desarrollo y despliegue
inicio: 2025-03
fin: 2026-08
tecnologias: [laravel, php, react, postgresql, redis, docker, dokploy, api-rest, github-actions]
parte_de: experiencia/visados-empresas
visibilidad: public
destacado: true
---

## Contexto

Kronaly empezó siendo un apaño. El grupo fichaba con el módulo de Turnos de
Microsoft Teams, cuyos informes no servían para nada útil, así que desarrollé un
módulo en PHP que los recibía, los normalizaba y los registraba en condiciones.
De ahí salió la idea de tener herramienta propia.

Lo que era una utilidad interna acabó siendo una plataforma SaaS multi-tenant de
gestión del entorno laboral, pensada para empresas con distintas modalidades de
trabajo y no solo para el grupo.

## Qué hace

En producción: control horario —fichaje de entrada, salida y pausas, jornadas,
auditoría de fichaje y excesos de jornada, horarios—, ausencias y vacaciones con
calendario de festivos y flujo de solicitudes con aprobación, documentos del
empleado y documentación interna, contratos, gestión de empleados con
importación por CSV, equipos con líderes que gestionan los turnos y las
vacaciones de los suyos, formación en documentos y vídeo, y reportes.

Sobre el plan inicial se adelantó un módulo de soporte informático que no estaba
previsto: tickets, inventario de activos con código propio por equipo y
asignación a cada empleado con su historial de incidencias, recursos y base de
conocimiento. Salió de mi propia necesidad como responsable de sistemas de una
plantilla en remoto.

Cada empresa tiene su propio espacio de administración, con los módulos que
activa, sus roles y permisos, y un acceso específico para la Inspección de
Trabajo.

## Multi-tenant desde el origen

Es la decisión estructural del proyecto. El grupo son cuatro empresas, y
separarlas en instalaciones independientes habría multiplicado por cuatro el
coste de mantener, desplegar y actualizar.

Las cuatro lo usan en producción, cada una como un tenant distinto, con hasta
treinta usuarios activos a la vez.

## El registro horario no es una funcionalidad

En España el registro de jornada es una obligación legal, y eso condiciona el
diseño desde el primer día. La plataforma cumple el RD-ley 8/2019 y el artículo
34.9 del Estatuto de los Trabajadores, y está alineada con el marco de registro
horario digital previsto para 2026. Redacté yo el informe de cumplimiento.

Lo que eso significa en el código: identificación inequívoca del trabajador y
marca temporal con zona horaria; trazabilidad completa de cada modificación
—estado anterior, propuesta, quién la pidió, quién la aprobó y cuándo—; borrado
lógico y cadena de integridad para detectar alteraciones; conservación durante
cuatro años con purga registrada; cierre automático de las jornadas olvidadas,
marcado siempre como acción del sistema, porque el sistema no inventa horas; y
cierre mensual con bloqueo y reapertura controlada.

La regla de la que estoy más satisfecho es la de las correcciones: si un
responsable corrige el fichaje en nombre de un empleado, **solo el empleado
puede aprobarlo**. Un superior no puede modificar unilateralmente el registro de
jornada de nadie, que es exactamente lo que la norma persigue.

Para terceros: acceso de solo lectura para la representación legal de los
trabajadores, y para la Inspección de Trabajo un acceso con token, exportación
en CSV y JSON con manifiesto y firma de integridad, y registro de cada consulta
con fecha, IP y datos consultados.

## Arquitectura

Backend en Laravel organizado con diseño dirigido por el dominio, con cada
dominio separado para poder dividir el sistema en servicios independientes si
llega a escalar. Frontend en React, base de datos PostgreSQL, desplegado en
contenedores Docker con ramas de desarrollo, pruebas y producción y despliegue
automático.

## Estado

Lo desarrollé yo solo de principio a fin: producto, arquitectura, desarrollo,
despliegue y la documentación —el plan de desarrollo y el informe de
cumplimiento normativo—. Al terminar la relación laboral, el CEO me cedió todos
los derechos: conservo el código y el dominio.

No está publicado comercialmente. Del plan original quedaron sin implementar el
módulo de bienestar y la aplicación móvil.
