---
title: Asistente profesional con RAG sobre PostgreSQL
summary: Sitio personal con un asistente que responde sobre mi trayectoria usando búsqueda semántica sobre una base de conocimiento propia.
inicio: 2026-09
tecnologias: [postgresql, pgvector, nextjs, typescript, docker, gemini, onnx]
rol: Diseño y desarrollo completo
visibilidad: public
---

## Contexto

Un CV en PDF obliga a quien lo lee a buscar por sí mismo la respuesta a la
pregunta que realmente tiene, que casi nunca es "¿qué títulos tiene?" sino
"¿ha resuelto antes un problema como el mío?". Quería un sitio donde esa
pregunta se pudiera formular directamente y se respondiera con información
verificable de mi propia trayectoria, no con lo que un modelo general
improvisara sobre mí.

## Decisiones técnicas

**PostgreSQL con pgvector en lugar de una base vectorial dedicada.** El corpus
son unos pocos miles de fragmentos. A esa escala, un motor vectorial
especializado no aporta rendimiento apreciable y sí añade un sistema más que
desplegar, respaldar y mantener sincronizado con los datos relacionales. Con
pgvector, los embeddings y los metadatos viven en la misma transacción y se
consultan con un único JOIN.

**Búsqueda híbrida en lugar de solo vectorial.** La búsqueda semántica falla
justo con los nombres propios: "PostgreSQL", "Postgres" y "pgvector" ocupan
posiciones muy próximas en el espacio de embeddings, así que una pregunta por
una tecnología concreta recupera fragmentos sobre tecnologías vecinas. El
índice full-text de PostgreSQL acierta exactamente ahí. Los dos rankings se
fusionan con Reciprocal Rank Fusion, que combina por posición y no por
puntuación, evitando tener que normalizar dos escalas incomparables.

**Embeddings locales, generación en la nube.** El servidor es un mini PC con un
i3 y 8 GB de RAM. Un LLM de generación no cabe ahí, pero un modelo de
embeddings multilingüe cuantizado son 120 MB y vectoriza el corpus entero en
minutos. Separar ambas piezas deja el coste recurrente de la indexación en cero
—se puede reindexar cuarenta veces mientras se afina el chunking— y limita el
gasto externo a las respuestas.

## Retos

El fragmento como unidad de recuperación resultó ser el problema difícil. Con
un corte por ventanas de tamaño fijo, una sección que dice "migramos a
particionado por rango" pierde toda referencia a qué proyecto pertenece y deja
de parecerse a la pregunta que debería recuperarla. La solución fue cortar por
secciones semánticas y anteponer al texto que se vectoriza el título del
documento y la ruta de encabezados, de modo que el vector codifique también el
contexto y no solo el detalle.

## Resultado

Un sitio que sirve a la vez como portfolio y como demostración de la
arquitectura que describe: cada decisión de diseño es explicable y está
documentada en el propio corpus que el asistente consulta.
