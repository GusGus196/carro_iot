# Smart Car

Ecosistema de control robótico basado en el protocolo [MQTT](https://mqtt.org). Este repositorio integra el firmware para ESP32, una interfaz de control web y la configuración de un broker MQTT local (opcional).

## Contenido general

  * **`/`**: código fuente del hardware (PlatformIO).
  * **`/docs`**: interfaz de control web (Vite + JavaScript).
  * **`/mosquitto`**: configuración de [Eclipse Mosquitto](https://mosquitto.org/) + reglas de red/firewall para Windows y Linux.

## Instalación

**Clonar el repositorio:**
    ```bash
    git clone https://github.com/gusgus196/carro_iot.git
    cd carro_iot
    ```

**Configurar el Broker:** 

Sigue la guía en [`./mosquitto/README.md`](./mosquitto/README.md)

**Lanzar la web:**

Sigue la guía en [`./docs/README.md`](./docs/README.md)

**Cargar Firmware:**

Descargar la extensión platformIO...

## Material

**Control**
- ESP32 + Shield.
- Buzzer pasivo.

**Motores**
- Chasis 2WD.
- Driver ⁠⁠DRV8833.

**Sensores**
- GPS Neo-6M.
- Ultrasonido HC-SR04.
- Array 5x TCRT5000.

**Energía**
- ⁠⁠Pilas 18650 + portapilas.
- Regulador LM2596.
- Capacitor 1000uF.