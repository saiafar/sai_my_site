---
title: Desarrollador web y técnico de soporte en la Dirección Estadal de Salud de Vargas
summary: "Primer empleo: el sistema de carnetización de los empleados de la red de salud del estado, soporte a usuarios y administración de los servidores Linux del organismo."
organizacion: Dirección Estadal de Salud del Estado Vargas
rol: Desarrollador web y técnico de soporte
inicio: 2007-01
fin: 2008-04
tecnologias: [php, javascript, html, mysql, postgresql, linux, squid, iptables, asterisk, redes]
visibilidad: public
---

## El puesto

Mi primer empleo en el área, entre enero de 2007 y abril de 2008, en el
organismo público que gestiona la red de salud del estado Vargas (hoy La
Guaira): sus hospitales y sus ambulatorios. El puesto tenía dos mitades que en
una administración pequeña son inseparables: desarrollar las aplicaciones
internas y mantener en pie lo que ya había.

Esa doble condición —construir y sostener— es la que sigo teniendo hoy, casi
veinte años después, cuando llevo a la vez el desarrollo y los sistemas de una
empresa.

## Sistema de carnetización

El primer sistema que puse en producción. Una aplicación web en PHP, JavaScript
y MySQL para emitir las credenciales de identificación de los empleados de toda
la red de salud del estado.

El equipo se desplazaba a cada centro y trabajaba desde allí: se buscaba al
empleado, el sistema recuperaba de la base de datos del organismo su centro de
adscripción, su cargo y sus datos, se le tomaba la fotografía y el sistema
componía el carné listo para imprimir en una impresora de tarjetas PVC.

Dio servicio a unos dos mil empleados de cuatro hospitales, incluida la
maternidad, y una decena de ambulatorios.

## Consulta rápida para Nómina

El departamento de Nómina trabajaba con un sistema heredado muy antiguo en el
que consultar un dato era lento. Como para el sistema de carnetización ya había
una conexión a la base de datos de empleados, aproveché esa vía y desarrollé un
módulo web de consulta rápida apoyado en una réplica de esa base en PostgreSQL.

No sustituyó al sistema antiguo: convivió con él resolviendo lo que peor hacía.
Es la primera vez que resolví un problema rodeando un sistema heredado en lugar
de intentar reemplazarlo, algo que he repetido muchas veces después.

## Sistemas, redes y telefonía

Además del desarrollo llevaba el soporte a los empleados —equipos, impresoras,
ofimática— y la parte de infraestructura: instalé, junto a mis compañeros, mi
primer servidor Debian y administré los del organismo, con Squid para el control
del acceso a Internet, un cortafuegos con iptables y el servidor DHCP de la red.

También configuraba los switches y el cableado estructurado de la oficina,
incluido su cambio completo durante una remodelación, y daba soporte a la
centralita telefónica IP sobre Asterisk, para la que hice un curso específico.

Diecisiete años después migré la telefonía corporativa de un grupo de empresas
en España a una centralita virtual en la nube. El problema es el mismo; lo que
cambia es dónde vive la centralita.
