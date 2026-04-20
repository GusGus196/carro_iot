# Smart Car


![License](https://img.shields.io/badge/License-GPL_3.0-blue.svg)
![MQTT](https://img.shields.io/badge/-MQTT-660066?style=flat&logo=mqtt&logoColor=white)
![Espressif](https://img.shields.io/badge/-Espressif-E7352C?style=flat&logo=espressif&logoColor=white)
![PlatformIO](https://img.shields.io/badge/-PlatformIO-F5822A?style=flat&logo=platformio&logoColor=white)
![WebSockets](https://img.shields.io/badge/Real--Time-WebSockets-010101?style=flat&logo=socketdotio&logoColor=white)

## Descripción

## Contenido

## Instalación

### Clonar el repositorio

```bash
git clone https://github.com/gusgus196/carro_iot.git
cd carro_iot
```

### Configurar el broker local Eclipse Mosquitto (opcional, solo si no uas público)

Sigue la guía en [`./mosquitto/README.md`](./mosquitto/README.md)

### Control web

Sigue la guía en [`./docs/README.md`](./docs/README.md)

### Firmware

Descargar la extensión PlatformIO y cargar el proyecto al ESP32.

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
* Resistencias (220–330 Ω)

>[!CAUTION]
> Verificar que la suma de los amperajes de todos los componentes no supere el amperaje que proporciona la fuente de energía.