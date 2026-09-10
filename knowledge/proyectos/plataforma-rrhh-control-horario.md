---
title: Plataforma de recursos humanos y control horario
summary: Plataforma multi-tenant construida desde cero para gestionar empleados, contratos, jornadas, ausencias y reporting, con auditoría completa.
organizacion: Visados Empresas
rol: Diseño y desarrollo
inicio: 2025
tecnologias: [laravel, php, react, postgresql, redis, docker, api-rest]
parte_de: experiencia/visados-empresas
visibilidad: public
---

## Contexto

Visados Empresas necesitaba gestionar personal y control horario sobre una
plataforma propia. El control horario en España no es una funcionalidad
opcional: el registro de jornada es una obligación legal, y eso condiciona el
diseño desde el primer día —lo que se registra tiene que ser fiable, trazable y
conservarse.

## Arquitectura

La plataforma es multi-tenant. Es la decisión estructural del proyecto: el
grupo tiene varias entidades, y separarlas en instalaciones independientes
habría multiplicado el coste de mantener, desplegar y actualizar por el número
de empresas.

Construida sobre Laravel con PostgreSQL, Redis y React, desplegada en Docker.

## Alcance funcional

Gestión de empleados y contratos, jornadas, vacaciones, ausencias, horas
extraordinarias y documentación asociada. Sobre eso, dos capas transversales:
auditoría y reporting.

La auditoría no es un extra. En un sistema que registra jornada laboral, saber
quién cambió qué y cuándo es parte del propio requisito: un registro que se
puede modificar sin dejar rastro no sirve como registro.

## Estado

En producción y en evolución.
