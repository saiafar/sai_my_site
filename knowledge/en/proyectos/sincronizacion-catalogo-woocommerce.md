---
title: B2B Catalog and Inventory Synchronization for WooCommerce
summary: Custom plugin that imports ERP CSV exports for a commercial watch wholesaler into WooCommerce, creating categories and variants, updating live stock, and enforcing role-based product visibility via custom WordPress taxonomies.
organizacion: Client in Colombia
rol: Plugin architecture and software development
inicio: 2023-01
fin: 2024-12
parte_de: experiencia/freelance-2023-2024
tecnologias: [php, wordpress, woocommerce]
visibilidad: public
---

## Context

A Colombian watch and luxury timepiece wholesaler operated an eCommerce portal strictly for verified B2B distributors and wholesale jewelers, rather than the general public. Access rules were granular: specific retail partners were authorized to view and purchase only designated watch manufacturers and production years. Live catalog data, pricing tiers, and warehouse inventory resided in their corporate ERP, which generated structured daily CSV exports.

## Plugin Capabilities

The custom plugin ingested the ERP CSV export and automated catalog and inventory synchronization across WooCommerce: it provisioned missing product categories on the fly, managed complex variable products (representing a single watch reference across multiple case and strap colorways) with real-time stock levels per SKU, instantiated new variants as novel colorways emerged, and published new product parents when novel categories were detected.

## Technical Decisions

**Access control powered by native WordPress taxonomies rather than parallel database tables.** Restricting which product ranges individual wholesale accounts could purchase was engineered via custom hierarchical WordPress taxonomies. Leveraging WordPress's native taxonomy subsystem instead of building a separate relational access-control layer ensured that the product catalog remained natively filterable, searchable, and manageable through standard admin panel tooling.

**Differential synchronization rather than destructive bulk truncation.** An import script that drops and recreates tables is easier to write, but it catastrophically destroys historical sales analytics, customer cart sessions, and internal foreign keys. The synchronization engine performs rigorous entity comparison, updating only changed attributes—demanding more engineering effort upfront, but delivering zero production regressions downstream.
