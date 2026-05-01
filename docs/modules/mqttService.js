import mqtt from "mqtt";
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
    const protocolo = MQTT_PROTOCOL || (window.location.protocol === "https:" ? "wss" : "ws");
    
    let path = (MQTT_PATH || "").trim();
    
    if (path.length > 0 && !path.startsWith("/")) {
        path = `/${path}`;
    }

    return `${protocolo}://${MQTT_HOST}:${MQTT_PORT}${path}`;
};

const URL = obtenerURL();

const mqttService = {
    cliente: null, // Instancia para el objeto "cliente" definido por la librería MQTT.js en el método conectar
    callback: null,

    conectar() {
        this.cliente = mqtt.connect(URL, {
            clientId: "control-web-" + Math.random().toString(16).slice(2, 6),
            clean: true,
            reconnectPeriod: 2000,
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

        this.cliente.on("message", (topic, message) => {
            try {
                const payload = JSON.parse(message.toString());

                
                if (this.callback) {
                    this.callback(topic, payload);
                }

            } catch (error) {
                console.error(`[MQTT] Subscribe: ${error}`);
            }
        });
    },

    // Almacenamos las instrucciones de la función definida en main, dentro de la propiedad callback
    recibir(handler) {
        this.callback = handler;
    },
    
    // Función para publicar mensajes MQTT con formato JSON
    publicar(topic, mensaje) {
        if (!this.cliente || !this.cliente.connected) {
            console.warn(`[MQTT] Publish: cliente desconectado`);
            return;
        }

        // Validar que el mensaje a enviar sea un objeto y convertirlo a JSON
        let payload;

        if (typeof mensaje !== "object") {
            console.error(`[MQTT] Publish: el mensaje debe ser un objeto`);
            return;
        }

        payload = JSON.stringify(mensaje);

        this.cliente.publish(topic, payload, {qos: 0}, (err) => {
            if (!err) {
                console.log(`[MQTT] Publish: ${topic}: ${payload}`);
            } else {
                console.error(`[MQTT] Publish: ${err}`);
            }
        });
    }
}

export default mqttService; // Exportar el objeto