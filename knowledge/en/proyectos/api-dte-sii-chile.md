---
title: Electronic Tax Invoicing API for Chilean Internal Revenue Service (SII)
summary: "Custom API integration with Chile's SII tax authority that restored electronic sales receipt issuance after an unmaintainable legacy third-party module broke."
organizacion: Portalweb
rol: Software development
inicio: 2018-10
fin: 2023-01
tecnologias: [php, laravel, xml, api-rest]
parte_de: experiencia/portalweb
visibilidad: public
destacado: true
---

## Context

In Chile, all retail sales and commercial transactions must be registered as electronic tax documents (Documentos Tributarios Electrónicos - DTE) certified in real time against the Internal Revenue Service (Servicio de Impuestos Internos - SII). For Portalweb's commercial merchant base, tax certification bottlenecks disrupted checkout registers.

## Solution

A dedicated microservice API connecting directly to the SII and encapsulating DTE generation, XML signing, schema validation, and transmission protocols. Built on PHP with Laravel, generating signed XML payloads compliant with SII schemas while exposing a clean, modern RESTful JSON API to consumption clients across POS registers and scales.

Integrating against a national tax authority introduces unique architectural demands compared to commercial APIs: schemas are non-negotiable, certificate cryptography must be exact, and failures cannot be retried indiscriminately because each transmitted document carries real legal and fiscal liabilities.

## Outcome

Fiscal electronic receipt issuance was fully restored and decoupled from unmaintainable third-party compiled binaries. From that point forward, regulatory schema changes or security certificate updates mandated by the SII were resolved immediately within our own version-controlled codebase.

With the API operating reliably in production, I developed a custom WordPress and WooCommerce plugin allowing eCommerce merchants to issue certified electronic tax receipts directly through the same integration pipeline—a functionality previously impossible under the old setup.

## Connection to Prior Work

This marked the second sovereign tax authority integration of my career, building upon the electronic fiscal invoicing engine I built for Argentina's AFIP tax agency at NeoSepelios two years prior.
