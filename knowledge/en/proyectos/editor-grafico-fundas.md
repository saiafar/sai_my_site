---
title: In-Browser Graphics Editor for Custom Phone Cases
summary: A layered graphic editor operating natively in the web browser, featuring text formatting, images, vector shapes, and device clipping masks, outputting directly to commercial sublimation printers.
organizacion: Estudio Creativo Saltamontes C.A.
rol: End-to-end design and software development
inicio: 2013-03
fin: 2014-07
parte_de: experiencia/estudio-creativo-saltamontes
tecnologias: [javascript, canvas, php, html, css]
visibilidad: public
---

## Context

A commercial printing manufacturer produced customized mobile phone cases featuring personalized customer photos and typography. They required an interactive web application where end users could design their own phone case layouts directly inside the browser, with strict visual fidelity guaranteeing that what appeared on screen matched the physical print output.

## Core Capabilities

Upon selecting a phone model (iPhone, Samsung Galaxy, etc.), the editor rendered that specific device's die-cut template mask: displaying the camera cutout, microphone pinholes, edge bevels, and printable bleed boundaries.

On this canvas, users could place and manipulate text layers—translating, rotating, altering typography, fills, strokes, drop shadows, and opacity; upload personal raster images with freeform scaling and rotation; add vector shapes; and apply clipping masks constraining images inside graphical frames.

The finalized graphic composition was serialized and dispatched directly from the web platform to the client's high-resolution sublimation case printing hardware.

## Technical Decisions

**Model-specific die-cut masks instead of generic rectangular bounding boxes.** The hardware silhouette of each phone model establishes exact cutouts for lenses, flash modules, and buttons. Without precise clipping outlines, users compose designs that get truncated during manufacturing, creating dissatisfied customers and product returns.

**100% native in-browser execution with zero plugin requirements.** The graphics engine was engineered from scratch in vanilla JavaScript on the HTML5 Canvas API. It functioned essentially as an interactive, lightweight browser-based Photoshop: the custom layer management and alpha-mask compositing algorithms were the most mathematically demanding components, making the seamless user experience possible.

## My Contribution

I conceptualized, designed the UI/UX, and engineered the entire client and server software stack independently.
