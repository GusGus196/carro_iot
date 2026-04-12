# Control Web

Control web modular para un Smart Car. Utiliza el protocolo [MQTT](https://mqtt.org/) para la comunicación en tiempo real y una interfaz dinámica que cambia según el modo seleccionado.

## Contenido

```text
/docs
├── /css
│   └── style.css       # Estilo global de la aplicación
│
├── /modules            # Módulos JavaScript
│   ├── /assets         # Imágenes SVG usadas en el módulo GPS
│   ├── alert.js        # Alerta personalizada para el modo "navegación GPS"
│   ├── gps.js          # Lógica de navegación GPS (Leaflet + rastreo en tiempo real)
│   ├── joystick.js     # Control del modo "manual" y eventos táctiles del joystick
│   ├── mqtt.js         # Configuración del cliente MQTT y envío de mensajes
│   ├── seguidor.js     # Lógica del modo "seguidor de línea"
│   └── topics.js       # Diccionario de tópicos MQTT
│
├── index.html          # HTML principal
└── main.js             # JavaScript principal (gestión de modos y manipulación del DOM)
```

## Arquitectura

### Comunicación MQTT (publicación / suscripción)

La comunicación se centraliza en el módulo [mqtt.js](./modules/mqtt.js), haciendo uso de los canales definidos en [topics.js](./modules/topics.js), donde los tópicos se dividen en **control** (comandos hacia el Smart Car) y **estado** (datos desde el Smart Car):

|Tópico MQTT|Dirección|Descripción|
|:---|:---|:---|
|`smartcar/control/modo`|Publica|Define el comportamiento: `control`, `linea` o `gps`.|
|`smartcar/control/joystick`|Publica|Envía coordenadas normalizadas `x,y` (rango de -1 a 1).|
|`smartcar/control/claxon`|Publica|Activa el buzzer del vehículo.|
|`smartcar/control/sensor`|Publica|Parámetro para activar o desactivar el modo seguidor de línea.|
|`smartcar/control/destino`|Publica|Envía las coordenadas GPS `lat, lon` del punto de destino seleccionado.|
|`smartcar/estado/ubicacion`|Suscribe|Recibe la posición actual del Smart Car (lat, lon).|
|`smartcar/estado/llegada`|Suscribe|Recibe confirmación cuando el vehículo alcanza su destino.|

## Instrucciones de uso

1. **Conexión**: el Smart Car y el controlador web deben apuntar al mismo broker MQTT.
2. **Modo manual**: usa el joystick táctil para mover el vehículo.
3. **Seguidor de línea**: activa o desactiva el sensor infrarrojo con un botón toggle.
4. **GPS**: haz clic en el mapa para marcar un destino y presiona "Enviar destino" para que el Smart Car inicie la ruta. Espera la alerta de llegada para definir un nuevo destino.

## Recursos

- [Iconos SVG de Bootstrap](https://icons.getbootstrap.com/)
- [Repositorio de MQTT.js](https://github.com/mqttjs/MQTT.js)
- [Documentación de Leaflet](https://leafletjs.com/reference.html)

Escrito por [rene-nunez](https://github.com/rene-nunez)