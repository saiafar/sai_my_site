---
title: Corporate Head of Information Systems at Cucalón Estévez & Associates
summary: "All technology operations for a group of four global mobility companies: infrastructure, user support, procurement, VoIP telephony, full-stack software development, n8n automation, and an ERP-integrated AI assistant."
organizacion: Cucalón Estévez y Asociados
rol: Corporate Head of Information Systems
inicio: 2025-01
fin: 2026-08
tecnologias: [php, laravel, cakephp, nodejs, react, postgresql, mysql, redis, docker, dokploy, linux, cpanel, nginx, traefik, github-actions, wordpress, n8n, llm, agentes-ia, mcp, pgvector, ollama, microsoft-365, api-rest, holded, figma]
visibilidad: public
---

## The Role

From January 2025 to August 2026, I served as Head of Technology for Cucalón Estévez & Associates, a corporate group of four international mobility and visa consulting firms (work permits, visas, and legal relocation), where Visados Empresas is the flagship brand alongside Permisodetrabajo.eu and Corporate Visa Solutions.

Working remotely from Galicia, Spain, reporting directly to the CEO and owner.

The initial scope was maintaining the group's proprietary ERP/CRM. The actual position quickly expanded to overseeing all technology across the four companies: servers and systems, Microsoft 365, identity and access management, workstation support, hardware procurement, software licensing, cloud telephony, and developing custom internal tools.

This tenure best defines the trajectory of my career: not merely a developer taking on more responsibilities, but an engineering leader owning the entire technological backbone of a mid-sized enterprise—from frontline desk support to architecting proprietary SaaS products.

## Systems, Support, and Procurement

The group's ERP/CRM is built with CakePHP, with its core codebase managed by an external vendor; I oversaw its day-to-day maintenance, customizations, and operational evolution. I also administered the Linux production server running WHM/cPanel housing the ERP and corporate websites, a secondary AlmaLinux server for containerized workloads, Microsoft 365 administration (users, mail routing, security policies), Dropbox teams, and centralized access governance.

On the operational side: remote technical support for all employees, hardware maintenance and provisioning of corporate laptops for onboarding, and full ownership of IT procurement—selecting equipment, negotiating vendor services, and approving software licenses.

I also orchestrated the migration of the corporate telephone system to a cloud PBX platform, designing call flows, interactive voice response (IVR), ring groups, and queue routing. It was the modern evolution of a problem I had solved back in 2007 with physical Asterisk servers, eighteen years later and completely cloud-native.

## Kronaly

A multi-tenant SaaS platform for human resources and mandatory labor time-tracking that started as an internal tool to replace flawed Microsoft Teams shift reports. It has its own project case study.

All four corporate entities use it in active production, each operating as an independent tenant with up to thirty concurrent users. I designed and developed it single-handedly from inception to deployment. Upon concluding my tenure, the CEO signed over all intellectual property rights to me: I retain full ownership of the codebase, trademark, and domain.

## Integrating Without Altering Third-Party Code

I needed bidirectional data access to the core ERP database, but its source code was maintained by an external provider: any custom modifications I made to their codebase could be wiped out during their next patch or release.

The architectural solution was developing an independent REST API in Laravel within its own Docker container. This API connects directly to the underlying database, exposing safe endpoints and event hooks without modifying a single line of the vendor's application. This integration layer subsequently powered both the executive dashboard and automated workflows.

## Executive Financial Dashboard

Unifies invoicing and payment collections from the legacy ERP with operational expenses and real-time bank ledger balances from Holded (the group's cloud accounting platform). It incorporates automated financial analysis powered by LLMs and an industry benchmarking module. It has its own project case study and remains in production use.

## Containerized Infrastructure

I initially deployed Docker containers directly on the primary ERP server, which required manually configuring Nginx as a reverse proxy in front of Apache to route traffic to isolated container ports.

When the group provisioned a dedicated secondary server, I set up Dokploy to orchestrate containerized services properly: hosting an internal RustDesk remote desktop relay server for employee IT support, self-hosted n8n instances for automation workflows, Excalidraw, and internal web applications.

Continuous deployment evolved in two stages: first using GitHub Actions triggered by commits to main to build and run database migrations, and subsequently integrating Dokploy directly with repository webhooks across development, staging, and production environments.

## Corporate Web Properties

The company websites were running on an abandoned WordPress theme unmaintained since 2022. Upgrading WordPress broke the theme layout, preventing upgrades to modern PHP versions, Elementor, and critical security plugins—leaving the public web slow, fragile, and vulnerable.

I engineered a clean, bespoke WordPress theme tailored specifically to the company's content architecture and upgraded the entire runtime stack. Google PageSpeed scores jumped from ~30 to 90–100 across mobile and desktop, while Accessibility and SEO benchmarks hit 90–100.

I deliberately retained Elementor compatibility so marketing could launch campaigns independently without developer intervention—a pragmatic compromise that ensured the new platform remained sustainable for the team.

For the visa portal, which features extensive country-specific immigration guides, I built a custom WordPress plugin connected to an LLM. It generated structured article drafts from custom prompts, migrated and rewritten legacy blog posts, and optimized on-page SEO targeting key terms provided by the marketing team.

## Lucía

The company's corporate AI agent, integrated directly into Microsoft Teams. It answers employee inquiries regarding internal documentation and queries ERP data in real time. It has its own project case study.

Among all projects built during this tenure, this represents my primary technical focus: not an isolated chatbot, but an intelligent agent integrated into real operational business workflows, with vector embeddings generated locally so sensitive company data never leaves the premises.

## Sales Funnel Automation

End-to-end n8n workflows, connected to the CRM through my custom API, monitor incoming leads from website forms and corporate mailboxes. An AI model evaluates and classifies each inquiry, identifying high-intent commercial prospects. It sends automated replies inviting them to schedule a discovery call, registers the lead in the CRM, and schedules automated follow-up tasks. If no appointment is booked within 72 hours, it archives the lead; if confirmed, it provisions the calendar event.

The system user executing these automated touches was named Lucía (mirroring the AI assistant) so the sales team could distinguish automated touchpoints from human interventions at a glance.

I also built an automated outbound prospecting engine that scans business news for companies announcing international expansions (Spanish companies expanding abroad or foreign firms establishing Spanish branches), extracts verified contact details, and enriches CRM pipeline records for the business development team.

## Visual Design and Brand Identity

I recreated the logos of all group companies as crisp SVG vectors from low-resolution bitmaps and produced commercial print collateral, including corporate stationery and service brochures. I designed and developed campaign landing pages, as well as the full brand identity—naming, logo, visual guidelines, and website—for Learn and Land, a student visa vertical concept.
