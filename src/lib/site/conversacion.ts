/**
 * Guion de la conversación de ejemplo con Luc.IA.
 *
 * Reproduce una consulta real al agente —estado de un proyecto, resuelto
 * cruzando la documentación interna y el ERP en vivo— pero **todo el contenido
 * es inventado**: el número de proyecto, las fechas, los importes y el nombre
 * de quien tiene la tarea. La captura verdadera no se puede publicar porque
 * lleva la lista de compañeros y un expediente de cliente real, que es la misma
 * razón por la que no se publican las de Kronaly.
 *
 * Se recrea en HTML y no se retoca una imagen porque así se anima, se lee en
 * cualquier tamaño, pesa unos kilobytes y se traduce: una captura es un ladrillo
 * en un idioma.
 */
import type { Lang } from '../i18n';

export interface FilaConversacion {
  titulo: string;
  texto: string;
  meta: string;
}

export interface GuionConversacion {
  nombre: string;
  estado: string;
  pregunta: string;
  intro: string;
  tarjeta: {
    titulo: string;
    subtitulo: string;
    etiqueta: string;
    filas: FilaConversacion[];
  };
  cierre: string;
  /** Texto de la caja de escribir, donde se teclea la pregunta. */
  marcador: string;
  /** Deja claro que es una recreación. No es letra pequeña: es el motivo. */
  aviso: string;
}

const GUIONES: Record<Lang, GuionConversacion> = {
  es: {
    nombre: 'Luc.IA',
    estado: 'asistente interno · en línea',
    pregunta: 'Hola Luc.IA, ¿puedes darme el estado del proyecto 31042?',
    intro: 'Claro. He consultado el ERP y este es el estado del proyecto 31042:',
    tarjeta: {
      titulo: 'Proyecto 31042',
      subtitulo: 'Estado general',
      etiqueta: 'En curso',
      filas: [
        {
          titulo: 'Facturación',
          texto: 'El proyecto ya está facturado.',
          meta: 'Facturado · pendiente de cobro',
        },
        {
          titulo: 'Documentación del cliente',
          texto: 'Los documentos del cliente están subidos al sistema.',
          meta: '5 archivos · actualizado hoy, 09:42',
        },
        {
          titulo: 'Tareas',
          texto: 'Marta Ruiz tiene programado contactar con el cliente para revisar la documentación.',
          meta: 'Hoy, 16:00',
        },
      ],
    },
    cierre:
      'Si necesitas más detalle puedo abrir el desglose de la facturación, los documentos cargados o el historial de comunicaciones.',
    marcador: 'Escribe un mensaje',
    aviso: 'Recreación con datos de ejemplo',
  },
  en: {
    nombre: 'Luc.IA',
    estado: 'internal assistant · online',
    pregunta: 'Hi Luc.IA, can you give me the status of project 31042?',
    intro: 'Of course. I checked the ERP and here is the status of project 31042:',
    tarjeta: {
      titulo: 'Project 31042',
      subtitulo: 'Overall status',
      etiqueta: 'In progress',
      filas: [
        {
          titulo: 'Invoicing',
          texto: 'The project has already been invoiced.',
          meta: 'Invoiced · payment pending',
        },
        {
          titulo: 'Client documents',
          texto: 'The client’s documents have been uploaded to the system.',
          meta: '5 files · updated today, 09:42',
        },
        {
          titulo: 'Tasks',
          texto: 'Marta Ruiz is scheduled to call the client to review the paperwork.',
          meta: 'Today, 16:00',
        },
      ],
    },
    cierre:
      'If you need more detail I can open the invoicing breakdown, the uploaded documents or the message history.',
    marcador: 'Type a message',
    aviso: 'Recreation with sample data',
  },
};

export function getGuionConversacion(lang: Lang = 'es'): GuionConversacion {
  return GUIONES[lang] ?? GUIONES.es;
}
