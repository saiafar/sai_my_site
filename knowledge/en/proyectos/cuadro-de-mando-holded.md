---
title: Executive Dashboard Combining Holded and ERP Data
summary: Consolidating financial accounting metrics from Holded via REST API with internal ERP operational records to provide executive leadership with a single source of truth for decision-making.
organizacion: Visados Empresas
rol: Software architecture and development
inicio: 2025
tecnologias: [holded, api-rest, laravel, php, postgresql, mysql]
parte_de: experiencia/visados-empresas
portada: /imagenes/proyectos/cuadro-de-mando-finanzas.webp
portada_alt: Finance dashboard with the monthly executive summary against budget and productivity KPIs
portada_2: /imagenes/proyectos/cuadro-de-mando-automatizacion-ia.webp
portada_2_alt: AI automation module that turns the dashboards into executive summaries and scheduled alerts
visibilidad: public
destacado: 8
---

## Context

Critical business intelligence was fragmented between Holded (cloud accounting) and the proprietary corporate ERP. Each system answered operational questions well within its silo, but the strategic insights executive leadership required crossed both boundaries: matching billed project revenue with actual vendor disbursements and overhead expenses meant manual spreadsheet exports, error-prone data reconciliation, and recurring friction every review cycle.

## Solution

A consolidated analytics dashboard that ingests financial data from Holded via its REST API, harmonizes it with live project and client records from the internal ERP, and presents a single, unified financial overview.

Integrating two enterprise systems never designed to communicate is always a discipline of domain mapping: determining which entity in system A corresponds to system B, mapping reconciliation keys, and establishing predictable data behaviors when transactional states diverge.

## Status

Active in production.
