---
title: ACO, Distributed Content Management System for Digital Signage Networks
summary: The system that decoupled media content from visual layout templates across more than one hundred digital signage displays, featuring playlist scheduling, REST synchronization, and offline resilience.
organizacion: Imvinet C.A.
rol: System architecture and software development
inicio: 2010-09
fin: 2013-03
parte_de: experiencia/imvinet
tecnologias: [php, mysql, api-rest, java, actionscript, json, javascript, jquery, html]
visibilidad: public
---

## Context

Legacy digital signage platforms operated by compiling static media layouts into monolithic display schedules, with raw content directly baked into each template. Changing a single data point—a product price or promotional headline—forced administrators to recompile the entire programming grid and push full downloads to remote hardware. If an endpoint experienced network degradation at that moment, the update failed entirely.

With over one hundred screens distributed across manufacturing plants for Empresas Polar, retail branches and distribution logistics hubs for Farmatodo, and commercial chains nationwide, this architectural bottleneck crippled operations.

## Technical Decisions

**Decoupling data content from layout templates.** Visual templates ceased carrying hardcoded data and instead consumed structured JSON from a local database residing directly on the hardware media player. Through a centralized web administration portal, operators could inspect active templates across client networks and dynamically update copy, pricing, or media without modifying the underlying playlist schedule.

**Delta synchronization instead of monolithic publishing.** A lightweight background agent written in Java, installed on each display player, periodically polled the central REST API, computed diffs against local assets, and downloaded strictly modified resources: text strings, images, video assets, and audio. Everything was stored and served from local disk, ensuring screens continued playback uninterrupted during network outages. This was my first production API-driven platform.

**Dynamic template schemas with configurable fields.** Within the CMS, administrators registered templates and declared their schema attributes: background layers, headline typography, body text, audio triggers. Because every template could declare an arbitrary field schema, marketing could introduce novel screen formats and schedule them dynamically. This flexibility drove long-term adoption.

**Runtime technology independence.** Because visual templates read local data via standard interfaces, their rendering engine was irrelevant to the core system. This enabled migrating the display tier from Adobe Flash / ActionScript to standard HTML5 and JavaScript without touching server infrastructure or deployment agents—the architectural decision that aged best.

## Content Scheduling Engine

Granular scheduling targeting specific calendar timestamps, recurring dayparting blocks (e.g., breakfast menus in the morning transitioning to evening promotions), and day-of-week rotations, coordinating synchronized video, audio, and graphics.

## Architecture

Administrative web portal and API backend built in PHP with MySQL (originally native PHP, subsequently refactored onto modern MVC patterns); a RESTful API delivering structured schedules to players; an autonomous Java agent running on each display client; and a local runtime storage schema containing template manifests, assets, and schedule rules. Dynamic visual templates were authored in ActionScript 3 and subsequently HTML5.

## My Role

End-to-end conceptualization and system architecture—web portal, REST API, client daemon, and player storage formats; backend and API engineering, the Java client daemon, dynamic template schemas, and UI/UX design (including system naming and logo). Development was executed in pair programming alongside a talented engineer whom I recommended bringing into the company.
