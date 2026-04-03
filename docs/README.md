# Smart Car Web Controller

Controlador web modular para un Smart Car. Utiliza el protocolo [MQTT](https://mqtt.org/) para la comunicación en tiempo real y una interfaz dinámica que cambia según el modo seleccionado.

## Contenido

```text
/docs
├── /css
│   └── style.css       # Estilo global de la aplicación
│
├── /modules            # Módulos JavaScript
│   ├── /assets         # Imágenes SVG usadas en el módulo GPS
│   ├── alert.js        # Alertas personalizadas para el modo 'navegación GPS'
│   ├── gps.js          # Lógica de navegación GPS (Leaflet + rastreo en tiempo real)
│   ├── joystick.js     # Control del modo 'manual' y eventos táctiles del joystick
│   ├── mqtt.js         # Configuración del cliente MQTT y envío de mensajes
│   ├── seguidor.js     # Lógica del modo 'seguidor de línea'
│   └── topics.js       # Diccionario de topics MQTT
│
├── index.html          # HTML base, enlaces a librerías externas (Leaflet, MQTT)
└── main.js             # JavaScript principal (gestión de modos y manipulación del DOM)
```

## Arquitectura

### Comunicación MQTT (publish / subscribe)

La comunicación se centraliza en el módulo [mqtt.js](./modules/mqtt.js), haciendo uso de los canales definidos en [topics.js](./modules/topics.js), donde los tópicos se dividen en **control** (comandos hacia el smart car) y **estado** (datos desde el smart car):

|Tópico MQTT|Dirección|Descripción|
|:---|:---|:---|
|`smartcar/control/modo`|Output|Define el comportamiento: `control`, `linea` o `gps`.|
|`smartcar/control/joystick`|Output|Envía coordenadas normalizadas `x,y` (Rango -1 a 1).|
|`smartcar/control/claxon`|Output|Activa el buzzer del vehículo.|
|`smartcar/control/sensor`|Output|Parámetro para activar y desactivar el modo seguidor de línea.|
|`smartcar/control/destino`|Output|Envía las coordenadas GPS `lat,lon` del punto de destino seleccionado.|
|`smartcar/estado/ubicacion`|Input|Recibe la posición actual del Smart Car (Lat, Lon).|
|`smartcar/estado/llegada`|Input|Recibe confirmación cuando el vehículo alcanza su destino.|

## Instrucciones de uso

1. **Conexión**: el Smart Car y el controlador web deben apuntar al mismo Broker MQTT.
2. **Modo manual**: usar el joystick táctil para mover el vehículo.
3. **Seguidor de línea**: activa y desactivar el sensor infrarrojo con un botón toggle.
4. **GPS**: haz clic en el mapa para marcar un destino y presiona "Enviar destino" para que el coche inicie la ruta. Esperar la alerta de llegada para definir un nuevo destino.

## Filosofía de desarrollo

Este proyecto prioriza la programación funcional (módulos) sobre la complejidad de clases innecesarias. La arquitectura sigue el principio YAGNI (You Ain't Gonna Need It), asegurando que cada módulo tenga un propósito directo en el control del smart car.

## Recursos

- [Iconos SVG de Bootstrap](https://icons.getbootstrap.com/)
- [Repositorio de MQTT.js](https://github.com/mqttjs/MQTT.js)
- [Documentación de Leaflet](https://leafletjs.com/reference.html)

Escrito por [rene-nunez](https://github.com/rene-nunez)