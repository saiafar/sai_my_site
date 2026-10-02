import type { Lang } from '../i18n';

export interface Testimonio {
  id: string;
  empresa: string;
  cargo: string;
  relacion: string;
  fecha: string;
  contenido: string;
  destacado?: boolean;
}

interface TestimonioData {
  id: string;
  destacado: boolean;
  es: {
    empresa: string;
    cargo: string;
    relacion: string;
    fecha: string;
    contenido: string;
  };
  en: {
    empresa: string;
    cargo: string;
    relacion: string;
    fecha: string;
    contenido: string;
  };
}

const TESTIMONIOS: TestimonioData[] = [
  {
    id: 'cucalon-ceo',
    destacado: true,
    es: {
      empresa: 'Grupo Cucalón Estévez y Asociados',
      cargo: 'Empresario y autor | CEO de Grupo Cucalón · Movilidad internacional, IA aplicada y estrategia',
      relacion: 'Supervisaba directamente a Rafaías',
      fecha: 'Septiembre 2026',
      contenido:
        'Rafaías es, ante todo, una persona extraordinaria con la que he tenido el placer de trabajar durante casi un año y medio como director de Sistemas del Grupo Cucalón.\n\n' +
        'Como ingeniero de sistemas, destaca por su enorme versatilidad y por su capacidad para desenvolverse con solvencia en ámbitos técnicos muy diferentes. Durante este tiempo ha sido responsable del mantenimiento y la administración de nuestros dos servidores, uno gestionado mediante cPanel y otro mediante una plataforma de despliegue, además de encargarse de la preparación, configuración y soporte de los equipos informáticos de toda la plantilla.\n\n' +
        'Como desarrollador de software ha demostrado igualmente una capacidad excepcional. Domina distintos entornos, lenguajes y tecnologías, entre ellos Python, PHP y diversos sistemas de bases de datos. Con nosotros ha desarrollado herramientas para el cuadro de mandos de la compañía y, de forma completamente autónoma, una suite integral de recursos humanos. También ha asumido el mantenimiento de nuestras páginas web en WordPress, desarrollando automatizaciones y herramientas específicas para su gestión, seguimiento y control SEO.\n\n' +
        'Pero, más allá de sus conocimientos técnicos, destacaría especialmente su autonomía, capacidad de aprendizaje, compromiso y excelente disposición para afrontar cualquier reto. Es uno de esos profesionales capaces de comprender una necesidad, proponer una solución y llevarla a la práctica.\n\n' +
        'Lamentablemente, nuestro proyecto se ha paralizado por circunstancias financieras y no hemos podido seguir contando con su talento. Esta decisión no guarda ninguna relación con su desempeño, que ha sido excelente en todo momento. Recomiendo a Rafaías sin ninguna reserva. Cualquier persona o empresa que esté valorando incorporarlo a su equipo puede ponerse en contacto conmigo directamente. Estaré encantado de facilitarle toda la información necesaria y explicar por qué considero que su contratación sería una magnífica decisión.',
    },
    en: {
      empresa: 'Grupo Cucalón Estévez y Asociados',
      cargo: 'Business Leader & Author | CEO · Global Mobility, Applied AI & Strategy',
      relacion: 'Directly supervised Rafaías',
      fecha: 'September 2026',
      contenido:
        'Rafaías is, above all, an extraordinary person with whom I had the pleasure of working for nearly a year and a half as Director of Systems at Grupo Cucalón.\n\n' +
        'As a systems engineer, he stands out for his immense versatility and his capacity to operate with confidence across widely varied technical areas. During this time, he was responsible for maintaining and administering our two servers—one managed via cPanel and another via a deployment platform—in addition to handling setup, configuration, and IT support for the entire team’s workstations.\n\n' +
        'As a software developer, he has demonstrated exceptional capability. He masters multiple environments, languages, and technologies, including Python, PHP, and various database engines. With us, he developed corporate dashboard tools and, entirely autonomously, an end-to-end human resources suite. He also took over the maintenance of our WordPress websites, building custom automations and tools for administration, monitoring, and SEO control.\n\n' +
        'Beyond technical expertise, I would especially highlight his autonomy, learning speed, commitment, and outstanding readiness to tackle any challenge. He is one of those professionals capable of grasping a business need, engineering a solution, and executing it.\n\n' +
        'Regrettably, our project halted due to financial circumstances and we could no longer retain his talent—a decision completely unrelated to his performance, which was consistently outstanding. I recommend Rafaías without reservation.',
    },
  },
  {
    id: 'visados-legal',
    destacado: true,
    es: {
      empresa: 'Visados Empresas',
      cargo: 'Legal Specialist in Immigration, Visas & Global Mobility',
      relacion: 'Cargo superior, sin supervisión directa',
      fecha: 'Septiembre 2026',
      contenido:
        'He tenido la oportunidad de trabajar con Rafaías en Visados Empresas y destacaría especialmente su capacidad para liderar proyectos técnicos y transformar las necesidades del negocio en soluciones prácticas y eficientes.\n\n' +
        'Su trabajo ha sido clave en la puesta en marcha de automatizaciones, herramientas basadas en inteligencia artificial y mejoras tecnológicas que han optimizado nuestros procesos internos. Además de sus conocimientos técnicos, Rafa destaca por su proactividad, su orientación a resultados y su capacidad para coordinar las entregas y explicar cuestiones complejas de manera clara y accesible.\n\n' +
        'Es un profesional comprometido, resolutivo y con una clara visión de mejora continua, al que recomiendo plenamente para proyectos de liderazgo técnico, automatización y desarrollo.',
    },
    en: {
      empresa: 'Visados Empresas',
      cargo: 'Legal Specialist in Immigration, Visas & Global Mobility',
      relacion: 'Senior role, without direct supervision',
      fecha: 'September 2026',
      contenido:
        'I had the opportunity to work with Rafaías at Visados Empresas and would especially highlight his ability to lead technical projects and translate business needs into practical, efficient solutions.\n\n' +
        'His work was pivotal in implementing automations, artificial intelligence-based tools, and technological enhancements that streamlined our internal processes. In addition to technical depth, Rafa stands out for his proactivity, results orientation, and ability to coordinate deliverables while explaining complex topics in a clear, accessible manner.\n\n' +
        'He is a committed, solution-driven professional with a strong vision for continuous improvement, whom I fully recommend for technical leadership, automation, and software engineering.',
    },
  },
  {
    id: 'visados-immigration',
    destacado: true,
    es: {
      empresa: 'Visados Empresas',
      cargo: 'Immigration Expert | Global Mobility',
      relacion: 'Trabajó en el mismo equipo',
      fecha: 'Septiembre 2026',
      contenido:
        'He tenido la oportunidad de trabajar con Rafaías durante nuestra etapa en Visados Empresas, donde era Director de Sistemas, y destacaría especialmente su predisposición, su capacidad para resolver problemas y su facilidad para aprender y adaptarse a nuevos retos.\n\n' +
        'Durante este tiempo, creó varias aplicaciones que nos ayudaron a simplificar y agilizar nuestro trabajo diario, aportando soluciones muy prácticas a necesidades que iban surgiendo. También supo incorporar herramientas de IA en procesos que ya estaban en funcionamiento, consiguiendo mejorar su eficiencia y optimizar nuestro trabajo.\n\n' +
        'Más allá de sus conocimientos técnicos, destacaría su actitud y su implicación a la hora de buscar soluciones y facilitar el trabajo del resto del equipo. Ha sido un placer trabajar con él y, sin duda, lo recomendaría como un gran profesional para afrontar nuevos retos tecnológicos.',
    },
    en: {
      empresa: 'Visados Empresas',
      cargo: 'Immigration Expert | Global Mobility',
      relacion: 'Worked on the same team',
      fecha: 'September 2026',
      contenido:
        'I had the chance to work with Rafaías during our time at Visados Empresas, where he served as Systems Director, and I would particularly highlight his readiness, problem-solving skills, and ease in learning and adapting to new challenges.\n\n' +
        'During this time, he created several applications that helped simplify and accelerate our daily operations, delivering practical solutions to emerging needs. He also integrated AI tools into existing processes, boosting efficiency and streamlining our workflows.\n\n' +
        'Beyond his technical skills, I would highlight his attitude and dedication to finding solutions and supporting the team. It was a pleasure working with him, and I recommend him as an exceptional professional for new technological challenges.',
    },
  },
  {
    id: 'cucalon-marketing',
    destacado: true,
    es: {
      empresa: 'Grupo Cucalón / Visados Empresas',
      cargo: 'Digital Marketing Manager | Estrategia | SEO | SEM',
      relacion: 'Trabajó en equipos distintos',
      fecha: 'Agosto 2026',
      contenido:
        'Es un profesional de los que ya no quedan, las veces que he trabajado con él siempre ha encontrado soluciones a los problemas que me han podido surgir y además de una manera rápida y eficaz. Tiene una gran mente para desarrollar ideas desde 0 y ponerlas en marcha, solucionando varios problemas de golpe. Además, a nivel personal es alguien con mucha paciencia y empatía, realmente aprendí de él un montón de cosas que sigo usando a día de hoy.',
    },
    en: {
      empresa: 'Grupo Cucalón / Visados Empresas',
      cargo: 'Digital Marketing Manager | Strategy | SEO | SEM',
      relacion: 'Worked across different teams',
      fecha: 'August 2026',
      contenido:
        'He is a rare breed of professional. Every time I worked with him, he consistently solved any problem that arose quickly and effectively. He has a brilliant mind for developing ideas from scratch and executing them, resolving multiple bottlenecks at once. On a personal level, he brings great patience and empathy; I truly learned a lot from him that I still apply today.',
    },
  },
  {
    id: 'linux-infra-architect',
    destacado: true,
    es: {
      empresa: 'Infraestructura & Servidores Linux',
      cargo: 'Senior Systems Architect | Linux Infrastructure Expert',
      relacion: 'Supervisaba directamente a Rafaías',
      fecha: 'Abril 2023',
      contenido: 'Excelente programador, talentoso y creativo.',
    },
    en: {
      empresa: 'Linux Infrastructure & Systems',
      cargo: 'Senior Systems Architect | Linux Infrastructure Expert',
      relacion: 'Directly supervised Rafaías',
      fecha: 'April 2023',
      contenido: 'Outstanding programmer, talented and creative.',
    },
  },
  {
    id: 'imvinet-ceo',
    destacado: true,
    es: {
      empresa: 'IMVINET',
      cargo: 'CEO at IMVINET',
      relacion: 'Supervisaba directamente a Rafaías',
      fecha: 'Septiembre 2016',
      contenido:
        'Tuve el placer de supervisar a Rafaías durante varios años en IMVINET, donde colaboramos en varios proyectos, siendo el precursor y una pieza imprescindible en el desarrollo de nuestra plataforma de tecnología ACO Digital Signage. Más aún, Rafaías tiene la habilidad de entender las necesidades de un cliente para así desarrollar el proyecto con eficiencia y productividad, coexistiendo y haciendo crecer cualquier equipo de trabajo. En pocas palabras, lo recomiendo ampliamente.',
    },
    en: {
      empresa: 'IMVINET',
      cargo: 'CEO at IMVINET',
      relacion: 'Directly supervised Rafaías',
      fecha: 'September 2016',
      contenido:
        'I had the pleasure of supervising Rafaías for several years at IMVINET, where we collaborated on numerous projects. He was the precursor and an essential cornerstone in developing our ACO Digital Signage technology platform. Furthermore, Rafaías has the ability to understand client requirements to execute projects with efficiency and productivity, elevating any engineering team. In short, I highly recommend him.',
    },
  },
  {
    id: 'neo-sepelios-dev',
    destacado: false,
    es: {
      empresa: 'Neo Sepelios',
      cargo: 'Desarrollador',
      relacion: 'Trabajó en el mismo equipo',
      fecha: 'Marzo 2023',
      contenido:
        'Excelente compañero y jefe, tuve la oportunidad de trabajar con él y lo volvería a hacer, tiene grandes ideas y excelente programador.',
    },
    en: {
      empresa: 'Neo Sepelios',
      cargo: 'Developer',
      relacion: 'Worked on the same team',
      fecha: 'March 2023',
      contenido:
        'Great teammate and team lead, had the opportunity to work with him and would gladly do so again; full of great ideas and an excellent programmer.',
    },
  },
  {
    id: 'myallsupport-bdr',
    destacado: false,
    es: {
      empresa: 'myAllSupport',
      cargo: 'Business Development Representative | InterSystems Partner | Soluciones IA',
      relacion: 'Trabajó en equipos distintos',
      fecha: 'Enero 2023',
      contenido:
        'Rafaías Villán es una persona responsable, con mucho talento y alto nivel de conocimiento en el área, 100% recomendado.',
    },
    en: {
      empresa: 'myAllSupport',
      cargo: 'Business Development Representative | InterSystems Partner | AI Solutions',
      relacion: 'Worked across different teams',
      fecha: 'January 2023',
      contenido:
        'Rafaías Villán is a responsible professional, highly talented with deep technical expertise in the field, 100% recommended.',
    },
  },
  {
    id: 'uba-ingeniero-cliente',
    destacado: false,
    es: {
      empresa: 'Universidad Bicentenaria de Aragua',
      cargo: 'Ingeniero en Sistemas',
      relacion: 'Cliente de Rafaías',
      fecha: 'Enero 2023',
      contenido:
        'Recomiendo a Rafaías como excelente programador, sus trabajos son impecables en diseño web y código HTML, C++ y WordPress entre otras.',
    },
    en: {
      empresa: 'Universidad Bicentenaria de Aragua',
      cargo: 'Systems Engineer',
      relacion: 'Client of Rafaías',
      fecha: 'January 2023',
      contenido:
        'I recommend Rafaías as an excellent programmer; his work is flawless in web design, HTML, C++, and WordPress, among others.',
    },
  },
  {
    id: 'qa-especialista',
    destacado: false,
    es: {
      empresa: 'Aseguramiento de la Calidad & Procesos',
      cargo: 'Especialista QA & Procesos | ISTQB CTAL-TM | SFPC | SDC',
      relacion: 'Trabajó en distintas empresas',
      fecha: 'Enero 2023',
      contenido:
        'Rafaías es un recurso valioso, es un trabajador dedicado y con miras a perfeccionar todo proyecto y trabajo que se le presente.',
    },
    en: {
      empresa: 'QA & Process Engineering',
      cargo: 'QA & Process Specialist | ISTQB CTAL-TM | SFPC | SDC',
      relacion: 'Collaborated across different companies',
      fecha: 'January 2023',
      contenido:
        'Rafaías is a valuable asset, dedicated and driven to polish and elevate every project and assignment he undertakes.',
    },
  },
  {
    id: 'microsoft-cloud-security',
    destacado: false,
    es: {
      empresa: 'Arquitectura Cloud Microsoft & IA',
      cargo: 'Arquitecto de Seguridad | IA Arquitectura Cloud Microsoft | MCT',
      relacion: 'Trabajó en equipos distintos',
      fecha: 'Enero 2018',
      contenido:
        'Excelente profesional, dedicado a su trabajo un 100%, una persona con amplios conocimientos en el área de programación.',
    },
    en: {
      empresa: 'Microsoft Cloud Architecture & AI',
      cargo: 'Security Architect | Microsoft Cloud AI Architecture | MCT',
      relacion: 'Worked across different teams',
      fecha: 'January 2018',
      contenido:
        'Outstanding professional, 100% dedicated to his craft, with deep knowledge in software programming.',
    },
  },
  {
    id: 'imvinet-trafico-contenidos',
    destacado: false,
    es: {
      empresa: 'IMVINET',
      cargo: 'Gerente de tráfico y contenidos en IMVINET',
      relacion: 'Proyectos conjuntos en desarrollo web y digital signage',
      fecha: 'Agosto 2017',
      contenido:
        'Rafaías y yo hemos trabajado varios proyectos en conjunto en el área de desarrollo para aplicaciones web y soluciones para digital signage. A lo largo de la relación laboral, Rafaías ha demostrado ser una persona sumamente creativa y con un uso de las herramientas excepcional, además de eso siempre ha aportado un plus a los proyectos logrando generar respuestas eficientes a los requerimientos específicos de cada cliente.\n\n' +
        'Recomendaría a Rafaías para cualquier labor que requiera un profesional comprometido con desarrollar la mejor solución a las necesidades del cliente, labores que requieran trabajo en equipo y compromiso, ya que cuenta con una gran calidad humana y siempre aporta un punto de vista "out of the box".',
    },
    en: {
      empresa: 'IMVINET',
      cargo: 'Traffic & Content Manager at IMVINET',
      relacion: 'Joint projects in web dev and digital signage',
      fecha: 'August 2017',
      contenido:
        'Rafaías and I worked on several projects together in web application development and digital signage solutions. Throughout our professional relationship, Rafaías demonstrated extreme creativity and exceptional mastery of engineering tools. He consistently brought added value to projects, delivering efficient responses tailored to client requirements.\n\n' +
        'I would recommend Rafaías for any role requiring a professional dedicated to creating top-tier solutions, strong teamwork, and commitment, as he brings great human qualities and always provides an "out of the box" perspective.',
    },
  },
  {
    id: 'imvinet-dev-php',
    destacado: false,
    es: {
      empresa: 'IMVINET',
      cargo: 'Desarrollador PHP',
      relacion: 'Rafaías supervisaba directamente al profesional',
      fecha: 'Agosto 2017',
      contenido:
        'Rafaías es un profesional con actitud positiva, proactivo, excelente en el manejo de personal, muy comunicativo, y sabe orientar al personal que tiene a su cargo. Como desarrollador maneja muy bien los lenguajes y herramientas para el desarrollo de un software, tiene capacidad de análisis y sabe resolver situaciones difíciles.',
    },
    en: {
      empresa: 'IMVINET',
      cargo: 'PHP Developer',
      relacion: 'Rafaías directly supervised this team member',
      fecha: 'August 2017',
      contenido:
        'Rafaías is a professional with a positive attitude, proactive, excellent at team management, very communicative, and knows how to guide team members under his charge. As a developer, he is adept with programming languages and software tools, with strong analytical skills and the ability to resolve challenging situations.',
    },
  },
  {
    id: 'globant-software-designer',
    destacado: false,
    es: {
      empresa: 'Globant',
      cargo: 'Software Designer en Globant',
      relacion: 'Asesoró a Rafaías',
      fecha: 'Agosto 2017',
      contenido:
        'Rafaías es un profesional con un conjunto de habilidades particular, en muchas áreas artísticas y creativas, que combina exitosamente con su faceta de desarrollador. Esto, sumado a su madera de emprendedor.',
    },
    en: {
      empresa: 'Globant',
      cargo: 'Software Designer at Globant',
      relacion: 'Advised Rafaías',
      fecha: 'August 2017',
      contenido:
        'Rafaías is a professional with a unique skillset across artistic and creative domains, which he successfully combines with his software engineering facet. This is topped by his entrepreneurial mindset.',
    },
  },
  {
    id: 'uba-lider-tecnico',
    destacado: false,
    es: {
      empresa: 'Universidad / Entorno Académico',
      cargo: 'Líder Técnico',
      relacion: 'Estudió con Rafaías',
      fecha: 'Abril 2023',
      contenido:
        'Recomendado como buen profesional, tiene muchísima experiencia en todo tipo de desarrollo Web. Puntualidad, Responsabilidad y Calidad en su trabajo.',
    },
    en: {
      empresa: 'University / Academic Stage',
      cargo: 'Technical Lead',
      relacion: 'Studied with Rafaías',
      fecha: 'April 2023',
      contenido:
        'Recommended as a solid professional with vast experience across web development. Punctuality, responsibility, and top quality in his work.',
    },
  },
];

export function getTestimonios(lang: Lang = 'es'): Testimonio[] {
  return TESTIMONIOS.map((item) => {
    const loc = lang === 'en' ? item.en : item.es;
    return {
      id: item.id,
      destacado: item.destacado,
      empresa: loc.empresa,
      cargo: loc.cargo,
      relacion: loc.relacion,
      fecha: loc.fecha,
      contenido: loc.contenido,
    };
  });
}
