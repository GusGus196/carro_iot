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
* [Leaflet](https://leafletjs.com/) — mapas interactivos.
* [MQTT.js](https://github.com/mqttjs) — comunicación con el broker vía WebSockets.

## Instalación

### Requisitos

* [Node.js y npm](https://nodejs.org) (v18.0 o superior).
* Broker MQTT con soporte para WebSockets.

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/GusGus196/carro_iot
cd carro_iot/docs
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

Cada uno admite puertos para WebSockets y paths diferentes, leer documentación.

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
/docs
├── css/
│   └── style.css            # Estilos globales (Tailwind + DaisyUI)
├── modules/
│   ├── modes/               # Módulos de cada modo de operación
│   │   ├── manual.js        # Joystick, luces y claxon
│   │   ├── seguidor.js      # Modo seguidor
│   │   ├── obstaculos.js    # Modo evasión de obstáculos
│   │   └── navegacion.js    # Mapa con Leaflet e interfaz de control
│   └── mqtt/
│       ├── mqttService.js   # Servicio de comunicación MQTT
│       ├── mqttStatus.js    # Indicador visual del estado de la conexión
│       └── topics.js        # Diccionario de tópicos MQTT
├── public/                  # Recursos estáticos (Vite)
│   ├── assets/              # Imágenes SVG (mapa, iconos)
│   └── favicon.svg          # Icono de la página (https://favicons.beaubus.com/)
├── .env.example             # Ejemplo de configuración
├── index.html
├── main.js                  # Lógica principal y cambio de modos
├── package.json             # Dependencias y scripts
└── vite.config.js           # Configuración de Vite + Tailwind
```

## Comunicación MQTT

La comunicación con el broker se realiza mediante WebSockets y se centraliza en `mqtt/mqttService.js`, utilizando los tópicos definidos en `mqtt/topics.js`.

### Tópicos de acción (Publicación)

| Tópico                     | Payload                                             | Descripción                         |
| :------------------------- | :-------------------------------------------------- | :---------------------------------- |
| `smartcar/accion/modo`     | `{"modo":"manual"}`                                 | Cambia a control manual             |
| `smartcar/accion/modo`     | `{"modo":"seguidor"}`                               | Cambia a modo seguidor de línea     |
| `smartcar/accion/modo`     | `{"modo":"obstaculos"}`                             | Cambia a modo evasión de obstáculos |
| `smartcar/accion/modo`     | `{"modo":"navegacion"}`                             | Cambia a modo navegación GPS        |
| `smartcar/modo/manual`     | `{"x":0.4, "y":0.2}`                                | Coordenadas x, y del joystick       |
| `smartcar/accion/luces`    | `{"luces":"izq"}`                                   | Direccional izquierda               |
| `smartcar/accion/luces`    | `{"luces":"prev"}`                                  | Luces preventivas                   |
| `smartcar/accion/luces`    | `{"luces":"der"}`                                   | Direccional derecha                 |
| `smartcar/accion/luces`    | `{"luces":"off"}`                                   | Apagar luces                        |
| `smartcar/accion/claxon`   | `{"estado":1}`                                      | Activar claxon                      |
| `smartcar/modo/seguidor`   | `{"accion":"activar"}`                              | Iniciar seguimiento                 |
| `smartcar/modo/seguidor`   | `{"accion":"desactivar"}`                           | Detener seguimiento                 |
| `smartcar/modo/obstaculos` | `{"accion":"activar"}`                              | Activar evasión                     |
| `smartcar/modo/obstaculos` | `{"accion":"desactivar"}`                           | Desactivar evasión                  |
| `smartcar/modo/navegacion` | `{"accion":"iniciar", "lat":19.24, "lon":-103.69}`  | Iniciar navegación                  |
| `smartcar/modo/navegacion` | `{"accion":"detener", "lat":19.24, "lon":-103.69}`  | Detener navegación                  |
| `smartcar/modo/navegacion` | `{"accion":"reanudar", "lat":19.24, "lon":-103.69}` | Reanudar navegación                 |

### Tópicos de estado (Suscripción)

| Tópico                      | Payload                                                             | Descripción                     |
| :-------------------------- | :------------------------------------------------------------------ | :------------------------------ |
| `smartcar/estado/ubicacion` | `{"lat":19.24, "lon":-103.69, "rumbo":40, "sat":4, "destino":true}` | Posición y estado del Smart Car |

### Diagrama de comunicación

```text
   Control Web
        ▲
        │ MQTT sobre WebSockets
        ▼
   Broker MQTT
        ▲
        │ MQTT estándar
        ▼
    Smart Car
```

## Características

* Interfaz responsive (desktop y móvil).
* Sistema modular basado en modos en JavaScript Vanilla.
* Comunicación en tiempo real mediante MQTT.
* Gestión de estado de conexión.
* Integración de mapas interactivos con Leaflet.

## Mapas

Este proyecto utiliza **Stadia Maps** y **Esri World Imagery** como proveedores de tiles para la visualización del mapa en el modo navegación GPS.

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

Para evitar problemas en despliegue:

1. Registrar tu dominio en el proveedor de mapas (por ejemplo, Stadia Maps).
2. Verificar que las restricciones de dominio (referer) coincidan con la URL final del proyecto.

Consulta la documentación oficial:
[https://docs.stadiamaps.com/authentication/](https://docs.stadiamaps.com/authentication/)

> [!TIP]
> La capa gratuita de Stadia Maps suele ser suficiente para este proyecto.

### Alternativas

Si no deseas configurar autenticación o restricciones por dominio, puedes usar **OpenStreetMap (OSM)** como proveedor de tiles. Solo asegúrate de respetar sus políticas de uso.

[https://operations.osmfoundation.org/policies/tiles/](https://operations.osmfoundation.org/policies/tiles/)