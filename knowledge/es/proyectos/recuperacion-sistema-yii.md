---
title: Recuperación de un sistema en Yii con el código perdido
summary: Recuperación por ingeniería inversa de un sistema del que se había perdido parte del código fuente, que gestiona el inventario nacional del sistema de orquestas de Venezuela.
rol: Análisis y recuperación
inicio: 2023
tecnologias: [php, yii, mysql]
parte_de: experiencia/freelance-2023-2024
visibilidad: public
---

## Contexto

Un sistema construido sobre el framework Yii había perdido parte de su código
fuente. No estaba caído por un error corriente: faltaban piezas, y sin ellas no
había forma de ponerlo en marcha ni de saber qué hacía exactamente.

El sistema gestiona el inventario a nivel nacional del sistema de orquestas de
Venezuela. Eso define lo que había en juego: no era una aplicación que se
pudiera reescribir desde cero con calma, porque los datos y los procesos que
sostiene estaban en uso.

## Mi papel

Análisis exhaustivo del código superviviente e ingeniería inversa para
reconstruir lo que faltaba, hasta dejar el sistema de nuevo en funcionamiento.

## Por qué fue difícil

Recuperar un sistema con el código incompleto es un problema distinto al de
corregir uno que falla. En un fallo corriente sabes qué debería ocurrir y
averiguas por qué no ocurre; aquí había que deducir primero qué debía ocurrir,
partiendo de lo que quedaba: el esquema de la base de datos, las convenciones
del framework y el comportamiento observable de las partes que sí sobrevivían.

## Resultado

El sistema volvió a funcionar.
