---
title: Cuadro de mando con datos de Holded y del ERP
summary: Consolidación de información de Holded, vía su API, con la del ERP corporativo, para dar a dirección una vista única sobre la que decidir.
organizacion: Visados Empresas
rol: Diseño y desarrollo
inicio: 2025
tecnologias: [holded, api-rest, laravel, php, postgresql, mysql]
parte_de: experiencia/visados-empresas
portada: /imagenes/proyectos/cuadro-de-mando-finanzas.webp
portada_alt: Dashboard de finanzas con el resumen ejecutivo del mes frente al presupuesto y KPIs de productividad
portada_2: /imagenes/proyectos/cuadro-de-mando-automatizacion-ia.webp
portada_2_alt: Módulo de automatización con IA que genera resúmenes ejecutivos y alertas programadas a partir de los dashboards
visibilidad: public
destacado: 8
---

## Contexto

La información de negocio estaba repartida entre Holded y el ERP de la empresa.
Cada sistema respondía bien a sus preguntas, pero las que interesaban a
dirección cruzaban ambos, y responderlas significaba exportar, cuadrar a mano y
repetir el proceso en cada revisión.

## Solución

Un cuadro de mando que extrae los datos de Holded a través de su API y los
combina con los del ERP, presentando una vista única.

El trabajo de integrar dos fuentes que no fueron diseñadas para hablar entre sí
es siempre el mismo: decidir qué entidad de un sistema corresponde a cuál del
otro, y qué hacer cuando no corresponden exactamente.

## Estado

En producción.
