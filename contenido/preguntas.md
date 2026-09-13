# Preguntas frecuentes

Las respuestas salen de la misma base de conocimiento que consulta el asistente
del sitio, y cada afirmación enlaza al documento que la respalda. Si lo que
buscas no está aquí, pregúntaselo directamente al asistente en la portada.

## ¿Qué experiencia tiene en bases de datos?

Llevo diecinueve años trabajando con bases de datos relacionales, habitualmente con PostgreSQL, MySQL y MariaDB [1](/perfil/rafaias-villan) [9](/perfil/rafaias-villan). A lo largo de mi trayectoria he diseñado y gestionado modelos de datos complejos para diversos proyectos [2](/experiencia/freelance-2014-2016) [4](/proyectos/agente-ia-corporativo) [5](/experiencia/salud-vargas) [8](/proyectos/chispa-sport-estadisticas) [10](/proyectos/local-conectado) [12](/proyectos/kronaly).

En el desarrollo de un sistema de estadísticas de béisbol y softbol, diseñé una base de datos en PostgreSQL para registrar el contexto detallado de cada jugada y calcular estadísticas avanzadas, o *splits* [8](/proyectos/chispa-sport-estadisticas). En otra etapa, ante la lentitud de un sistema heredado de nómina, creé una consulta rápida apoyándome en una réplica de la base de datos en PostgreSQL [5](/experiencia/salud-vargas), y para el agente de IA Lucía configuré una base de conocimiento con búsqueda semántica sobre PostgreSQL utilizando pgvector [4](/proyectos/agente-ia-corporativo). También he trabajado directamente con bases de datos MySQL y MariaDB conectadas a aplicaciones en PHP nativo y Laravel [2](/experiencia/freelance-2014-2016) [9](/perfil/rafaias-villan).

## ¿Ha trabajado en aplicaciones móviles?

Sí, he trabajado en varias aplicaciones móviles a lo largo de mi trayectoria. Desarrollé una aplicación móvil híbrida en PhoneGap para la Asociación de Scouts de Venezuela [2](/experiencia/estudio-creativo-saltamontes). En el proyecto Chispa Sport, creé las aplicaciones móviles y publiqué mi primera aplicación en Google Play [1](/proyectos/chispa-sport-estadisticas) [9](/experiencia/freelance-2014-2016), incluyendo una aplicación para que el anotador registrara los partidos en directo [7](/proyectos/chispa-sport-estadisticas). Además, como parte de Local Conectado, desarrollé MultiPOS PW, un punto de venta móvil en una aplicación construida en React Native para un terminal Android [3](/proyectos/local-conectado).

## ¿Qué experiencia tiene con servidores, contenedores e infraestructura?

Empecé montando los primeros contenedores Docker en el propio servidor del ERP, configurando a mano un proxy inverso con Nginx por delante de Apache [1](/experiencia/visados-empresas). Al contratar la empresa un segundo servidor, instalé Dokploy para gestionar los servicios, incluyendo RustDesk como servidor de escritorio remoto, n8n, Excalidraw y aplicaciones internas [1](/experiencia/visados-empresas). El despliegue continuo se realizó primero con GitHub Actions y después ligando cada servicio en Dokploy a su repositorio con ramas de desarrollo, pruebas y producción [1](/experiencia/visados-empresas).

He administrado diversos servidores, como un servidor Linux con WHM/cPanel para el ERP y webs, un segundo servidor con AlmaLinux para contenedores [2](/experiencia/visados-empresas), un servidor Linux en la oficina de Imvinet con copias de seguridad y despliegues [4](/experiencia/imvinet), y un Windows Server en Google Cloud migrado posteriormente a Linux [5](/experiencia/portalweb). En mi etapa en la Dirección Estadal de Salud de Vargas, instalé mi primer servidor Debian junto con compañeros, y administré equipos con Squid para el control de acceso a Internet, un cortafuegos con iptables y el servidor DHCP de la red [6](/experiencia/salud-vargas). 

En cuanto a infraestructura física y de red, también me he encargado de configurar switches y cableado estructurado, incluido su cambio completo durante una remodelación de oficina [6](/experiencia/salud-vargas).

## ¿Qué ha hecho con inteligencia artificial y automatización?

En cuanto a inteligencia artificial y automatización, he añadido automatización con n8n y he desarrollado modelos generativos y agentes de IA conectados a sistemas corporativos reales, empleando búsqueda semántica y embeddings generados en local [2](/perfil/rafaias-villan). 

