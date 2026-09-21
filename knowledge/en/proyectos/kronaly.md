---
title: Kronaly, Multi-tenant HR & Labor Time-Tracking SaaS
summary: Multi-tenant labor management platform engineered single-handedly, running in production across a corporate group of four companies, fully compliant with Spanish labor time-tracking regulations.
organizacion: Cucalón Estévez y Asociados
rol: Product design, software architecture, development, and infrastructure deployment
inicio: 2025-03
fin: 2026-08
tecnologias: [laravel, php, react, postgresql, redis, docker, dokploy, api-rest, github-actions]
parte_de: experiencia/visados-empresas
visibilidad: public
destacado: true
---

## Context

Kronaly began as a quick operational fix. The corporate group tracked employee work shifts using the Shifts module in Microsoft Teams, whose exported reports were functionally useless for labor compliance. I developed a PHP script that consumed, normalized, and correctly recorded those records. That workaround catalyzed the vision for an independent, proprietary platform.

What started as an internal utility evolved into a full-featured multi-tenant SaaS platform for modern workforce management, designed to serve distributed companies with hybrid and remote work models.

## Core Capabilities

In active production: mandatory labor time-tracking—clock-in, clock-out, break pauses, shift schedules, discrepancy auditing, and overtime tracking; leave and vacation management with public holiday calendars and approval request workflows; employee document vaults and internal policy distribution; employment contracts; staff directory management with bulk CSV importing; hierarchical teams with leads managing shift schedules and leave approvals for their direct reports; internal training modules hosting documentation and video walkthroughs; and comprehensive executive analytics.

Beyond the initial roadmap, I accelerated an unplanned internal IT service desk and asset management module: ticketing, hardware asset inventory with unique equipment identification tags assigned to employees alongside historical maintenance records, and internal technical documentation. It emerged directly from my own operational needs as Head of Technology supporting a fully remote workforce.

Each enterprise maintains its own isolated administrative workspace with customized active modules, granular role-based permissions, and a dedicated audit portal specifically provisioned for Labor Inspectorate audits.

## Multi-Tenant by Architecture

Multi-tenancy was the foundational architectural decision. The group comprises four legal entities; deploying four independent application instances would have quadrupled maintenance, server overhead, and release deployment friction.

All four companies utilize the platform in production, each operating as an isolated tenant with up to thirty concurrent daily users.

## Labor Tracking as a Legal Obligation, Not Merely a Feature

In Spain, employee labor time-tracking is legally mandated by law, which strictly dictated architectural decisions from day one. The platform complies with Royal Decree-Law 8/2019 and Article 34.9 of the Workers' Statute, and is fully aligned with the technical framework of Spain's mandatory digital labor tracking framework slated for 2026. I authored the official corporate regulatory compliance audit report myself.

In the codebase, this translates to: unequivocal employee identity verification with timezone-aware immutable timestamps; complete audit trails for every edit—prior state, proposed change, requesting user, approving manager, and precise timestamp; soft deletes and cryptographic tamper-evident audit hashing; four-year mandatory data retention with audited purge schedules; automated system closures for unclosed shifts (explicitly flagged as automated system actions, as software must never fabricate human hours); and monthly ledger lockouts with controlled administrative reopening procedures.

The rule I am proudest of governs corrections: if a manager adjusts a punch record on an employee's behalf, **only the employee can approve the modification**. A superior cannot unilaterally alter any worker's logged hours, precisely fulfilling the protective intent of the labor statute.

For external regulatory oversight: read-only portals for worker union representatives, and for the Labor Inspectorate, a token-secured auditor portal providing CSV/JSON data exports accompanied by cryptographic integrity manifests and access logs tracking inspector IP, timestamp, and accessed datasets.

## Architecture

Laravel backend structured according to Domain-Driven Design (DDD) principles, cleanly isolating domain boundaries to facilitate decomposing the monolith into microservices should scale demand it. React frontend, PostgreSQL database, containerized with Docker, automated CI/CD via GitHub Actions and Dokploy managing development, staging, and production branches.

## Status

I delivered the platform independently from scratch: product conceptualization, database architecture, frontend/backend engineering, deployment pipelines, and regulatory documentation. Upon concluding my corporate tenure, the CEO signed over all intellectual property rights: I hold sole ownership of the source code, trademark, and domain.

It has not been commercialized publicly. From the original product roadmap, the mobile application and employee wellness module remained unimplemented.
