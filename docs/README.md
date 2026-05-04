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
│   └── favicon.svg      # Icono de la página
├── .env.example         # Ejemplo de configuración
├── index.html           # Entrada principal
├── main.js              # Lógica principal
├── package.json         # Dependencias y scripts
└── vite.config.js       # Configuración de Vite
```

## Comunicación MQTT

La comunicación con el broker MQTT se realiza mediante WebSockets y se centraliza en el módulo [mqtt.js](./modules/mqtt.js), utilizando los tópicos definidos en [topics.js](./modules/topics.js).

Los tópicos se dividen en:

* **Control** (Publicación).
* **Estado** (Suscripción).

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
        ▲
        │
        │ MQTT sobre WebSockets
        ▼
   Broker MQTT
        ▲
        │
        │ MQTT estándar
        ▼
    Smart Car
```

## Instalación

### Requisitos

* [Node.js y npm](https://nodejs.org) (Versión 18.0 o superior).
* Broker MQTT (Público o local) con soporte para WebSockets.

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

Copia el archivo de ejemplo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Edita el archivo con la configuración de tu broker MQTT. Este incluye comentarios detallados sobre cada parámetro requerido.

### 3. Configuración del broker

Asegúrate de que tu broker MQTT soporte WebSockets.

#### Local

Puedes instalar y configurar cualquier broker MQTT de tu preferencia.

> [!NOTE] 
> En este repositorio se incluye una guía detallada para instalar y configurar Eclipse Mosquitto específicamente para este proyecto. Consulta el archivo [mosquitto/README.md](../mosquitto/README.md).

#### Público

Puedes usar brokers como:

* [broker.emqx.io](https://broker.emqx.io)
* [broker.hivemq.com](https://broker.hivemq.com)
* [test.mosquitto.org](https://test.mosquitto.org)

## Instrucciones de uso

### Opción 1. Ejecutar en desarrollo

Este proyecto utiliza [Vite.js](https://vite.dev) para servir la aplicación. El servidor está configurado para ser accesible desde cualquier dispositivo en tu red local (LAN), lo que facilita el control del Smart Car desde un dispositivo en la misma red.

Para iniciar el entorno de desarrollo, asegúrate de estar dentro del directorio `docs` y ejecuta:

```bash
npm run dev
```

La aplicación estará disponible en:

- **Local:** <http://localhost:3000>
- **Red local:** utiliza la dirección IP que se muestra en la terminal para acceder desde otros dispositivos.

> [!TIP] 
> Puedes modificar el puerto o la visibilidad del host en el archivo [vite.config.js](./vite.config.js).

### Opción 2. Generar versión de producción (Build)

Si deseas desplegar la interfaz en un servidor web definitivo (como GitHub Pages, Render, Netlify, etc.), debes generar los archivos optimizados:

1. **Compilar el proyecto:** ejecuta el siguiente comando para generar la carpeta `/dist`:

    ```bash
    npm run build
    ```

2. **Desplegar:** sube el contenido de la carpeta `/dist` resultante a tu servicio de hosting.

Si quieres verificar que el paquete de producción funciona correctamente antes de subirlo, puedes previsualizarlo localmente con:

```bash
npm run preview
```

## TEMPORAL

### Tópicos del SmartCar

| Tópico | Payload (JSON) | Descripción |
| :--- | :--- | :--- |
| `smartcar/accion/modo` | `{"modo":"manual"}` | Cambia el sistema a control manual. |
| `smartcar/accion/modo` | `{"modo":"seguidor"}` | Cambia al modo seguidor de línea/objetos. |
| `smartcar/accion/modo` | `{"modo":"obstaculos"}` | Cambia al modo evasión de obstáculos. |
| `smartcar/accion/modo` | `{"modo":"navegacion"}` | Cambia al modo de navegación GPS. |
| `smartcar/modo/manual` | `{"x":0.4, "y":0.2}` | Movimiento: Joystick en eje X (0.1). |
| `smartcar/accion/luces` | `{"luces":"izq"}` | Activa direccional izquierda. |
| `smartcar/accion/luces` | `{"luces":"der"}` | Activa direccional derecha. |
| `smartcar/accion/luces` | `{"luces":"prev"}` | Activa luces preventivas (intermitentes). |
| `smartcar/accion/luces` | `{"luces":"off"}` | Apaga todas las luces. |
| `smartcar/accion/claxon` | `{"estado":1}` | Activa el claxon / bocina. |
| `smartcar/modo/seguidor` | `{"accion":"activar"}` | Inicia la rutina de seguimiento. |
| `smartcar/modo/seguidor` | `{"accion":"desactivar"}` | Detiene la rutina de seguimiento. |
| `smartcar/modo/obstaculos` | `{"accion":"activar"}` | Activa sensores para evitar colisiones. |
| `smartcar/modo/obstaculos` | `{"accion":"desactivar"}` | Desactiva el modo evasión. |
| `smartcar/modo/navegacion` | `{"accion":"iniciar", "lat":19.249158, "lon":-103.697135}` | Inicia ruta hacia coordenadas específicas. |
| `smartcar/modo/navegacion` | `{"accion":"detener", "lat":19.249158, "lon":-103.697135}` | Detiene la navegación en curso. |
| `smartcar/modo/navegacion` | `{"accion":"reanudar", "lat":19.249158, "lon":-103.697135}` | Continúa la ruta hacia el destino. |
| `smartcar/estado/ubicacion` | `{"lat":19.249158, "lon":-103.697135, "sat": 4, "rumbo": 40, "destino":true}` | Información de estado. |

[Stadia Maps Auth](https://docs.stadiamaps.com/authentication/)