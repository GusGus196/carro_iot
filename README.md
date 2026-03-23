# Smart Car

Proyecto final de sistemas embebidos.

Prótocolo utilizado: MQTT

[Tutorial de funcionamiento](https://www.youtube.com/watch?v=EIxdz-2rhLs)

Características:

1. Modo manual.
2. Seguidor de lineas.
3. Evitador de obstáculos.
4. Mover con GPS.

Material:

- ⁠⁠ESP32 con shield.
- ⁠Chasis.
- 2 ruedas.
- ⁠⁠Pilas 18650 o 3.7V.
- Regulador De voltaje LM2596
- ⁠⁠DRV8833.
- GY-GPS6MV2.
- ⁠⁠Sensor ultrasónico HC-SR04.
- Array de 5 sensores reflectivos TCRT5000.
- Jumpers.

Estructura:

- **include/**: libreria de definiciones y constantes.
- **lib/**: librerias del proyecto (propias).
- **src/**: programa principal.