---
title: Balanza PW, Commercial Smart Scale with ESP32 and Mobile POS
summary: "Integrated hardware and software product: a commercial scale broadcasting live weight readings over Wi-Fi and Bluetooth via an onboard ESP32 microcontroller, paired with MultiPOS PW, a React Native mobile point-of-sale app."
organizacion: PortalWeb
rol: Hardware and software engineering
inicio: 2018-10
fin: 2023-01
tecnologias: [arduino, esp32, react-native, javascript]
parte_de: experiencia/portalweb
portada: /imagenes/proyectos/balanza-pw-kiosco.webp
portada_alt: All-in-one POS scale with touchscreen and printer
portada_2: /imagenes/proyectos/balanza-pw-terminal.webp
portada_2_alt: POS PW mobile terminal in a launch piece
video: /videos/balanza-pw-publicidad.mp4
video_poster: /videos/balanza-pw-publicidad.webp
video_alt: Launch advertising piece for the Balanza PW
galeria:
  - src: /imagenes/proyectos/local-conectado-cobro.webp
    alt: Point-of-sale checkout screen, with quick amounts and payment methods
visibilidad: public
destacado: 2
---

## Context

PortalWeb sought to commercialize its own branded commercial retail scale—the Balanza PW—rather than simply licensing the POS software running on third-party hardware. This transformed the mandate into an integrated hardware-plus-software embedded product, rather than standard web engineering.

The legacy POS system required using a single rigid third-party scale model because it relied on an inflexible proprietary compiled driver that could not be modified. When architecting the next-generation software suite, we also re-engineered the hardware layer, which is where the ESP32 microcontroller came into play.

## How It Works

I programmed the ESP32 microcontroller using the Arduino framework to interface with the electronic load cell weighing module, filtering analog sensor signals, calibrating tares, and broadcasting calibrated real-time weight metrics over the local network via dual Wi-Fi and Bluetooth connectivity.

The ESP32 also hosts an ultra-lightweight HTTP discovery service on a designated port: the local POS network scans the subnet, pings that port, and the scale responds with its hardware UUID and serial number, meaning **it automatically discovers and pairs itself**. In a retail supermarket deploying half a dozen scales across produce and deli counters, zero-configuration auto-discovery makes the difference between a friction-free rollout and hours of manual network configuration.

Dual communication protocols supported two distinct commercial deployment models: over Wi-Fi for larger supermarkets with robust local LAN infrastructure, linking scales directly to centralized POS terminals; and over Bluetooth for small market stalls or food trucks without network infrastructure, pairing the scale directly to an Android smartphone running MultiPOS PW, our React Native mobile POS application. We even commercialized the standalone weighing base without a customer-facing display pole, connecting directly to the cashier's tablet.

## Why It Stands Out in My Career

It is the sole project in my career where the final deliverable was a physical, mass-manufactured hardware device sold in retail channels. Development timelines, fault tolerances, and firmware revisions operate under fundamentally different constraints when patching a bug requires flashing physical microcontroller boards already deployed in customer stores.