Un ejemplo es Lucía, un agente de IA conectado al ERP de una empresa y a una base de conocimiento con búsqueda semántica sobre PostgreSQL con pgvector [1](/proyectos/agente-ia-corporativo). Este asistente permite realizar consultas en lenguaje natural desde Microsoft Teams —a través de un bot en Azure— sobre si un proyecto está facturado, qué archivos ha subido un cliente, qué servicio se presta, qué tareas quedan pendientes o qué acciones ha hecho cada usuario [1](/proyectos/agente-ia-corporativo). Para vectorizar la documentación, instalé un modelo de embeddings local con Ollama en el propio servidor para mantener los datos seguros y evitar costes de reindexación, delegando la generación de respuestas en un servicio externo [1](/proyectos/agente-ia-corporativo). 

Asimismo, he montado flujos en n8n conectados a un CRM mediante una API para leer correos del buzón de contacto y formularios web, clasificar a cada contacto con IA según sea o no un cliente potencial, responder automáticamente invitando a agendar una cita, registrar el contacto y crear el seguimiento, descartándolo si a las setenta y dos horas no hay respuesta ni cita [3](/experiencia/visados-empresas). También he configurado una prospección automática que busca noticias de empresas en expansión internacional, obtiene sus contactos y los carga en el CRM para el equipo comercial [3](/experiencia/visados-empresas). Adicionalmente, sobre la base de Lucía probé una plataforma de agentes autoalojada con un asistente multiagente en WhatsApp capaz de escribir en un vault de Obsidian, gestionar correo en Microsoft 365 y generar aplicaciones web bajo demanda, aunque esto último se quedó en fase de pruebas [9](/proyectos/agente-ia-corporativo).

## ¿Qué tipo de productos y sistemas ha construido?

He construido y modernizado una amplia variedad de sistemas y productos a lo largo de mi trayectoria. Entre ellos destacan plataformas de punto de venta como Local Conectado —que unifica balanzas, cajas, puntos de venta móviles, pantallas y gestores de turnos [5](/proyectos/local-conectado)—, así como una balanza con ESP32 derivada de la misma [7](/experiencia/portalweb). También he desarrollado plataformas de cartelería digital con administración completa, parrillas de programación y rotación de contenidos [6](/experiencia/neo-sepelios), sistemas de laboratorio para instituciones públicas [8](/experiencia/softrain), y herramientas especializadas de estadística de béisbol y softbol con modelos de datos complejos para registrar contextos de jugadas [12](/proyectos/chispa-sport-estadisticas).

En el ámbito web y de automatización, he creado plugins para WooCommerce que sincronizan catálogos e inventarios complejos [1](/proyectos/sincronizacion-catalogo-woocommerce), así como soluciones integradas con modelos de lenguaje para generar contenidos, migrar blogs y reestructurar páginas enfocadas en SEO [4](/experiencia/visados-empresas). Asimismo, he llevado a cabo trabajos de visualización arquitectónica mediante el modelado y renderizado de proyectos para diferentes empresas [11](/proyectos/modelado-3d-y-diseno). Gran parte de este trabajo se ha centrado en modernizar sistemas heredados, automatizar procesos manuales y conectar herramientas que antes no se comunicaban entre sí [2](/perfil/rafaias-villan).

## ¿En qué sectores ha trabajado?

He trabajado en una decena de sectores distintos, y la variedad no ha sido casual: cada uno impone restricciones que los demás no tienen.

En los últimos años, movilidad internacional: toda la tecnología de un grupo de cuatro empresas —sistemas, soporte, compras, telefonía, desarrollo y automatización— [1](/experiencia/visados-empresas).

Sanidad y administración pública en tres frentes: la red de hospitales y ambulatorios del estado Vargas, que fue mi primer empleo [2](/experiencia/salud-vargas); el sistema de pacientes, muestras y resultados del Instituto Nacional de Higiene [3](/experiencia/softrain); y el portal del Municipio Chacao de Caracas [4](/experiencia/oruga-films).

Comercio y retail: cuatro años en soluciones de punto de venta para el comercio chileno [5](/experiencia/portalweb), el ecosistema que sustituyó a un punto de venta heredado en C# [6](/proyectos/local-conectado) y la sincronización del catálogo de un mayorista de relojes con su ERP [7](/proyectos/sincronizacion-catalogo-woocommerce).

