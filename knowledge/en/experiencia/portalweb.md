---
title: Full Stack Developer and Technical Lead at PortalWeb
summary: "Four years delivering retail point-of-sale solutions in Chile: resolving electronic invoice regulatory compliance with the SII, implementing digital signage on registers and scales, and leading the new Local Conectado platform."
organizacion: PortalWeb
rol: Full Stack Developer and Technical Lead
inicio: 2018-10
fin: 2023-01
tecnologias: [php, laravel, react, react-native, nodejs, electronjs, socket-io, esp32, arduino, cpp, mysql, sqlite, sql-server, wordpress, google-cloud, aws, linux, figma, cinema-4d, after-effects]
visibilidad: public
---

## The Role

Four years and three months, from October 2018 to January 2023 (spanning the years 2019, 2020, 2021, and 2022), with a Chilean company delivering complete point-of-sale (POS) solutions to retailers: POS software, touchscreen computing scales, fiscal electronic invoicing, and full software and hardware maintenance. In every merchant location, a dedicated local PC server was deployed running the local database, to which cash registers and scale terminals connected.

I worked 100% remotely from Venezuela, reporting directly to the owner. When I joined, the company comprised four people; one year prior to my departure, it had grown to twelve.

I held no formal executive title: our professional relationship was informal from start to finish. My day-to-day role was software engineering, and throughout the second half, technically directing an engineering team of up to four developers.

## The Critical Problem That Brought Me In

The owner needed to unblock an urgent operational crisis: their POS software was built in C#, and fiscal invoice transmission to the Chilean Internal Revenue Service (SII) relied on a closed-source precompiled binary module. When the SII updated its transmission security and schema specifications, the vendor module broke, could not be updated, and the entire merchant network's electronic billing was halted.

Having previously integrated automated electronic invoicing with Argentina's AFIP tax authority at NeoSepelios, I was brought in to architect a fix. The integration I built has its own project case study.

## portalDS and Point-of-Sale Customer Screens

Leveraging my background in digital signage, I proposed adding customer-facing secondary displays to cash registers and deli scales, showing real-time itemized basket subtotals interspersed with dynamic promotional advertisements engineered to drive impulse purchases. I developed portalDS, the content management platform powering these screens, and integrated it into both cash registers and scale hardware.

These interactive displays transformed the commercial appeal of the hardware. The company experienced a surge in scale terminal sales, and with each scale sold, the entire bundled POS software suite was purchased. This initiative drove a 60% increase in company sales, which I consider the most concrete commercial achievement of my career.

## Local Conectado

As retail deployments expanded, the legacy C# POS system revealed severe architectural limitations: while I patched and maintained it, each bugfix inevitably triggered secondary edge cases. We decided to build a modern, distributed platform from the ground up, which I led as chief architect. It has its own project case study, alongside the ESP32 smart scale hardware platform that emerged from it.

I assembled and led the development team along the way: initially a developer with whom I had worked at NeoSepelios, followed by a React Native engineer for the mobile POS application, a dedicated C# developer to maintain the legacy codebase while we engineered the replacement, and ultimately a fourth engineer.

Maintaining a legacy platform while simultaneously building its modern successor is notoriously difficult in software engineering, which is why we dedicated a full-time engineer specifically to keeping the legacy system stable.

## Learning on the Fly

The owner requested UI and behavioral changes in the legacy C# POS desktop client, an environment I had never coded in before. I learned C# and .NET WinForms on the job and delivered the changes promptly. That embodies my approach to engineering: when I do not know a specific technology, I say so transparently, study it overnight, and implement it effectively the next day.

## Infrastructure and Production Support

I managed corporate server infrastructure and deployments: a Windows Server instance on Google Cloud hosting the legacy centralized database managing receipt synchronization, followed by our migration to Linux servers with the rollout of Local Conectado.

I also handled direct tier-3 escalation support for commercial clients. The legacy software failed frequently in the field, and answering those support calls directly informed our new architectural decisions: when the engineer diagnosing production failures is the one designing the new architecture, the resulting system is fundamentally more resilient.

## Marketing and Product Visualization

I led visual design, social media content, and promotional video production for both the smart scale and mobile POS, modeling hardware in Cinema 4D and compositing motion graphics in After Effects. During this tenure, I also integrated Figma into my core workflow for interface prototyping and design systems.
