# Smart Car

Sistema de vehículo autónomo basado en ESP32 con Control Web en tiempo real y comunicación distribuida mediante MQTT. Compatible con brokers públicos o locales, sin dependencias de aplicaciones móviles ni servicios propietarios.

## Arquitectura

```
  ┌─────────────┐    WebSockets     ┌──────────────┐    TCP/1883     ┌─────────────┐
  │ Control Web │──────────────────►│ Broker MQTT  │────────────────►│ Smart Car   │
  │ (navegador) │◄──────────────────│              │◄────────────────│ (ESP32)     │
  └─────────────┘                   └──────────────┘                 └─────────────┘
```

## Modos

|Modo|Descripción|
|:---|:---|
|**Manual**|Joystick virtual, direccionales, preventivas y claxon|
|**Seguidor de línea**|Navegación autónoma siguiendo una línea con sensores IR|
|**Evasión de obstáculos**|Detección y desvío automático con HC-SR04|
|**Navegación GPS**|Coordenadas destino, seguimiento autónomo y mapa interactivo|

## Hardware

|Categoría|Componente|Cantidad|
|:---|:---|:---|
|**Control**|ESP32|1|
||Shield ESP32|1|
||PCF8574|1|
||Buzzer pasivo|1|
|**Chasis**|Chasis 2WD|1|
||Motor 1:48 (3.6–6V)|2|
||Llanta|2|
||Rueda loca|1|
||Disco encoder|2|
||Tornillería M3|—|
|**Motores**|Driver DRV8833|1|
|**Sensores**|GPS Neo-6M (GY-NEO6MV2)|1|
||HC-SR04|1|
||Array TCRT5000|1|
||Sensor encoder FC-03|2|
|**Energía**|Batería 18650|2|
||Portapilas 18650|1|
||Cargador (recomendado)|1|
||Regulador LM2596|1|
||Capacitor 1000 µF|1|
|**Indicadores**|LED rojo|2|
||LED ámbar|2|
||Resistencia 100 Ω|4|
|**Conexión**|Protoboard|1|
||Cables dupont|—|

> [!CAUTION]
> Verifica que el consumo total no supere lo que entrega tu fuente de energía.

## Dependencias

Instalación automática por PlatformIO al compilar.

|Librería|Versión|
|:---|:---|
|[PubSubClient](https://registry.platformio.org/libraries/knolleary/PubSubClient)|—|
|[ArduinoJson](https://registry.platformio.org/libraries/bblanchon/ArduinoJson)|^7.2.2|
|[TinyGPSPlus](https://registry.platformio.org/libraries/mikalhart/TinyGPSPlus)|—|
|[PCF8574](https://registry.platformio.org/libraries/robtillaart/PCF8574)|^0.4.4|

## Instalación

### Requisitos

[VS Code](https://code.visualstudio.com/) + [PlatformIO IDE](https://platformio.org/install) (extensión). También puedes usar [PlatformIO CLI](https://platformio.org/install/cli).

### Firmware

```bash
git clone https://github.com/rene-nunez/smart-car.git
cd smart-car
```

Abre `src/config.cpp` y configura tu red WiFi y broker MQTT:

```cpp
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* mqtt_server = "BROKER_HOST";
const int port = BROKER_PORT;
```

Conecta el ESP32 por USB y carga el firmware:

- **VS Code:** haz clic en **Upload** en la barra inferior.
- **CLI:** `platformio run --target upload`.

Abre el **Monitor serial** para verificar la conexión WiFi y MQTT.

### Control Web

Sigue el proceso de instalación y configuración especificado en el [README](./web/README.md).

## Instrucciones de uso

1. Enciende el ESP32.
2. Abre el Control Web. Verifica que el indicador MQTT muestre el estado **Conectado**.
3. Selecciona un modo.

## Comunicación MQTT

### Tópicos

|Dirección|Tópico|Payload|
|:---|:---|:---|
|Publicación|`smartcar/accion/modo`|`{"modo":"manual"}`|
|Publicación|`smartcar/modo/manual`|`{"x":0.5,"y":0.3}`|
|Publicación|`smartcar/accion/luces`|`{"tipo":"izq"}`|
|Publicación|`smartcar/accion/claxon`|`{"estado":1}`|
|Publicación|`smartcar/modo/seguidor`|`{"accion":"activar"}`|
|Publicación|`smartcar/modo/obstaculos`|`{"accion":"activar"}`|
|Publicación|`smartcar/modo/navegacion`|`{"accion":"iniciar","lat":19.24,"lon":-103.69}`|
|Subscripción|`smartcar/estado/ubicacion`|`{"lat":19.24,"lon":-103.69,"error":40,"sat":4,"destino":true}`|

Los posibles valores contenidos en el payload de un tópico son los siguientes:

|Campo|Valores|
|:---|:---|
|`modo`|`manual`, `seguidor`, `obstaculos`, `navegacion`|
|`tipo`|`izq`, `der`, `prev`|
|`accion`|`activar`, `desactivar`, `iniciar`, `detener`, `reanudar`|
|`x`, `y`|`-1.0` a `1.0`|

## Contenido

```
src/         Código fuente del firmware
lib/         Librerías propias del ESP32
web/         Control Web
mosquitto/   Configuración del broker local (opcional)
```

## Licencia

Distribuido bajo licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.