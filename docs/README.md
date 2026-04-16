# Control Web

Interfaz dínamica de control para un Smart Car. Utiliza el protocolo MQTT sobre WebSockets para la comunicación en tiempo real.

## Contenido

```text
/docs
├── /public            # Recursos estáticos servidos por Vite
│   ├── /mapa          # Capas de imágenes para mapa local utilizado por Leaflet
│   ├── /assets        # Imágenes SVG y recursos usados en la interfaz
│   └── favicon.svg    # Ícono del sitio web
│
├── /modules           # Módulos JavaScript
│   ├── alert.js       # Alerta personalizada para modo GPS
│   ├── gps.js         # Lógica de navegación GPS (Leaflet + tracking en tiempo real)
│   ├── joystick.js    # Control del modo manual y eventos táctiles
│   ├── mqtt.js        # Cliente MQTT (WebSockets)
│   ├── seguidor.js    # Lógica del modo seguidor de línea
│   └── topics.js      # Diccionario de tópicos MQTT
│
├── .env               # (No incluido) Configuración local generada a partir de .env.example
├── .env.example       # Plantilla de configuración de red y guía de conexión al broker MQTT (variables de entorno)
├── index.html         # HTML principal
├── main.js            # Programa principal (gestión del selector de modos y DOM)
├── package.json       # Dependencias (MQTT, Leaflet) y scripts de Vite
└── vite.config.js     # Configuración de Vite
```

## Arquitectura de comunicación MQTT

La comunicación con el broker MQTT se realiza a través de WebSockets y se centraliza en el módulo [mqtt.js](./modules/mqtt.js), haciendo uso de los tópicos definidos en [topics.js](./modules/topics.js), donde estos se dividen en **control** (publicación) y **estado** (suscripción).

|Tópico MQTT|Dirección|Descripción|
|:---|:---|:---|
|`smartcar/control/modo`|Publica|Define el comportamiento: `control`, `linea` o `gps`|
|`smartcar/control/joystick`|Publica|Envía coordenadas normalizadas `x,y` (rango de -1 a 1)|
|`smartcar/control/claxon`|Publica|Activa el buzzer del vehículo|
|`smartcar/control/sensor`|Publica|Activa/desactiva el modo seguidor de línea|
|`smartcar/control/destino`|Publica|Envía coordenadas del destino `lat,lon`|
|`smartcar/estado/ubicacion`|Suscribe|Recibe posición actual del Smart Car `lat,lon`|
|`smartcar/estado/llegada`|Suscribe|Recibe confirmación de llegada al destino|

## Instalación

```bash
cd docs
npm install
```

## Instrucciones de uso

1. **Conexión**: el Smart Car y el controlador web deben apuntar al mismo broker MQTT local o remoto.

2. **Ejecutar servidor de desarrollo Vite**:

```bash
npm run dev
```

3. **Generar versión de producción (opcional)**:

```bash
npm run build
```

4. **Modo manual**: usa el joystick táctil para mover el vehículo.
5. **Seguidor de línea**: activa o desactiva el sensor infrarrojo con el toggle.
6. **GPS**: haz clic en el mapa para marcar un destino y envíalo para iniciar la ruta.

## Recursos

* [Iconos SVG de Bootstrap](https://icons.getbootstrap.com/)
* [Repositorio de MQTT.js](https://github.com/mqttjs/MQTT.js)
* [Documentación de Leaflet](https://leafletjs.com/reference.html)
* [Documentación de Vite](https://vite.dev/guide/)

---

Escrito por [rene-nunez](https://github.com/rene-nunez)