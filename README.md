# rafaiasvillan.com

Sitio personal con un asistente que responde preguntas sobre mi trayectoria
profesional usando búsqueda semántica sobre una base de conocimiento propia.

No es un chatbot conectado a un modelo general: cada respuesta se construye a
partir de fragmentos recuperados de documentos que he escrito, y el sistema
está diseñado para admitir que no sabe algo antes que improvisarlo.

## Arquitectura

```text
                          INTERNET
                              │  :443
                              ▼
                    ┌───────────────────┐
                    │  Traefik          │   TLS automático (Dokploy)
                    └─────────┬─────────┘
                              │  dokploy-network  (overlay)
                              ▼
                  ┌─────────────────────────┐
                  │  web  (Next.js)         │   sin estado, sin volúmenes
                  │  · páginas del sitio    │
                  │  · /api/chat            │
                  │  · embeddings en local  │
                  └───────────┬─────────────┘
                              │  red del servicio de base de datos (bridge)
                              ▼
                  ┌─────────────────────────┐
                  │  PostgreSQL 17 +        │   el único componente con estado
                  │  pgvector 0.8.6         │
                  └─────────────────────────┘
                              │
                              ▼
                        Google Gemini          solo generación de respuestas
```

### Decisiones que conviene entender antes de leer el código

**El Markdown de `knowledge/` es la única fuente de verdad.** Las tablas de
PostgreSQL son una proyección que genera el pipeline de ingestión: se pueden
borrar y reconstruir enteras sin pérdida. Editar un `.md` y desplegar actualiza
a la vez la web y el asistente, porque ambos leen la misma proyección.

**Los fragmentos se cortan por secciones semánticas, no por tamaño fijo.** Con
documentos cortos y estructurados, una ventana de N tokens parte ideas por la
mitad. Al texto que se vectoriza se le antepone el título del documento y la
ruta de encabezados, de modo que el vector codifique también el contexto: sin
eso, un fragmento que empieza por «sustituimos SQL Server por PostgreSQL 15» no
contiene ninguna señal de a qué proyecto pertenece.

**La búsqueda es híbrida, vectorial y full-text.** La búsqueda semántica falla
justo con los nombres propios —«PostgreSQL», «Postgres» y «pgvector» ocupan
posiciones muy próximas en el espacio de embeddings— y el índice full-text de
PostgreSQL acierta exactamente ahí. Los dos rankings se fusionan con Reciprocal
Rank Fusion, que combina por posición y no por puntuación, evitando tener que
normalizar dos escalas incomparables.

**Los embeddings se generan en local; solo la generación sale a Internet.** El
servidor es un mini PC con un i3 y 8 GB de RAM: un LLM de generación no cabe,
pero un modelo de embeddings multilingüe cuantizado son 130 MB. La consecuencia
práctica es que reindexar el corpus completo no cuesta nada, y eso permite
iterar sobre la estrategia de troceado tantas veces como haga falta.

**El modelo viaja dentro de la imagen.** Un contenedor no debería poder fallar
al arrancar porque Hugging Face tenga un mal día.

**La analítica se cuenta en casa, y Google es opcional.** Las cifras del panel
salen de la tabla `page_views`, que se alimenta de dos avisos por visita —uno al
abrir y otro, por `sendBeacon`, al salir— y se agrupa por el mismo hash de IP que
usan el asistente y el formulario. No hay cookie ni identificador persistente, y
por eso no hace falta pedir permiso. Google Analytics se añade encima si se
configura `GA_MEASUREMENT_ID`, y entonces sí aparece un aviso: su etiqueta no se
carga hasta que alguien acepta. Se cuenta en casa porque un bloqueador se come
una parte grande de los eventos de GA —y quien lee un sitio técnico los usa más
que la media—, así que el total de Google no es el total.

**El formulario de contacto guarda primero y avisa después.** El mensaje se
escribe en la base de datos y solo entonces se reenvía al webhook de N8N, firmado
con HMAC. Si N8N está caído, el visitante recibe su acuse de recibo igual y el
mensaje queda marcado como pendiente para reintentarlo desde el panel. Un
formulario que depende de que un servicio externo esté vivo pierde clientes sin
enterarse.

## Comandos

```bash
npm run migrate                  # aplica migraciones (idempotente, con checksum)
npm run ingest                   # markdown → documentos, fragmentos y embeddings
npm run ingest -- --dry          # muestra el plan sin escribir
npm run ingest -- --force        # revectoriza todo (tras cambiar el troceado)
npm run ask -- "pregunta"        # interroga el corpus sin LLM ni frontend
npm run eval -- --verbose        # recall@k y MRR sobre las preguntas doradas
npm run admin:clave              # genera ADMIN_PASSWORD_HASH para el panel
npm run typecheck
```

`ask` y `eval` son las herramientas de trabajo real: si el fragmento correcto no
aparece en `ask`, ningún ajuste del prompt lo va a arreglar después, porque un
modelo no puede citar lo que no ha recibido.

## Desarrollo

```bash
cp .env.example .env.local       # y rellenar DATABASE_URL
npm install
npm run migrate
npm run ingest
```

## Panel de administración

En `/admin`, protegido por contraseña. Tres pantallas: **Resumen** (visitas,
visitantes, tiempo medio, fichas más vistas, de dónde llegan y gasto del mes del
asistente), **Consultas** (los mensajes del formulario y las preguntas al
asistente, cada uno con lo que esa persona había mirado antes) y **Ajustes** (la
URL del webhook de N8N y su secreto de firma, con un botón para probarlos).

```bash
npm run admin:clave              # y pegar ADMIN_PASSWORD_HASH en el entorno
```

Sin esa variable el panel está cerrado: no existe un modo sin contraseña. La
sesión es una cookie firmada cuya clave se deriva del propio hash, así que
cambiar la contraseña cierra las sesiones abiertas y no hace falta una segunda
variable de entorno.

La URL del webhook vive en la tabla `site_settings` y no en el entorno porque es
lo único de la configuración que cambia sin cambiar el código: reorganizar un
flujo en N8N no debería obligar a redesplegar el sitio.

## Despliegue

Servicio de tipo **Compose** en Dokploy. Ver los comentarios de
`docker-compose.yml` para por qué Compose y no Application: Dokploy despliega
sus Applications como servicios Swarm, que solo pueden usar redes overlay, y la
base de datos vive en una red bridge propia que no conviene abrir al resto de
los servicios del panel.

El contenedor pertenece a dos redes: la overlay por la que Traefik lo alcanza y
la de la base de datos. Al arrancar aplica migraciones e ingesta bajo un
advisory lock de PostgreSQL, y después cede el control al servidor. Ambos pasos
son idempotentes, así que un despliegue sin cambios de contenido no escribe
nada.

Las variables del despliegue van en el panel de Dokploy, no en el repositorio.
Ver `.env.deploy.example`.

## Estado

| Componente | Estado |
|---|---|
| Esquema y migraciones | Hecho |
| Pipeline de ingestión | Hecho |
| Búsqueda híbrida | Hecho |
| Arnés de evaluación | Hecho |
| Imagen y despliegue | Hecho, validado contra la base de datos real |
| Panel de administración | Hecho |
| Base de conocimiento | En redacción |
| Integración con Gemini | Pendiente |
| `/api/chat` | Pendiente |
| Frontend Next.js | Pendiente |
| Automatización con n8n | Fase posterior |
