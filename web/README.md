# Control Web

Interfaz web para controlar un Smart Car en tiempo real mediante MQTT sobre WebSockets desde el navegador.

## Modos de control

El sistema soporta múltiples modos:

* **Control manual:** control directo con joystick virtual, luces direccionales, preventivas y claxon.
* **Seguidor de línea:** navegación autónoma basada en sensores infrarrojos.
* **Evasión de obstáculos:** detección y evasión automática de obstáculos.
* **Navegación GPS:** envío de coordenadas con visualización en tiempo real sobre mapa interactivo (Leaflet).

## Tecnologías utilizadas

* [Vite](https://vite.dev) — bundler y servidor de desarrollo.
* [Tailwind CSS v4](https://tailwindcss.com) — estilos utility-first.
* [DaisyUI v5](https://daisyui.com) — componentes UI y temas.
* [Heroicons](https://heroicons.com) — iconos SVG.
* [Leaflet](https://leafletjs.com/) — mapas interactivos.
* [MQTT.js](https://github.com/mqttjs) — comunicación con el broker vía WebSockets.

## Instalación

### Requisitos

* [Node.js y npm](https://nodejs.org) (v18.0 o superior).
* Broker MQTT con soporte para WebSockets.

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/GusGus196/carro_iot
cd carro_iot/web
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con la configuración de tu broker MQTT.

### 3. Configuración del broker

Asegúrate de que tu broker MQTT soporte WebSockets.

#### Local

> [!NOTE]
> En este repositorio se incluye una guía para instalar Eclipse Mosquitto. Consulta [mosquitto/README.md](../mosquitto/README.md).

#### Público

Puedes usar brokers como:

* [broker.hivemq.com](https://broker.hivemq.com)
* [broker.emqx.io](https://broker.emqx.io)
* [test.mosquitto.org](https://test.mosquitto.org)

Cada uno utiliza puertos y paths distintos para WebSockets; consulta su documentación.

## Instrucciones de uso

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:

* **Local:** [http://localhost:3000](http://localhost:3000)
* **Red local:** utiliza la IP que se muestra en la terminal.

### Producción

1. **Compilar:**

   ```bash
   npm run build
   ```

2. **Desplegar:** sube el contenido de la carpeta resultante `/dist` a tu servidor o despliega en tu proveedor de hosting.

3. **Previsualizar localmente:**

   ```bash
   npm run preview
   ```

## Contenido

```text
/web
├── css/
│   └── style.css            # Estilos globales (Tailwind + DaisyUI)
├── modules/
│   ├── modes/               # Módulos de cada modo de operación
│   │   ├── manual.js        # Joystick, luces y claxon
│   │   ├── seguidor.js      # Modo seguidor de línea
│   │   ├── obstaculos.js    # Modo evasión de obstáculos
│   │   └── navegacion.js    # Mapa con Leaflet e interfaz de control
│   ├── mqtt/
│   │   ├── mqttService.js   # Servicio de comunicación MQTT
│   │   ├── mqttStatus.js    # Indicador visual del estado de la conexión
│   │   └── topics.js        # Diccionario de tópicos MQTT
│   └── theme/
│       └── theme.js         # Control del tema y persistencia con localStorage
├── public/
│   └── favicon.svg          # Icono de la página
├── .env.example             # Ejemplo de configuración
├── index.html
├── main.js                  # Lógica principal y cambio de modos
├── package.json             # Dependencias y scripts
└── vite.config.js           # Configuración de Vite + Tailwind
```

## Comunicación MQTT

La comunicación con el broker se realiza mediante WebSockets y se centraliza en `mqtt/mqttService.js`, utilizando los tópicos definidos en `mqtt/topics.js`.

> [!IMPORTANT]
> La documentación completa de los tópicos MQTT, estructura de payloads y diagrama de comunicación se encuentra en el README principal del proyecto.

Este módulo se encarga de:

- Publicar comandos según el modo activo.
- Suscribirse a los tópicos de estado del Smart Car.
- Gestionar el estado de conexión mediante `mqttStatus.js`.

## Características

* Interfaz responsive (desktop y móvil).
* Sistema modular basado en modos en JavaScript Vanilla.
* Comunicación en tiempo real mediante MQTT.
* Gestión de estado de conexión.
* Integración de mapas interactivos con Leaflet.
* Persistencia de tema (claro/oscuro) con localStorage.

## Mapas

Este proyecto utiliza **Stadia Maps** y **Esri World Imagery** como proveedores de tiles para la visualización del mapa en el modo navegación GPS.

El mapa incluye capas seleccionables: **Tema** (se adapta automáticamente al tema activo — `alidade_smooth` en claro, `alidade_smooth_dark` en oscuro), **Outdoors** y **Satélite** (Esri World Imagery).

> [!NOTE]
> En entorno de desarrollo, ambos proveedores permiten el uso de sus tiles sin restricciones de dominio, por lo que el mapa funciona correctamente sin configuración adicional.

> [!IMPORTANT]
> En este proyecto, el uso de mapas **está configurado con restricción por dominio**.
>
> Esto implica que:
>
> - En producción, el mapa solo funcionará si el dominio está autorizado correctamente en el proveedor.
> - Si el dominio no está registrado o la API key no es válida, el mapa no cargará.

### Configuración recomendada para producción

Para evitar problemas en despliegue registrar tu dominio en el proveedor de mapas (por ejemplo, Stadia Maps). Verificar que las restricciones de dominio (referer) coincidan con la URL final del proyecto.

Consulta la documentación oficial:
[https://docs.stadiamaps.com/authentication/](https://docs.stadiamaps.com/authentication/)

> [!TIP]
> La capa gratuita de Stadia Maps suele ser suficiente para este proyecto.

### Alternativas

Si no deseas configurar autenticación o restricciones por dominio, puedes usar **OpenStreetMap (OSM)** como proveedor de tiles. Solo asegúrate de respetar sus políticas de uso.

[https://operations.osmfoundation.org/policies/tiles/](https://operations.osmfoundation.org/policies/tiles/)