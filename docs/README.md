# Smart Car Web Controller

Controlador web modular para un Smart Car. Utiliza el protocolo [MQTT](https://mqtt.org/) para la comunicación en tiempo real y una interfaz dinámica que cambia según el modo seleccionado.

## Contenido de docs/

```text
/docs
│
├── index.html          # HTML base y carga de librerías (Leaflet, MQTT)
├── main.js             # JavaScript principal (manejo de modos y HTML)
├── /js                 # Módulos de JavaScript
│   ├── mqtt.js         # Configuración del cliente y función de envío
│   ├── topics.js       # Diccionario de topics MQTT
│   ├── joystick.js     # Lógica de modo 'control manual' y eventos táctiles del joystick
│   ├── seguidor.js     # Lógica de modo 'seguidor de línea'
│   └── gps.js          # Lógica de modo 'navegación GPS' (integración con Leaflet y rastreo en tiempo real)
└── /css
    └── style.css       # Estilo CSS global
```

---

## Arquitectura

### Comunicación MQTT (publish / subscribe)

La comunicación se centraliza en el archivo [topics.js](./modules/topics.js) para asegurar la consistencia de los canales. Los tópicos se dividen en **Control** (comandos hacia el hardware) y **Estado** (datos desde el hardware):

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

1. **Conexión**: el Smart Car y el controlador deben apuntar al mismo Broker MQTT.
2. **Modo manual**: usar el joystick táctil para mover el vehículo.
3. **Seguidor de línea**: activa y desactivar el sensor infrarrojo con un botón toggle.
4. **GPS**: haz clic en el mapa para marcar un destino y presiona "Confirmar" para que el coche inicie la ruta.

---

## Filosofía de desarrollo

Este proyecto prioriza la programación funcional (módulos) sobre la complejidad de clases innecesarias. La arquitectura sigue el principio YAGNI (You Ain't Gonna Need It), asegurando que cada módulo tenga un propósito directo en el control del vehículo.

Escrito por [René Núñez](https://github.com/rene-nunez)