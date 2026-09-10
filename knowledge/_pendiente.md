# Lo que falta en el corpus

Este fichero empieza por `_`, así que la ingestión lo ignora: no llega a la base
de datos y el asistente no puede citarlo. Es una lista de trabajo, no contenido.

## Lo que hice y lo que no

Todo lo que hay en los documentos sale de tu perfil de LinkedIn. **No he
inventado ni un dato**: ni una cifra, ni una tecnología, ni una decisión
técnica. Lo que sí he hecho es sacarlo del registro de currículum y pasarlo a
prosa llana, y agrupar por densidad de contenido —los proyectos de una sola
línea están como secciones dentro de su experiencia, porque una ficha de tres
frases se recupera mal y se lee peor.

Donde LinkedIn dice «lideré», «logré» o «desarrollé» sin más, el documento dice
eso y nada más. No he rellenado los huecos.

## El problema de fondo

Un CV cuenta **qué** hiciste. Lo que distingue a un candidato en una
conversación técnica es **por qué lo hiciste así**, y eso no está en LinkedIn
porque LinkedIn no lo pide.

Ahora mismo, si alguien pregunta al asistente «¿cómo aborda el diseño de una
arquitectura?», tiene poco que responder: hay hechos, pero casi ningún
razonamiento. Las secciones que faltan son justo las que convierten el sitio en
algo que no se puede replicar copiando tu perfil.

## Lo que solo tú puedes escribir

Para cada proyecto con ficha propia, tres cosas:

1. **Qué alternativa descartaste y por qué.** Es lo más valioso que puedes
   escribir. «Elegí Laravel» no dice nada; «elegí Laravel sobre X porque el
   equipo ya lo conocía y el plazo era de seis semanas» dice cómo decides.
2. **Qué salió mal.** Lo que costó más de lo previsto, lo que hubo que rehacer,
   lo que aprendiste a la fuerza. Un CV miente por omisión aquí, y es
   exactamente donde este formato te diferencia.
3. **Números concretos.** Volúmenes, tiempos, usuarios, coste. Ya tienes tres
   cifras buenas (60 %, 70 %, 50 %); les falta el denominador. ¿60 % sobre qué
   base y en cuánto tiempo?

## Preguntas por documento

**plataforma-rrhh-control-horario** — ¿Cuántos empleados y cuántas entidades
gestiona? ¿Por qué multi-tenant y no instalaciones separadas, más allá del
coste? ¿Qué te dio más problemas: el cálculo de jornada, las ausencias o la
auditoría? ¿Qué hacía la empresa antes de tenerla?

**cuadro-de-mando-holded** — ¿Qué preguntas de dirección no se podían responder
antes? ¿Cuánto se tardaba en cuadrar los datos a mano? ¿Qué no encajaba entre
Holded y el ERP y cómo lo resolviste?

**recuperacion-sistema-yii** — Esta es tu mejor historia y está a medias.
¿Cuánto código faltaba? ¿Cómo dedujiste lo que hacía? ¿Cuánto tardaste? ¿Qué
pasaba mientras tanto con el inventario nacional? ¿Qué habrías hecho distinto?

**ecosistema-punto-de-venta** — ¿60 % sobre qué cifra y en cuánto tiempo?
¿Cuántos establecimientos lo usan? ¿Por qué Electron para la cartelera? ¿Qué
falló al conectar con el POS?

**api-dte-sii-chile** — ¿70 % en qué unidad: minutos por documento, documentos
por hora, tasa de error? ¿Cuál fue la parte difícil del SII? ¿Qué volumen de
documentos maneja?

**balanza-comercial-esp32** — ¿Llegó a venderse y cuántas unidades? ¿Qué
problemas dio el hardware? ¿Por qué ESP32?

**presupuestos-facturacion-afip** — ¿Qué tamaño tenía el equipo que lideraste?
¿Qué aprendiste liderando por primera vez?

## Lo que falta por completo

- **Visados Empresas**: la modernización de aplicaciones legacy, la
  automatización con n8n y la integración de IA no tienen ficha porque no hay
  material suficiente. Son tres de tus proyectos más actuales y más vendibles.
- **`knowledge/tecnologias/`**: vacío. Un documento por tecnología sobre la que
  tengas algo real que contar —PostgreSQL, Laravel, Docker, n8n— con cómo la
  usas y qué opinas de ella tras años de uso.
- **`knowledge/notas/`**: vacío. Decisiones técnicas y aprendizajes escritos al
  detalle, sin proyecto asociado.

## Cosas que verificar

- «Más de 10 años» en tu perfil, pero las fechas suman desde febrero de 2009:
  son más de quince. He usado las fechas, no la frase.
- «openclaw» aparece como aptitud y no sé qué es, así que no lo he incluido en
  ningún documento.
- No he tocado formación ni certificaciones. Si quieres que aparezcan en el
  sitio, dímelo y añado un documento.
