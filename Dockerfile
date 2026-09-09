# syntax=docker/dockerfile:1

# =============================================================================
# Imagen del sitio personal.
#
# Nada de lo que hay aquí dentro tiene estado. El contenido vive en PostgreSQL
# tras la ingestión, y el Markdown que lo origina viaja dentro de la imagen: no
# hay ningún volumen montado, de modo que la misma imagen produce siempre el
# mismo sitio y se puede reconstruir todo desde el repositorio.
# =============================================================================

ARG NODE_IMAGE=node:22-bookworm-slim

# -----------------------------------------------------------------------------
# 1. Dependencias de producción
# -----------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# onnxruntime-node se distribuye con los binarios de todas las plataformas y
# aceleradores: 513 MB, de los cuales 302 MB son el proveedor CUDA para GPU
# NVIDIA. El servidor es un i3 sin GPU y la imagen es linux/amd64, así que todo
# lo demás es peso muerto. Quedan unos 35 MB.
RUN set -eux; \
    ORT="node_modules/onnxruntime-node/bin/napi-v6"; \
    rm -rf "${ORT}/darwin" "${ORT}/win32" "${ORT}/linux/arm64"; \
    rm -f  "${ORT}/linux/x64/libonnxruntime_providers_cuda.so" \
           "${ORT}/linux/x64/libonnxruntime_providers_tensorrt.so"

# transformers.js arrastra onnxruntime-web: 130 MB de compilación WebAssembly
# para navegadores, que en Node no se carga nunca porque el backend es
# onnxruntime-node. Se elimina y la fase siguiente lo verifica descargando el
# modelo: si hiciera falta, la construcción falla aquí y no en producción.
#
# Sus 33 MB de @img/sharp, en cambio, se quedan: parecen igual de innecesarios
# —aquí solo se vectoriza texto— pero transformers.js los importa de forma
# estática y quitarlos rompe la carga del modelo. Comprobado, no supuesto.
RUN rm -rf node_modules/onnxruntime-web \
 && du -sh node_modules

# -----------------------------------------------------------------------------
# 2. Modelo de embeddings
#
# En fase de construcción, para que el arranque en producción no dependa de
# poder alcanzar Hugging Face.
# -----------------------------------------------------------------------------
FROM deps AS model
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN node_modules/.bin/tsx scripts/fetch-model.ts

# -----------------------------------------------------------------------------
# 3. Imagen final
# -----------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    TRANSFORMERS_CACHE=/app/.models

COPY --from=deps  --chown=node:node /app/node_modules ./node_modules
COPY --from=model --chown=node:node /app/.models      ./.models

COPY --chown=node:node package.json tsconfig.json ./
COPY --chown=node:node src        ./src
COPY --chown=node:node scripts    ./scripts
COPY --chown=node:node db         ./db
COPY --chown=node:node eval       ./eval
# El corpus. No es un volumen: es contenido versionado, y forma parte de la
# identidad de esta imagen igual que el código.
COPY --chown=node:node knowledge  ./knowledge

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/

USER node
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]

# El entrypoint ya deja el esquema y el contenido al día; este CMD es solo el
# proceso principal que queda vivo después.
#
# Fase 4: pasará a ser ["node", "server.js"] cuando exista la aplicación
# Next.js. Hasta entonces el contenedor hace su trabajo de arranque y termina,
# que es exactamente para lo que sirve hoy: ingestar.
CMD ["sh", "-c", "echo '[web] sin aplicación que servir todavía (fase 4 pendiente)'"]
