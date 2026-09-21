---
title: Interactive Wayfinding Map for Shopping Mall Touchscreen Kiosks
summary: Interactive directory and route finder deployed across five large-format kiosks in Costa Azul Shopping Mall, featuring animated floor plans, dynamic "you are here" positioning, and turn-by-turn routes with offline reliability.
organizacion: Imvinet C.A.
rol: User interface design, backend development direction, and physical deployment
inicio: 2010-09
fin: 2013-03
parte_de: experiencia/imvinet
tecnologias: [actionscript, php, mysql, javascript, jquery, html]
visibilidad: public
destacado: true
---

## Context

Five large-format vertical touchscreen kiosks distributed throughout Costa Azul Shopping Mall on Margarita Island, designed to help visitors locate retail stores, dining venues, and amenities, and guide them with intuitive wayfinding routes.

## Core Functionality

An interactive vector map covering both mall floors and every retail space. Each retail location possessed a unique spatial identifier linked through an administrative web portal to store branding, merchant descriptions, operating hours, and interior/exterior photography, allowing shoppers to identify their destination visually at a glance.

Each physical kiosk ran a localized configuration of its exact spatial coordinates, ensuring orientation was always rendered from the visitor's immediate perspective. Selecting any store rendered an animated wayfinding path originating from that specific kiosk with step-by-step navigational guidance.

## Technical Decisions

**Precalculated path vectors instead of dynamic pathfinding algorithms.** Navigational routes were modeled as pre-authored vector animation sequences calibrated for each kiosk, with only the final approach segment adjusting dynamically to the specific storefront within each concourse corridor. Across five kiosks and two floor levels, hand-tuned vector animations offered vastly superior visual polish, smoother frame rates, and zero pathfinding edge-case failures compared to real-time algorithmic rendering, with negligible ongoing maintenance overhead.

**Remote distribution, local execution.** Map assets, store directories, and metadata were synchronized over the network from the central CMS and cached locally on each kiosk terminal. This guaranteed that the interactive wayfinding application operated flawlessly without requiring an active internet connection. A public kiosk that depends on live internet connectivity in a commercial shopping center is an out-of-order screen half the time.

## My Contribution

Complete UI and visual design—information hierarchy, touch interaction ergonomics, and graphical styling—along with backend API engineering, CMS synchronization logic, and on-site hardware provisioning across the kiosk fleet.
