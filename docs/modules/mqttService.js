import mqtt from "mqtt";
import navegacion from "./navegacion.js";

import {topics} from "./topics.js";
import {actualizarEstado} from "./feedback.js";

// Variables de entorno
const MQTT_PROTOCOL = import.meta.env.VITE_MQTT_PROTOCOL;
const MQTT_HOST = import.meta.env.VITE_MQTT_HOST;
const MQTT_PORT = Number(import.meta.env.VITE_MQTT_PORT);
const MQTT_PATH = import.meta.env.VITE_MQTT_PATH || "";

if (!MQTT_HOST || !MQTT_PORT) {
    throw new Error("[MQTT] Configuración: falta HOST o PORT");
}

const obtenerURL = () => {
    let protocolo = MQTT_PROTOCOL;

    if (!protocolo) {
        protocolo = window.location.protocol === "https:" ? "wss" : "ws";
    }

    let path = MQTT_PATH.trim();

    if (path && !path.startsWith("/")) {
        path = `/${path}`;
    }

    // Evita agregar "undefined" o rutas vacías
    const finalPath = path || "";

    return `${protocolo}://${MQTT_HOST}:${MQTT_PORT}${finalPath}`;
};

const URL = obtenerURL();

const mqttService = {
    cliente: null, // Instancia para el objeto "cliente" definido por la librería MQTT.js en el método conectar

    conectar() {
        this.cliente = mqtt.connect(URL, {
            clientId: "control-web-" + Math.random().toString(16).slice(2, 6),
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 5000
        });

        this.configurar();
    },

    // Eventos de la comunicación
    configurar() {
        this.cliente.on("connect", () => {
            actualizarEstado("CONECTADO", "status-online");
            console.info(`[MQTT] Conectado a ${URL}`);
            
            // Suscripción permanente a los tópicos de estado
            this.cliente.subscribe(topics.estado.ubicacion);
        });

        this.cliente.on("reconnect", () => {
            actualizarEstado("RECONECTANDO", "status-reconnecting");
            console.info(`[MQTT] Reconectando a ${URL}`);
        });
        
        this.cliente.on("error", (error) => {
            actualizarEstado("ERROR", "status-error");
            console.error(`[MQTT] ${error}`);
        });

        this.cliente.on("offline", () => {
            actualizarEstado("DESCONECTADO", "status-offline");
            console.warn("[MQTT] Desconectado")
        });

        // Lectura de los mensajes entrantes de los tópicos de estado
        this.cliente.on("message", (topic, message) => {
            try {
                // Parsear el payload entrante y llamar al método para procesar el mensaje
                const payload = JSON.parse(message.toString());
                this.procesarMensaje(topic, payload);

            } catch (error) {
                console.error(`[MQTT] Subscribe: ${error}`);
            }
        });
    },

    // Procesa la carga útil del mensaje con diferente lógica según el tópico de estado entrante
    procesarMensaje(topic, data) {
        if (topic === topics.estado.ubicacion) {
            const {lat, lon, meta} = data;

            if (lat && lon) {
                navegacion.actualizarPosicion(lat, lon);
            }

            if (meta === true) {
                navegacion.reiniciarDestino();
            }
        }
    },

    // Función para publicar mensajes MQTT con formato JSON
    publicar(topic, message) {
        if (!this.cliente || !this.cliente.connected) {
            console.warn(`[MQTT] Publish: cliente desconectado`);
            return;
        }

        // Validar que el mensaje a enviar sea un objeto y convertirlo a JSON
        let payload;

        if (typeof message !== "object") {
            console.error(`[MQTT] Publish: el mensaje debe ser un objeto`);
            return;
        }

        payload = JSON.stringify(message);

        this.cliente.publish(topic, payload, {qos: 0}, (err) => {
            if (!err) {
                console.log(`[MQTT] Publish: ${topic}: ${payload}`);
            } else {
                console.error(`[MQTT] Publish: ${err}`);
            }
        });
    }
}

mqttService.conectar(); // Ejecutar el método conectar al cargar el módulo
export default mqttService; // Exportar el objeto