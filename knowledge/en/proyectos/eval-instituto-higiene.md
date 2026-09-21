---
title: EVAL, Clinical Laboratory Management System for National Institute of Hygiene
summary: Core laboratory information system for Venezuela's national public health reference institute, supporting over one hundred diagnostic assays with a schema enabling clinical test definitions and formulas to evolve without code changes.
organizacion: Instituto Nacional de Higiene «Rafael Rangel»
rol: Requirements analysis, database schema design, software development, and deployment
inicio: 2009-02
fin: 2010-07
tecnologias: [php, postgresql, html, css, javascript, jquery, linux]
parte_de: experiencia/softrain
visibilidad: public
destacado: true
---

## Context

The National Institute of Hygiene "Rafael Rangel" (INH) serves as the primary national reference laboratory for the public healthcare system of Venezuela. Diagnostic specimen samples collected by regional hospitals and healthcare agencies nationwide are transferred here for definitive laboratory analysis, generating official national epidemiology statistics across virology, bacteriology, and mycology.

The institute relied on an antiquated Visual Basic 6 desktop system that had reached obsolescence and, critically, could not adapt to new laboratory assays or changes in diagnostic calculation formulas as testing protocols evolved. The initiative emerged from a public government tender, with the contractual requirement that the institute retain complete ownership and operational control upon delivery.

The EVAL brand name and identity logo were conceived and designed by me.

## The Core Technical Challenge: Evolving Diagnostic Protocols

Clinical laboratory tests evolve continuously over time. The biological sample might remain identical—e.g., serum for Hepatitis A—but the measured biomarkers, threshold values, and mathematical evaluation algorithms change. An assay that previously recorded two quantitative values and compared them might be updated to evaluate three values under conditional decision trees: if biomarker A exceeds B, evaluate ratio A/C; otherwise, evaluate B/C.

Any system where diagnostic calculations are hardcoded in application logic becomes obsolete the moment clinical guidelines are revised—which was precisely what crippled the legacy software.

I designed a fully parameterizable, data-driven relational schema enabling laboratory directors to define and modify data fields per assay, configure mathematical evaluation expressions and conditional formulas, and—crucially—**version** these clinical assay schemas: historical patient records remain permanently linked to the exact schema revision under which they were originally evaluated and issued.

That temporal versioning guarantee is not a minor technical nuance. A clinical diagnostic report issued three years ago must remain verifiable exactly as authorized, never retroactively reinterpreted under modern rules.

## Functional Scope

The complete end-to-end clinical laboratory lifecycle: patient intake with demographic recording and test requisition orders, issuance of barcoded patient receipts, specimen sample accessioning, multi-stage diagnostic processing across Virology, Bacteriology, and Mycology departments, and final medical report validation—displayed on screen or printed using customized layout templates specific to each diagnostic technique.

Over one hundred clinical assays organized across methodologies: viral cell cultures, PCR amplification, and serologies (Dengue, Yellow Fever, Rabies, Polio, Measles, Hepatitis, HIV, HPV, and others); blood cultures, urine cultures, stool cultures, and bacterial strain identification; and fungal cultures, antifungal susceptibility testing, and serological assays in mycology.

The platform generated thermal barcode labels for specimen test tubes and diagnostic reports, including multi-stage barcode tracking for mycology cultures requiring multi-week incubation milestones.

## Sensitive Medical Data Protection

The system stores highly sensitive clinical health records—including confirmed HIV diagnoses—meaning data governance was central to the architecture: granular role-based access control ensuring personnel accessed only their authorized departmental scope, cryptographic re-authentication for inputting, amending, or authorizing clinical outcomes, and immutable chronological audit logs recording all database operations.

## Operational Constraints

Built upon PHP and PostgreSQL in strict adherence to Presidential Decree 3390, which legally mandated open-source software throughout Venezuelan public administration. Cross-platform web architecture operating reliably on modest server specifications compared to modern cloud instances.

## My Role

The development team comprised two engineers: the project director and myself. I contributed across the entire project lifecycle—clinical discovery interviews with laboratory department heads, relational database design, infrastructure decisions, full-stack software development, UI design, and on-site production rollout—as an early-career engineer.

To my knowledge, the EVAL system continues operating in active production today.
