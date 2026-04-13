# Control Web

Control web modular para un Smart Car. Utiliza el protocolo [MQTT](https://mqtt.org/) para la comunicación en tiempo real y una interfaz dinámica que cambia según el modo seleccionado.

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
├── index.html         # HTML principal
├── main.js            # Programa principal (gestión del selector de modos y DOM)
├── package.json       # Dependencias (MQTT, Leaflet) y scripts de Vite
└── vite.config.js     # Configuración de Vite
```

## Arquitectura

### Comunicación MQTT (publicación / suscripción)

La comunicación se centraliza en el módulo [mqtt-client.js](./modules/mqtt.js), haciendo uso de los canales definidos en [topics.js](./modules/topics.js), donde los tópicos se dividen en **control** (comandos hacia el Smart Car) y **estado** (datos desde el Smart Car).

|Tópico MQTT|Dirección|Descripción|
|:---|:---|:---|
|`smartcar/control/modo`|Publica|Define el comportamiento: `control`, `linea` o `gps`|
|`smartcar/control/joystick`|Publica|Envía coordenadas normalizadas `x,y` (rango de -1 a 1)|
|`smartcar/control/claxon`|Publica|Activa el buzzer del vehículo|
|`smartcar/control/sensor`|Publica|Activa/desactiva el modo seguidor de línea|
|`smartcar/control/destino`|Publica|Envía coordenadas GPS del destino|
|`smartcar/estado/ubicacion`|Suscribe|Recibe posición actual del Smart Car (lat, lon)|
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