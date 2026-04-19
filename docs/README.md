# Control Web

Interfaz web para controlar un Smart Car en tiempo real mediante MQTT sobre WebSockets desde el navegador.

## Modos de operación

El sistema soporta múltiples modos de control:

- **Control manual:** control directo con joystick.
- **Seguidor de línea:** navegación autónoma basada en sensores.
- **Navegación GPS:** envío de coordenadas y visualización de la posición en un mapa.

## Contenido

```text
/docs
├── css/
│   └── style.css        # Estilos globales
├── modules/             # Módulos JavaScript
│   ├── feedback.js      # Estado MQTT y alertas del modo GPS
│   ├── gps.js           # Lógica de navegación GPS con Leaflet
│   ├── joystick.js      # Control en modo manual
│   ├── mqtt.js          # Cliente MQTT
│   ├── seguidor.js      # Modo seguidor de línea
│   └── topics.js        # Definición de tópicos MQTT
├── public/              # Recursos estáticos (Vite)
│   ├── assets/          # Imágenes SVG
│   ├── mapa/            # Capas del mapa
│   └── favicon.svg
├── .env.example         # Ejemplo de configuración
├── index.html           # Entrada principal
├── main.js              # Lógica principal
├── package.json         # Dependencias y scripts
└── vite.config.js       # Configuración de Vite
```

## Comunicación MQTT

La comunicación con el broker MQTT se realiza mediante WebSockets y se centraliza en el módulo [mqtt.js](./modules/mqtt.js), utilizando los tópicos definidos en [topics.js](./modules/topics.js).

Los tópicos se dividen en:

* **Control** (publicación).
* **Estado** (suscripción).

|Tópico MQTT|Tipo|Descripción|
|:--|:--|:--|
|`smartcar/control/modo`|Publicación|Define el modo: `control`, `linea` o `gps`|
|`smartcar/control/joystick`|Publicación|Envía coordenadas normalizadas `x,y`|
|`smartcar/control/claxon`|Publicación|Activa el claxon|
|`smartcar/control/sensor`|Publicación|Activa/desactiva el modo seguidor de línea|
|`smartcar/control/destino`|Publicación|Envía coordenadas del destino `lat,lon`|
|`smartcar/estado/ubicacion`|Suscripción|Recibe posición actual `lat,lon`|
|`smartcar/estado/llegada`|Suscripción|Recibe confirmación de llegada al destino|

### Diagrama de comunicación

```text
   Control Web
        │
        │ MQTT sobre WebSockets
        ▼
   Broker MQTT
        │
        │ MQTT directo
        ▼
    Smart Car
```

## Instalación

### Requisitos

* Node.js y npm (versión 18.0 o superior).
* Broker MQTT (local o público) con soporte para WebSockets.

Dependencias:

* [MQTT.js](https://github.com/mqttjs): comunicación con el broker vía WebSockets.
* [Leaflet.js](https://leafletjs.com/): visualización de mapas.

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/GusGus196/carro_iot
cd carro_iot/docs
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y renómbralo a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con la configuración de tu broker MQTT.  
Consulta `.env.example` para ver las variables requeridas.

### 3. Configuración del broker

Asegúrate de que tu broker MQTT soporte WebSockets.

#### Local

Puedes instalar y configurar cualquier broker MQTT, en este repositorio se incluye una guía para configurar Eclipse Mosquitto. Consulta el [README.md](../mosquitto/README.md) si deseas usarlo.

#### Público

Puedes usar brokers como:

* [broker.emqx.io](https://broker.emqx.io)
* [broker.hivemq.com](https://broker.hivemq.com)
* [test.mosquitto.org](https://test.mosquitto.org)

## Instrucciones de uso

### Opción 1: ejecutar en desarrollo

Este repositorio utiliza [Vite.js](https://vite.dev/) para correr un servidor de desarrollo con host accesible en una red LAN. Si deseas cambiar el puerto del servidor de desarrollo, modifica el archivo [vite.config.js](./vite.config.js).

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:3000  
o en la red local, utiliza la IP mostrada por Vite
```

### Opción 2: generar versión de producción

Genera la carpeta `/dist` con archivos optimizados listos para producción (HTML, CSS y JavaScript). Solo debes subir el contenido de la carpeta `/dist` a tu servicio de hosting.

```bash
npm run build
```