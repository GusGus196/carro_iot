# Smart Car

(Descripción)

## Contenido

## Instalación

1. Clonar el repositorio.
2. Configurar el bróker local Eclipse Mosquitto (opcional), sigue la guía en [`./mosquitto/README.md`](./mosquitto/README.md).
3. Control Web, sigue la guía en [`./docs/README.md`](./docs/README.md).
4. Descargar la extensión ![PlatformIO](https://img.shields.io/badge/-PlatformIO-F5822A?style=flat&logo=platformio&logoColor=white) y cargar el proyecto al ESP32.

## Instrucciones de uso

## Materiales

### Control

* ESP32
* Shield ESP32
* Expansor de pines I2C PCF8574
* Buzzer pasivo

### Chasis (kit 2WD)

* Chasis
* 2 motores de torque (1:48, 3.6–6V)
* 2 llantas
* Rueda loca
* 2 discos encoder
* Tornillería M3

### Motores

* Driver DRV8833

### Sensores

* GPS Neo-6M (GY-NEO6MV2)
* HC-SR04
* Array TCRT5000 (5)
* 2 sensores encoder (FC-03)

### Energía

* Baterías 18650 (2)
* Portapilas
* Regulador de voltaje LM2596
* Capacitor 1000 µF

### Conexión

* Protoboard
* Cables dupont

### Indicadores

* 4 LEDs (rojo y ámbar)
* Resistencias (100 Ω)

> [!CAUTION]
> Verificar que la suma de los amperajes de todos los componentes no supere el amperaje que proporciona la fuente de energía.

## Licencia