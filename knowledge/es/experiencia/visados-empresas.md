---
title: Responsable corporativo de sistemas de información en Cucalón Estévez y Asociados
summary: "Toda la tecnología de un grupo de cuatro empresas de movilidad internacional: sistemas, soporte, compras, telefonía, desarrollo, automatización con n8n y un agente de IA conectado al ERP."
organizacion: Cucalón Estévez y Asociados
rol: Responsable corporativo de sistemas de información
inicio: 2025-01
fin: 2026-08
tecnologias: [php, laravel, cakephp, nodejs, react, postgresql, mysql, redis, docker, dokploy, linux, cpanel, nginx, traefik, github-actions, wordpress, n8n, llm, agentes-ia, mcp, pgvector, ollama, microsoft-365, api-rest, holded, figma]
visibilidad: public
---

## El puesto

De enero de 2025 a agosto de 2026, como responsable del departamento de
tecnología de Cucalón Estévez y Asociados, un grupo de cuatro empresas de
consultoría y gestión de movilidad internacional —trámites, permisos de trabajo
y visados— del que Visados Empresas es la marca más conocida, junto a
Permisodetrabajo.eu y Corporate Visa Solutions.

En remoto desde Galicia, reportando directamente al CEO y dueño.

El encargo inicial era mantener el ERP/CRM propio del grupo. El puesto real
abarcaba toda la tecnología de las cuatro empresas: servidores y sistemas,
Microsoft 365, accesos, soporte a los empleados, equipos, compras y licencias,
telefonía y desarrollo de herramientas nuevas.

Es la etapa que mejor describe hacia dónde ha ido mi trayectoria: no un
desarrollador con más responsabilidad, sino la persona que asume toda la
tecnología de una empresa mediana, del soporte al puesto de trabajo hasta el
producto propio.

## Sistemas, soporte y compras

El ERP/CRM del grupo está desarrollado en CakePHP y su código lo administra un
proveedor externo; yo llevaba su mantenimiento y su evolución. Administraba
también el servidor Linux con WHM/cPanel donde viven el ERP y las webs del
grupo, un segundo servidor con AlmaLinux para los contenedores, Microsoft 365
—usuarios, permisos y correo—, Dropbox y la gestión centralizada de todos los
accesos.

En la parte menos visible del puesto: soporte técnico en remoto a los empleados,
mantenimiento de los portátiles que me enviaban y su preparación para las nuevas
incorporaciones, y la responsabilidad de las compras de equipos, servicios y
licencias, con la selección y la autorización de lo que se compraba.

Dirigí además la migración de la telefonía corporativa a una centralita virtual
en la nube, con sus locuciones, sus grupos de salto y sus colas de llamadas. Es
el mismo problema que resolví en 2007 con una centralita Asterisk, dieciocho
años después y sin hardware propio.

## Kronaly

Una plataforma SaaS multi-tenant de recursos humanos y registro horario que
empezó como herramienta interna para sustituir los informes de fichaje de
Microsoft Teams. Tiene ficha propia.

Las cuatro empresas del grupo la usan en producción, cada una como un tenant
distinto, con hasta treinta usuarios activos a la vez. La desarrollé yo solo, de
principio a fin, y al terminar la relación laboral el CEO me cedió todos los
derechos: conservo el código y el dominio.

## Integrar sin tocar el código de otro

Necesitaba leer y escribir en la base de datos del ERP, pero su código lo
mantenía un proveedor externo: cualquier cambio mío podía desaparecer en su
siguiente actualización.

La solución fue una API independiente en Laravel, en su propio contenedor, que
expone e interactúa con la base de datos del ERP sin tocar el código del
proveedor. Es la capa sobre la que se apoyan después el cuadro de mando y las
automatizaciones.

## Cuadro de mando financiero

Une en una sola vista la facturación y los cobros del ERP con los gastos y
estados de cuenta de Holded, el software de contabilidad del grupo, e incorpora
análisis automático con IA y un módulo de comparación con el sector. Tiene ficha
propia. Sigue en uso.

## Infraestructura con contenedores

Empecé montando los primeros contenedores Docker en el propio servidor del ERP,
lo que obligó a configurar a mano el proxy inverso, con Nginx por delante de
Apache, para dirigir el tráfico a cada uno.

Cuando la empresa contrató un segundo servidor instalé Dokploy para gestionar
los servicios en condiciones: RustDesk como servidor propio de escritorio remoto
para dar soporte a los empleados, n8n para las automatizaciones, Excalidraw, y
las aplicaciones internas.

El despliegue continuo fue en dos tiempos: primero con GitHub Actions, que con
cada push a main desplegaban y ejecutaban las migraciones, y después con Dokploy
ligando cada servicio a su repositorio. Con ramas de desarrollo, pruebas y
producción.

## Las webs del grupo

Las webs usaban un tema de WordPress abandonado desde 2022. Con la última
versión de WordPress el tema se rompía, así que no se podía actualizar ni
WordPress, ni PHP, ni Elementor, ni los plugins que dependían de él: webs
lentas, atascadas y con riesgo de seguridad.

Decidí construir un tema propio, limpio y ajustado al contenido real de la
empresa, y actualizar la plataforma. El rendimiento en Google PageSpeed pasó de
unos 30 a entre 90 y 100, con accesibilidad y SEO también entre 90 y 100.

Mantuve Elementor para que marketing pudiera montar sus campañas sin depender de
mí. Esa decisión —no llevármelo todo a mi terreno— es la que hizo que el cambio
aguantara.

Para la web de visados, que tiene muchísimo contenido porque explica los
trámites de cada país, desarrollé un plugin conectado a un modelo de lenguaje
que generaba el contenido de las páginas a partir de un prompt configurable,
migraba y reescribía los artículos del blog antiguo y reestructuraba cada página
en torno a las palabras clave que me pasaba marketing.

## Lucía

El agente de IA corporativo del grupo, accesible desde Microsoft Teams, que
responde sobre la documentación de la empresa y consulta el ERP en tiempo real.
Tiene ficha propia.

De todo lo que construí aquí es lo que más me interesa como línea de trabajo: no
un chatbot, sino un agente conectado a los sistemas reales de la empresa, con
los embeddings generados en local para que los datos no salieran del servidor.

## Automatización del embudo comercial

Los flujos de n8n, conectados al CRM a través de mi API, leen los correos del
buzón de contacto y los formularios de las webs, clasifican cada contacto con IA
según sea o no un cliente potencial, responden automáticamente invitando a
agendar una cita, registran el contacto en el CRM y crean el seguimiento. Si a
las setenta y dos horas no hay respuesta ni cita, lo descartan solos; si la hay,
crean la reunión.

El usuario del sistema que hace ese primer contacto se llama Lucía, igual que el
agente, para que el equipo comercial sepa de un vistazo qué contactos ha llevado
la automatización y cuáles una persona.

Monté también una prospección automática que busca noticias de empresas en
expansión internacional —españolas que abren fuera o extranjeras que abren en
España—, obtiene sus contactos y los carga en el CRM para el equipo comercial.

## Diseño y marca

Redibujé en vectores los logotipos de las empresas del grupo, que solo existían
como imágenes de mapa de bits, y produje material impreso: tarjetas y catálogos
de servicios. Diseñé y monté las landing pages de las campañas, y la identidad
completa —marca, logotipo y web— de Learn and Land, una línea de negocio para
visados de estudiantes que se quedó en concepto.
