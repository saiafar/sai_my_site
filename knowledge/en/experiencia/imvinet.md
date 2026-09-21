---
title: Head of Technology Operations at Imvinet
summary: Technical direction of a digital signage engineering firm and architecture of ACO, the centralized content management system powering over one hundred commercial displays for clients like Farmatodo and Empresas Polar.
organizacion: Imvinet C.A.
rol: Head of Technology Operations
inicio: 2010-09
fin: 2013-03
tecnologias: [php, mysql, html, javascript, jquery, api-rest, java, cpp, actionscript, json, linux]
visibilidad: public
---

## The Role

Two and a half years, from September 2010 to March 2013, with a Venezuelan digital signage company deploying remotely managed informative and commercial media displays across major enterprise clients, including food and beverage conglomerate Empresas Polar, nation-wide pharmacy chain Farmatodo (retail stores and logistics centers), and liquor store franchises across the country.

My official title was Head of Technology Operations, functioning as Technical Lead: leading development sprints while actively writing code. The team began with two engineers and grew to three midway through my tenure. I reported directly to the company president and owner.

This was my first truly multi-faceted technical leadership role, managing multiple concurrent development pipelines and shifting my responsibilities far beyond just writing code.

## ACO (Online Content Manager)

ACO (Administrador de Contenidos Online) was my primary technical milestone at the company: a web-based CMS that decoupled media content from display templates across a production network of over one hundred distributed screens. It has its own project case study.

## Real-Time Queue Management for Farmatodo Pharmacies

In Farmatodo pharmacy branches, prescription customers drew paper queue tickets while a digital LED counter display ticked upward via physical pushbuttons. Since checkout counters already featured digital signage displays, I integrated the queue ticketing system directly into the screen output: a top banner rendered live ticket numbers accompanied by synchronized text-to-speech audio announcements, while the rest of the display continued looping scheduled video and promotional content.

Enabling cashiers to advance ticket numbers from their POS terminals was an interesting architectural challenge. The cash registers ran distinct operating systems from the media players but shared the retail store's local network. I engineered a lightweight background service in two parts: a native C++ DLL hooking global keystrokes in the background, and a Java tray application managing network communication, configuration, and state.

This hybrid approach was purely pragmatic: capturing low-level system keystrokes required native code, but socket networking and service lifecycle were significantly faster and more reliable in Java. The background utility automatically discovered active media displays across the local subnet and paired each cashier terminal with its corresponding screen.

## Interactive Wayfinding Map for Costa Azul Shopping Mall

An interactive directory and 2D wayfinding map engineered for five large-format touchscreen kiosks in a premier shopping center on Margarita Island. It has its own project case study.

## Infrastructure and Pre-Sales Engineering

I administered the company's internal Linux development servers, hosting ACO, internal testing environments, automated backup routines, and deployment scripts. I also joined executive client discovery meetings and drafted technical proposals—my first experience articulating technical architectures to the stakeholders paying for the solution rather than the developers implementing it.

## Departure

I resigned to co-found my own creative agency on excellent terms: I continued providing transition support until searching for, vetting, and training my replacement, and Imvinet's managing director leased us our first studio office within the very same commercial building.
