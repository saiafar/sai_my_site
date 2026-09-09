# Base de conocimiento

Estos ficheros son la **única fuente de verdad** del sitio. Las tablas de
PostgreSQL son una proyección generada por `npm run ingest`: se pueden borrar y
reconstruir enteras sin perder nada.

Al editar un `.md` y reingestar se actualizan a la vez la web y el asistente.
No hay ningún otro sitio donde editar el contenido.

## Estructura

| Carpeta | `kind` | Contenido |
|---|---|---|
| `perfil/` | `perfil` | Quién eres, cómo trabajas, qué buscas. Suele ser un único documento. |
| `experiencia/` | `experiencia` | Un documento por puesto o etapa profesional. |
| `proyectos/` | `proyecto` | Un documento por proyecto. Es la carpeta que más peso tiene. |
| `tecnologias/` | `tecnologia` | Un documento por tecnología sobre la que tengas algo real que contar. |
| `notas/` | `nota` | Artículos, decisiones técnicas, aprendizajes. Material libre. |

El `slug` de cada documento es su ruta sin extensión: `proyectos/migracion-erp`.

## Frontmatter

```yaml
---
title: Migración del ERP a PostgreSQL      # obligatorio
summary: Sustitución de un ERP sobre SQL Server por una arquitectura propia.
inicio: 2023-04                            # AAAA-MM o AAAA-MM-DD
fin: 2024-11                               # omitir si sigue en curso
tecnologias: [postgresql, docker, nodejs]  # slugs, en minúsculas y sin acentos
organizacion: Visados Empresas
rol: Responsable técnico
parte_de: experiencia/visados-empresas     # relación con otro documento
relacionado: [notas/particionado-por-rango]
visibilidad: public                        # public | private
---
```

Solo `title` es obligatorio. Todo campo adicional que añadas se guarda en
`documents.metadata` como JSONB, así que puedes inventarte campos sin tocar el
esquema ni migrar la base de datos.

`visibilidad: private` mantiene el documento fuera del asistente y fuera de la
web, pero lo conserva ingestado. Útil para material que quieres tener escrito
pero no publicado todavía.

## Cómo escribir para que el asistente responda bien

Esta es la parte que decide la calidad del proyecto. El sistema no puede
responder mejor de lo que esté escrito aquí.

**Un encabezado `##` es una unidad de recuperación.** El pipeline parte cada
documento por sus encabezados, y cada sección se recupera por separado. Escribe
cada sección de forma que se entienda leída sola, sin el resto del documento.

**Responde a preguntas reales.** Piensa qué preguntará alguien que te está
evaluando y dale a esas respuestas su propia sección. Estructura recomendada
para un proyecto:

```markdown
## Contexto
Qué existía antes y por qué era un problema. Concreto: volúmenes, tiempos,
número de usuarios, coste. Los números son lo que distingue una experiencia
real de una lista de tecnologías.

## Mi papel
Qué hiciste tú exactamente, y qué hizo el resto del equipo. Sé honesto con el
límite: es lo primero que se comprueba en una entrevista.

## Decisiones técnicas
Qué elegiste, qué descartaste y por qué. Esta sección es la que convierte el
sitio en una demostración de criterio en lugar de un inventario.

## Retos
Qué salió mal, qué costó más de lo previsto, qué aprendiste. Aquí es donde un
CV normal miente por omisión y donde este formato te diferencia.

## Resultado
Qué cambió de forma medible.
```

**Evita el lenguaje de CV.** "Amplia experiencia en entornos exigentes" no
aporta nada recuperable. "Reduje el tiempo de cierre mensual de 6 horas a 20
minutos particionando la tabla de asientos por ejercicio" sí.

**Escribe secciones de entre 100 y 400 palabras.** Más cortas se quedan sin
contexto suficiente para ser útiles; más largas diluyen el fragmento y empeoran
la búsqueda semántica.

## Objetivo de volumen

Entre 25 y 40 documentos con densidad real. Por debajo de ~15, el asistente
responderá de forma vaga y el sitio quedaría mejor como una página estática.
