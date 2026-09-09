-- Extensiones necesarias.
--   vector   : tipo vector + índices HNSW/IVFFlat para búsqueda semántica.
--   pg_trgm  : similitud por trigramas, para tolerar erratas en nombres propios
--              ("postgrest" vs "postgres") donde el full-text falla.
--   unaccent : normalización de acentos en las consultas del usuario.
create extension if not exists vector;
create extension if not exists pg_trgm;
create extension if not exists unaccent;
