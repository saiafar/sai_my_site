#!/bin/sh
# Arranque del contenedor: poner el esquema y el contenido al día, y después
# ceder el control al proceso principal.
#
# Migración e ingestión corren aquí y no durante la construcción de la imagen
# porque en tiempo de build no hay acceso a la base de datos —ni debe haberlo:
# una imagen que necesita la producción para construirse no es reproducible.
#
# Ambos pasos son idempotentes y toman un advisory lock en PostgreSQL, así que
# un despliegue sin cambios no escribe nada y dos contenedores que arranquen a
# la vez se serializan en vez de pisarse.
set -e

if [ -n "${SKIP_BOOT_TASKS}" ]; then
  echo "[boot] SKIP_BOOT_TASKS activo: se omiten migración e ingestión."
else
  echo "[boot] aplicando migraciones..."
  node_modules/.bin/tsx scripts/migrate.ts

  echo "[boot] ingestando la base de conocimiento..."
  node_modules/.bin/tsx scripts/ingest.ts
fi

echo "[boot] listo."
exec "$@"
