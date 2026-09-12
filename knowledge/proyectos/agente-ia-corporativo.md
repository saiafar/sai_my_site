---
title: Lucía, agente de IA conectado al ERP de la empresa
summary: Agente corporativo en Microsoft Teams que responde sobre la documentación interna con búsqueda semántica y consulta el ERP en tiempo real mediante un servidor MCP propio.
organizacion: Cucalón Estévez y Asociados
rol: Diseño y desarrollo completo
inicio: 2025-06
fin: 2026-08
parte_de: experiencia/visados-empresas
tecnologias: [n8n, llm, agentes-ia, mcp, postgresql, pgvector, ollama, microsoft-365, api-rest]
visibilidad: public
---

## Contexto

La información que necesita a diario el equipo de una consultora de movilidad
internacional está repartida entre la documentación interna —servicios,
procedimientos, requisitos por país— y el ERP, donde vive el estado real de cada
proyecto y cada cliente. Preguntar por cualquiera de las dos cosas significaba
buscar en un sitio distinto, o preguntarle a alguien.

El nombre del agente es Lucía, de «Luc-IA».

## Decisiones técnicas

**Dos fuentes, no una.** Un agente que solo consulta documentación responde bien
a «cómo se tramita un permiso» y no sabe nada de «si el proyecto de este cliente
está facturado». Lucía tiene las dos: una base de conocimiento con búsqueda
semántica sobre PostgreSQL con pgvector, y un servidor MCP propio conectado al
ERP para las consultas concretas sobre proyectos o clientes.

Eso permitía preguntarle en lenguaje natural, desde Teams, si un proyecto estaba
facturado, qué archivos había subido un cliente, qué servicio se le prestaba,
qué tareas quedaban pendientes o qué acciones había hecho cada usuario.

**Embeddings generados en local.** Instalé un modelo de embeddings local con
Ollama en el propio servidor para vectorizar la documentación de la empresa. La
razón es doble y ninguna de las dos es técnica: los datos de la empresa no salen
del servidor, y reindexar no cuesta dinero. La generación de respuestas sí se
delega en un servicio externo, que es donde la potencia hace falta de verdad.

**Donde ya está la gente.** El canal es Microsoft Teams, que el grupo ya usaba a
diario, con un bot creado en Azure. Un asistente con su propia aplicación es un
asistente que nadie abre.

## Arquitectura

Teams envía el mensaje al bot de Azure, que lo pasa a n8n como orquestador, y
allí el nodo de IA decide si responde con la base de conocimiento o si consulta
el ERP a través del servidor MCP. La base de conocimiento la carga y la mantiene
un flujo propio.

## Prototipos

Sobre esa misma base probé una plataforma de agentes autoalojada para llevar más
lejos la idea, con un asistente personal multiagente que usaba a diario por
WhatsApp: un subagente escribía la información en un vault de Obsidian
sincronizado con el teléfono, otro consultaba y enviaba correo desde Microsoft
365, y un tercero generaba pequeñas aplicaciones web bajo demanda y las
publicaba en un contenedor.

Los dos primeros funcionaban bien; el tercero publicaba correctamente pero
devolvía mal los resultados. La idea era llevar esas capacidades a Lucía para
todos los empleados, y se quedó en fase de pruebas.
