# Lo que falta en el corpus

Este fichero empieza por `_`, así que la ingestión lo ignora: no llega a la base
de datos y el asistente no puede citarlo. Es una lista de trabajo, no contenido.

Actualizado el 12 de septiembre de 2026, después de incorporar tu relato
completo de la trayectoria.

## Dónde estamos

El corpus ya no sale de LinkedIn. Son **12 etapas desde enero de 2007**, sin
huecos, con tu formación y **16 fichas de proyecto**, escritas a partir de los
documentos que redactaste. Lo que faltaba en la versión anterior —el porqué de
cada decisión, lo que salió mal, el contexto real— está ahora en los
documentos.

Lo que queda es de otro tipo: cifras con denominador, algunas confirmaciones y
mantenimiento del sistema.

## 1. Cifras que siguen sin denominador

Es lo que más rinde por palabra escrita. Una cifra sin base es peor que ninguna.

- **PortalWeb, el 70 % de mejora en la emisión de DTE.** Lo retiré de la ficha
  porque en tus notas queda como «confirmar a qué se refería». Si recuerdas qué
  medía —tiempo por documento, documentos rechazados, horas de soporte—, vuelve
  con su base y es una cifra fuerte.
- **NeoSepelios, el 50 % de aumento de ventas.** Está en la ficha descrito como
  aproximado y de memoria. Si puedes acotar el periodo, gana mucho.
- **El 60 % de PortalWeb** sí está y lo consideras sólido. Le falta el periodo:
  ¿en cuánto tiempo?
- **Volúmenes que tú mismo dejaste abiertos:** cuántas muestras al año movía
  EVAL y cuántos centros enviaban, cuántas funerarias o pantallas usaban la
  plataforma de NeoSepelios, cuántos comercios y balanzas llegó a haber en
  PortalWeb, cuántas personas usaban Lucía, y si hay alguna cifra real del
  embudo comercial (contactos al mes, citas generadas).

## 2. Confirmaciones menores

Están en las «preguntas pendientes» de tus propias fichas. Ninguna bloquea nada,
pero cada una que resuelvas hace el corpus más difícil de rebatir:

- Cómo implementaste los exámenes configurables de EVAL (¿tablas de definición
  por examen, fórmulas guardadas como expresiones?) y cuándo entró en
  producción.
- Cada cuánto consultaba la API el agente Java de ACO, y si los reproductores
  eran Windows o Linux.
- Con qué se comunicaban la aplicación de caja y la pantalla en el gestor de
  colas de Farmatodo.
- Qué base de datos usaba Local Conectado en el servidor, y para qué la SQLite
  de la balanza.
- Cuántas personas tenía el grupo Cucalón Estévez en total.

## 3. Material gráfico

Las fichas no tienen una sola imagen. Tienes capturas y renders que valen mucho:
los modelos 3D de la Balanza PW y el MultiPOS, los fotogramas de los vídeos
promocionales, las pantallas de Chispa Sport y las de Kronaly.

⚠️ **Las capturas de Kronaly muestran nombres y datos de otros empleados.** Hay
que rehacerlas con datos de demostración antes de publicar ninguna.

## 4. Mantenimiento del sistema

- **Repasar las respuestas esperadas de `eval/questions.json`.** Se escribieron
  con 8 documentos y ahora hay 29. Dos de los tres fallos actuales no son
  fallos: a «¿qué experiencia tiene con PostgreSQL?» el sistema responde con
  Softrain, Chispa Sport y este mismo sitio, que son fuentes correctas y no
  estaban en la lista. Mientras no se repase, el recall mide de menos.
- **Límite conocido:** «¿ha trabajado con hardware o electrónica?» no recupera
  la ficha de la Balanza PW. La ficha es la primera del ranking léxico, pero el
  modelo de embeddings —`multilingual-e5-small`, 384 dimensiones— no la
  considera cercana, y la fusión premia a los fragmentos que aparecen en los dos
  rankings. Se arreglaría con un modelo de embeddings mayor, no con más texto.
- **Escribe pensando en cómo se busca.** Un nombre propio que no aparece escrito
  no se puede encontrar: la búsqueda semántica no sabe qué es «Kronaly» y solo
  el índice léxico puede encontrarlo. Hasta hoy, seis productos —EVAL, Kronaly,
  Local Conectado, portalDS, Balanza PW y MultiPOS PW— no aparecían nombrados en
  su propia ficha, y preguntar por ellos no los encontraba.

## 5. Contenido que no existe todavía

- **Notas técnicas.** La sección está vacía. Cualquier decisión que hayas tomado
  y puedas explicar —por qué DDD en Kronaly, por qué embeddings en local, por
  qué Dokploy y no otra cosa— es material que ningún otro candidato tiene.
- **La etapa actual.** El sitio dice que la etapa en Cucalón Estévez terminó en
  agosto de 2026 y no dice nada más. Cuando decidas cómo quieres presentar tu
  situación, se añade en una línea del perfil.
