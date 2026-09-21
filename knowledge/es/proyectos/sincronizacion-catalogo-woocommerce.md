---
title: Sincronización de catálogo e inventario en una tienda B2B
summary: Plugin que importa a WooCommerce el CSV del ERP de un mayorista de relojes, creando categorías y variantes, actualizando stock y limitando por taxonomías qué ve cada proveedor.
organizacion: Cliente en Colombia
rol: Desarrollo del plugin
inicio: 2023-01
fin: 2024-12
parte_de: experiencia/freelance-2023-2024
tecnologias: [php, wordpress, woocommerce]
visibilidad: public
---

## Contexto

Un mayorista colombiano de relojes vendía por Internet, pero no al público: su
tienda era para proveedores y revendedores, y a cada uno se le permitían
determinados modelos y años. El catálogo y el stock reales vivían en su ERP, que
exportaba un CSV.

## Qué hacía el plugin

Importaba ese CSV a WooCommerce y sincronizaba catálogo e inventario: creaba las
categorías que no existían, gestionaba los productos variables —un mismo reloj
en varios colores— actualizando el stock de cada variante, añadía como variante
cualquier color nuevo y daba de alta el producto completo si llegaba de una
categoría que aún no estaba.

## Decisiones técnicas

**Los permisos con las taxonomías de WordPress, no con una tabla aparte.**
Distinguir qué productos puede comprar cada proveedor se resolvió con taxonomías
personalizadas. Aprovechar el modelo de contenidos del propio WordPress en lugar
de montar una estructura paralela hace que el catálogo siga siendo filtrable,
buscable y administrable con las herramientas que ya trae.

**Sincronizar, no volcar.** Una importación que borra y recrea es más fácil de
escribir y destruye el histórico y los identificadores. El plugin compara y
actualiza, que es más trabajo por adelantado y menos incidencias después.
