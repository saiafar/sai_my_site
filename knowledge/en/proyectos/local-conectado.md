---
title: Local Conectado, Integrated Retail Point-of-Sale Ecosystem
summary: "Distributed ecosystem replacing an unmaintainable legacy C# POS system: local in-store server, touchscreen computing scale, checkout register, mobile POS, and digital signage operating as a cohesive system."
organizacion: PortalWeb
rol: Technical leadership and software engineering
inicio: 2020-01
fin: 2023-01
tecnologias: [php, laravel, react, react-native, nodejs, electronjs, socket-io, sqlite, javascript, linux, google-cloud]
parte_de: experiencia/portalweb
visibilidad: public
destacado: true
---

## Context

PortalWeb marketed comprehensive point-of-sale hardware and software packages to Chilean supermarkets, butcher shops, and deli retailers, centered on an aging legacy desktop application written in C#. As I provided ongoing technical support, every bugfix patch inevitably broke downstream dependencies: the codebase could not absorb evolving customer needs, and adapting it meant rebuilding it. We made the strategic decision to architect a next-generation platform from scratch, which I led.

The platform was named Local Conectado ("Connected Store") to reflect its core architectural philosophy: scales, checkout cash registers, handheld mobile POS terminals, customer-facing media displays, and deli queue systems communicating as an integrated distributed mesh within the physical retail store, rather than isolated appliances.

## Architecture and Subsystems

**The In-Store Local Server**: A resilient on-premises edge server hosting the local transactional database, orchestrating device synchronization and serving as the local source of truth for all checkout terminals.

**Balanza PW (Smart Touchscreen Scale)**: Featuring a responsive React frontend paired with a local Laravel microservice running on the in-store server, querying an isolated database independent of legacy structures. It has its own project case study detailing its embedded hardware layer.

**Desktop POS and MultiPOS PW (Mobile Handheld POS)**: Cashier checkout software paired with MultiPOS PW, a cross-platform React Native mobile application deployed to Android handheld POS terminals with integrated thermal printers, communicating with deli scales via low-latency Bluetooth. I served as technical lead across conceptualization, architecture, and deployment.

**portalDS (Customer-Facing Digital Signage)**: A real-time digital signage and multimedia engine deployed to secondary customer-facing displays mounted on registers and scale poles. It renders real-time itemized basket subtotals interspersed with promotional marketing engineered to drive impulse purchasing. Conceived from my background in digital signage, this feature became the primary catalyst driving hardware scale adoption.

**Integrated Queue Management**: Synchronized ticketing directly embedded into scale workflows for high-volume butcher and deli counters, displaying active ticket numbers on external digit counter poles or overlaying announcements on digital signage screens.

## Floating Sales Carts

The functional innovation that best illustrates the operational pragmatism of the system. In the legacy software, a transaction initiated at a specific deli scale was locked to that physical terminal until completed. In Local Conectado, any transaction can be retrieved and finalized from any scale or cash register simply by selecting the clerk's profile, with support for multiple concurrent open customer carts.

While seemingly a minor detail, it revolutionized operational efficiency in busy butcheries where three clerks navigate shared scales during peak customer traffic.

## Self-Service Weighing Mode

Engineered for large grocery and produce markets. Shoppers place fresh produce on the scale platter, tap the product icon on the touchscreen, and the terminal prints an encoded barcode label to affix to the produce bag. At final checkout, the cashier terminal scans the barcode, validating weight, product code, and price calculation against the in-store server ledger to prevent checkout fraud.

## Replacing Without Halting Production

The most challenging dimension of legacy modernization is not engineering new software: it is sustaining live legacy operations during the transition. Within the four-person engineering team I assembled, I deliberately assigned one full-time developer exclusively to maintaining and supporting the legacy C# system, allowing the remaining engineers to focus unhindered on architecting its modern replacement.
