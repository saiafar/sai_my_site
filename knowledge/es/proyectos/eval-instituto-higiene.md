---
title: EVAL, sistema de pacientes, muestras y resultados del Instituto Nacional de Higiene
summary: Sistema del laboratorio nacional de referencia de Venezuela, con más de cien pruebas y un modelo de datos que permite redefinir exámenes y fórmulas sin tocar el código.
organizacion: Instituto Nacional de Higiene «Rafael Rangel»
rol: Análisis, diseño de la base de datos, desarrollo y despliegue
inicio: 2009-02
fin: 2010-07
tecnologias: [php, postgresql, html, css, javascript, jquery, linux]
parte_de: experiencia/softrain
visibilidad: public
destacado: true
---

## Contexto

El Instituto Nacional de Higiene «Rafael Rangel» es el laboratorio de referencia
del sistema de salud pública venezolano. Las muestras que recogen los institutos
de salud de todo el país se registran en él, y de sus datos salen las
estadísticas nacionales de virología, bacteriología y micología.

Existía un sistema en Visual Basic que se había quedado obsoleto y, sobre todo,
que no permitía actualizar determinados exámenes cuando cambiaban los
procedimientos de laboratorio o la forma de calcular un resultado. El proyecto
salió de una licitación pública, con la condición de que el instituto se quedara
con el control total del sistema al terminar.

El nombre EVAL y su logotipo son míos.

## El reto: exámenes que cambian

Los exámenes de laboratorio cambian con el tiempo. La muestra puede ser la misma
—sangre para una hepatitis A— pero cambian los datos que se registran y la
fórmula con la que se obtiene el resultado. Un examen que antes registraba dos
valores y los comparaba pasa a registrar tres con una regla condicional: si A es
mayor que B, el resultado se calcula con A y C; si no, con B y C.

Un sistema que codifique cada examen a mano queda obsoleto en cuanto cambie el
primero, que es exactamente lo que le había pasado al anterior.

Diseñé una estructura de datos parametrizable que permite al laboratorio definir
y modificar qué campos registra cada examen, configurar las fórmulas y las
reglas de cálculo —incluidas las condicionales— y, lo más importante,
**versionar** esas definiciones: los registros anteriores conservan los campos y
la fórmula con los que se hicieron, y se pueden seguir consultando tal como se
emitieron.

Esa última parte no es un detalle técnico. Un resultado clínico emitido hace
tres años tiene que poder leerse como se emitió, no reinterpretado con las
reglas de hoy.

## Alcance

El flujo real del laboratorio: recepción del paciente con el registro de sus
datos y de los exámenes solicitados, emisión de un recibo con número de control,
toma de muestra, proceso de diagnóstico en los departamentos de Virología,
Bacteriología y Micología, y entrega de resultados por pantalla o impresos con
el formato propio de cada tipo de examen.

Más de cien pruebas organizadas por técnica: cultivos virales, PCR y serologías
—dengue, fiebre amarilla, rabia, polio, sarampión, hepatitis, VIH, VPH y
otras—; hemocultivos, urocultivos, coprocultivos e identificación bacteriana; y
cultivos, sensibilidad antifúngica y serología en micología.

El sistema imprimía también las etiquetas de los tubos y de los resultados, con
una etiqueta por etapa en las muestras de micología que pasan por varias.

## Datos clínicos sensibles

El sistema contiene registros especialmente protegidos —por ejemplo, pacientes
con VIH—, así que el control de acceso no era un añadido: niveles de acceso por
perfil para que cada usuario viera solo lo suyo, reautenticación con usuario y
clave para introducir, modificar o eliminar un resultado, y registro cronológico
de todas las operaciones.

## Restricciones del encargo

Construido sobre PHP y PostgreSQL en cumplimiento del Decreto 3390, que obligaba
a la administración pública venezolana a usar software libre. Multiplataforma,
con cliente web, y con unos requisitos de servidor muy modestos para lo que hoy
se considera normal.

## Mi papel

El equipo de desarrollo éramos dos personas: el líder del proyecto y yo.
Participé en todo el ciclo —levantamiento de información con los departamentos,
diseño de la base de datos, decisiones de arquitectura e infraestructura,
desarrollo completo, diseño de las interfaces y despliegue en el instituto—
siendo un desarrollador que empezaba.

Según tengo entendido, el sistema sigue en uso.
