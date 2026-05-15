# Smart Car

Establece el control a través de un interfaz web, todo sincronizado mediante una arquitectura distribuida basada en el protocolo MQTT.

Sin aplicaciones móviles, sin servicios propietarios y compatible con brokers públicos o locales.

## Modos de control

|Modo|Descripción|
|:---|:---|
|**Manual**|Control directo con joystick virtual, luces direccionales, preventivas y claxon|
|**Seguidor de línea**|Navegación autónoma siguiendo una línea con sensores IR|
|**Evasión de obstáculos**|Detección y desvío automático de obstáculos con sensor ultrasónico|
|**Navegación GPS**|Envío de coordenadas destino con seguimiento autónomo y visualización en mapa|

## Arquitectura de comunicación

```
  ┌─────────────┐    WebSockets     ┌──────────────┐    TCP/1883     ┌─────────────┐
  │ Control Web │──────────────────►│ Broker MQTT  │────────────────►│ Smart Car   │
  │ (navegador) │◄──────────────────│              │◄────────────────│ (ESP32)     │
  └─────────────┘                   └──────────────┘                 └─────────────┘
```

## Requisitos del firmware

| Librería | Versión | Propósito |
| :--- | :---: | :--- |
| [PubSubClient](https://registry.platformio.org/libraries/knolleary/PubSubClient) | — | Cliente MQTT |
| [ArduinoJson](https://registry.platformio.org/libraries/bblanchon/ArduinoJson) | ^7.2.2 | Serialización JSON |
| [TinyGPSPlus](https://registry.platformio.org/libraries/mikalhart/TinyGPSPlus) | — | Parseo de tramas NMEA |
| [PCF8574](https://registry.platformio.org/libraries/robtillaart/PCF8574) | ^0.4.4 | Expansor de pines I2C |

Definidas en [`platformio.ini`](./platformio.ini) — PlatformIO las instala automáticamente al compilar.

---

## Materiales

| Categoría | Componente | Cant. |
| :--- | :--- | :---: |
| **Control** | ESP32 | 1 |
| | Shield ESP32 | 1 |
| | PCF8574 | 1 |
| | Buzzer pasivo | 1 |
| **Chasis** | Chasis 2WD | 1 |
| | Motor 1:48 (3.6–6V) | 2 |
| | Llanta | 2 |
| | Rueda loca | 1 |
| | Disco encoder | 2 |
| | Tornillería M3 | — |
| **Motores** | Driver DRV8833 | 1 |
| **Sensores** | GPS Neo-6M (GY-NEO6MV2) | 1 |
| | HC-SR04 | 1 |
| | Array TCRT5000 | 1 |
| | Sensor encoder FC-03 | 2 |
| **Energía** | Batería 18650 | 2 |
| | Portapilas 18650 | 1 |
| | Regulador LM2596 | 1 |
| | Capacitor 1000 µF | 1 |
| **Indicadores** | LED rojo | 2 |
| | LED ámbar | 2 |
| | Resistencia 100 Ω | 4 |
| **Conexión** | Protoboard | 1 |
| | Cables dupont | — |

> [!CAUTION]
> Verifica que el consumo total de todos los componentes no supere lo que entrega tu fuente de energía.

---

## Instalación

### 1. Firmware (PlatformIO)

**Requisitos:** [VS Code](https://code.visualstudio.com/) + [PlatformIO](https://platformio.org/install).

1. Clona el repositorio y ábrelo en VS Code.
2. Abre `src/config.cpp` y configura:
   ```cpp
   const char* ssid = "TU_RED";
   const char* password = "TU_CONTRASEÑA";
   const char* mqtt_server = "broker.hivemq.com";
   ```
   El ESP32 se conecta al broker mediante MQTT TCP (puerto 1883).  
   El control web se conecta al **mismo broker** pero por WebSockets.  
   Si usas un broker local, reemplaza `mqtt_server` por la IP correspondiente.
3. Conecta el ESP32 por USB y haz clic en **→ (Upload)** en la barra inferior de PlatformIO.
4. Abre el Monitor Serial (**🔌 (Serial Monitor)**) para verificar la conexión WiFi y MQTT.

### 2. Control Web

Sigue [`web/README.md`](./web/README.md) para instalar dependencias y configurar `web/.env` con el **mismo broker** que usaste en el firmware.

- **Local:** accedes desde `http://localhost:3000`. El broker debe ser alcanzable desde tu PC.
- **Vercel (producción):** el ESP32 debe usar un broker público, ya que la web en la nube no puede alcanzar tu red local.

### 3. Broker local (opcional)

Si prefieres evitar brokers públicos, instala Eclipse Mosquitto en tu red local. Sigue la guía en [`mosquitto/README.md`](./mosquitto/README.md) y actualiza tanto el firmware como `web/.env` con la IP del equipo que ejecuta Mosquitto.

---

## Organización del proyecto

```
smart-car/
├── src/
│   ├── main.cpp          # Punto de entrada del firmware
│   └── config.cpp        # Configuración WiFi, MQTT y pines
├── include/
│   └── config.h          # Headers globales
├── lib/
│   ├── callback/         # Procesa mensajes MQTT entrantes
│   ├── driver/           # Control del driver DRV8833
│   ├── feedback/         # Buzzer y LEDs RGB
│   ├── navegacion/       # Navegación GPS
│   ├── obstaculos/       # Evasión de obstáculos
│   ├── reconnect/        # Reconexión MQTT
│   ├── seguidor_linea/   # Seguidor de línea
│   ├── sensor_velocidad/ # Encoders FC-03
│   ├── setup_wifi/       # Conexión WiFi
│   └── ultrasonico/      # Sensor HC-SR04
├── web/                  # Control Web (Vite + Tailwind + DaisyUI)
├── mosquitto/            # Configuración de Eclipse Mosquitto
├── platformio.ini        # Configuración de PlatformIO
└── test/                 # Pruebas unitarias
```

---

## Comunicación MQTT

### Publicación (web → ESP32)

| Tópico | Payload |
| :--- | :--- |
| `smartcar/accion/modo` | `{"modo":"manual"}` |
| `smartcar/modo/manual` | `{"x":0.5,"y":0.3}` |
| `smartcar/accion/luces` | `{"tipo":"izq"}` |
| `smartcar/accion/claxon` | `{"estado":1}` |
| `smartcar/modo/seguidor` | `{"accion":"activar"}` |
| `smartcar/modo/obstaculos` | `{"accion":"activar"}` |
| `smartcar/modo/navegacion` | `{"accion":"iniciar","lat":19.24,"lon":-103.69}` |

### Suscripción (ESP32 → web)

| Tópico | Payload |
| :--- | :--- |
| `smartcar/estado/ubicacion` | `{"lat":19.24,"lon":-103.69,"error":40,"sat":4,"destino":true}` |

### Valores válidos

| Campo | Valores |
| :--- | :--- |
| `modo` | `manual`, `seguidor`, `obstaculos`, `navegacion` |
| `tipo` | `izq`, `der`, `prev` |
| `accion` | `activar`, `desactivar`, `iniciar`, `detener`, `reanudar` |
| `estado` | `0` (apagar), `1` (encender) |
| `x`, `y` | `-1.0` a `1.0` |

---

## Uso

1. Enciende el ESP32 y verifica la conexión MQTT.
2. Abre el panel web y espera a que el indicador MQTT se ponga verde.
3. Selecciona un modo en el panel superior.
4. Según el modo:
   - **Manual:** usa el joystick, botones de luces y claxon.
   - **Seguidor de línea:** presiona **Iniciar**.
   - **Evasión de obstáculos:** presiona **Iniciar**.
   - **Navegación GPS:** marca un destino en el mapa y presiona **Iniciar**.

---

## Licencia

Distribuido bajo licencia MIT. Ver [`LICENSE.md`](LICENSE.md).