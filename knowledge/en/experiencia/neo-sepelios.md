---
title: Project Lead at NeoSepelios
summary: Redesigning the digital signage platform for funeral homes and managing a remote engineering team, delivering a tablet-based sales system integrated with Argentina's AFIP electronic invoicing.
organizacion: NeoSepelios
rol: PHP Developer, subsequently Project Lead
inicio: 2016-07
fin: 2018-10
tecnologias: [php, lumen, angularjs, mysql, api-rest, html, css, javascript]
visibilidad: public
---

## The Role

Two years and three months, from July 2016 to October 2018 (spanning the entire year of 2017), with an Argentine digital signage software company specializing in funeral homes—a specialized niche that subsequently expanded into tablet-based sales and service management software for the same vertical.

I operated 100% remotely from Venezuela, reporting directly to the CEO and founder, who brought me on specifically due to my deep prior background in networked digital signage platforms.

I initially joined to provide maintenance and bugfixes for their existing display software. I proposed an architectural overhaul, rebuilt the platform from scratch, and based on that success, the company expanded the team with two additional engineers while promoting me to Project Lead—directing the team while continuing active hands-on development.

## The Modernized Signage Platform

The legacy system relied on Android mini-PCs driving wall monitors that launched a webview pointing to a URL: a PHP script that parsed customer IDs via query parameters, queried the database, and rendered static templates.

The new architecture I engineered prioritized operational reliability: a universal responsive web client operating identically across desktop browsers or hardware webviews, a flexible programming grid featuring content playlists with time-block scheduling, screen-specific localized metadata, and an administrative control panel to manage clients, hardware screens, and media assets.

I built the backend using Lumen (Laravel's micro-framework optimized for high-performance REST APIs) and AngularJS for both the administrative portal and display client runtimes. This project represented my first deep immersion in Angular.

## Funeral Home Sales Platform with Electronic Invoicing

A tablet-optimized web application combining CRM, quotation management, and point-of-sale capabilities for premium funeral homes, featuring real-time fiscal electronic invoice issuance integrated with Argentina's AFIP tax agency. It has its own project case study.

## On-Screen In Memoriam Guestbook Messages

A digital guestbook module enabling distant relatives and friends who could not attend services in person to submit condolences and memorial photographs, which rotated dynamically on screens within the memorial chapel. Upon commissioning the service, families received a secure portal link to share with their social network.

Content moderation was critical: messages were submitted by the public to be displayed during solemn memorial services. I built an automated keyword filter for immediate screening, combined with a private mobile interface where a designated family administrator had to explicitly review and approve each photo and message before it appeared on the chapel display.

It was a project where I was keenly aware that software is not just abstract code, but an artifact operating within delicate human realities, demanding the highest technical care and reliability.

## Business Results

The revamped signage platform and new software offerings expanded the company's market footprint and accelerated client acquisition. During that period, company sales grew by approximately 50%—a figure I share prudently as it reflects operational memory rather than an audited financial report.