Señalización digital, en dos empresas y dos nichos: pantallas para Empresas Polar, Farmatodo y cadenas de licorerías [8](/experiencia/imvinet), y la plataforma para funerarias [9](/experiencia/neo-sepelios).

Y tres más: deporte, con la plataforma de estadísticas Chispa Sport y los Leones del Caracas [10](/experiencia/freelance-2014-2016); automoción, en el sistema de gestión de un grupo de concesionarios Renault [11](/experiencia/goto-systems); y empleo, con el portal de bolsa de trabajo Comunidad Laboral [12](/experiencia/arconsoft).

## ¿Cuántos años de experiencia tiene?

Llevo diecinueve años de experiencia continua en tecnología, desde enero de 2007, sin interrupciones entre una etapa y la siguiente [1](/perfil/rafaias-villan).

## ¿Ha dirigido equipos o tenido empresa propia?

Las dos cosas.

Dirijo equipos desde 2010, siempre pequeños: mi primer puesto liderando fue el portal del Municipio Chacao [1](/experiencia/oruga-films), y después vinieron la dirección técnica de Imvinet con tres personas [2](/experiencia/imvinet), dos en NeoSepelios en remoto [3](/experiencia/neo-sepelios) y hasta cuatro en PortalWeb [4](/experiencia/portalweb). En todas ellas trabajé directamente con el CEO o el dueño de la empresa [5](/perfil/rafaias-villan).

Entre 2013 y 2014 tuve estudio propio: el Estudio Creativo Saltamontes, del que fui cofundador y director creativo, con un equipo externo de desarrolladores .NET [6](/experiencia/estudio-creativo-saltamontes).

La mayor responsabilidad, sin embargo, no se mide en personas a cargo: entre enero de 2025 y agosto de 2026 llevé toda la tecnología de un grupo de cuatro empresas como responsable corporativo de sistemas de información [7](/experiencia/visados-empresas).

## ¿Cómo aborda el diseño de una arquitectura y qué retos ha resuelto?

He participado en el ciclo completo de un producto —análisis de la necesidad, diseño de la arquitectura, desarrollo, integraciones, infraestructura, despliegue, documentación y coordinación del equipo—, lo que hace que tienda a mirar primero el proceso de negocio que hay detrás y solo después la pieza técnica [2](/perfil/rafaias-villan). Buena parte de mi trabajo ha consistido en modernizar sistemas heredados, automatizar procesos manuales y conectar herramientas que antes no se hablaban entre sí [2](/perfil/rafaias-villan). He resuelto encargos como una emisión de facturas bloqueada por un módulo sin código fuente, un sistema nacional cuyo código se había perdido, webs atascadas en versiones antiguas o un ERP inmodificable [2](/perfil/rafaias-villan). 

Entre los retos específicos que he resuelto se encuentra el de EVAL, un sistema para el Instituto Nacional de Higiene donde los exámenes de laboratorio y sus fórmulas cambiaban con el tiempo [10](/proyectos/eval-instituto-higiene). Para evitar que el sistema quedase obsoleto, diseñé una estructura de datos parametrizable que permite definir y modificar campos, configurar reglas de cálculo y versionar las definiciones para que los registros anteriores conserven los campos y la fórmula con los que se emitieron [10](/proyectos/eval-instituto-higiene). 

En el desarrollo de Kronaly, una plataforma SaaS de recursos humanos y registro horario, organicé el backend en Laravel con diseño dirigido por el dominio para poder dividir el sistema en servicios independientes si escalaba, utilizando React en el frontend, PostgreSQL y contenedores Docker con despliegue automático [6](/proyectos/kronaly). En Lucía, un agente de IA conectado al ERP, resolví integrar dos fuentes —una base de conocimiento con búsqueda semántica sobre PostgreSQL con pgvector y un servidor MCP propio conectado al ERP—, generar los embeddings en local con Ollama para mantener los datos de la empresa en el servidor y ubicar el asistente en Microsoft Teams [11](/proyectos/agente-ia-corporativo). Además, en un proyecto de asistente profesional con RAG sobre PostgreSQL, resolví el problema de recuperación cortando por secciones semánticas y anteponiendo el título del documento y la ruta de encabezados para codificar el contexto en el vector [7](/proyectos/sitio-personal-rag).
