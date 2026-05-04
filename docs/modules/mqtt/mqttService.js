import mqtt from "mqtt";
import {topics} from "./topics.js";
import {actualizarEstado} from "../ui/feedback.js";

// Variables de entorno
const MQTT_PROTOCOL = import.meta.env.VITE_MQTT_PROTOCOL;
const MQTT_HOST = import.meta.env.VITE_MQTT_HOST;
const MQTT_PORT = Number(import.meta.env.VITE_MQTT_PORT);
const MQTT_PATH = import.meta.env.VITE_MQTT_PATH || "";

if (!MQTT_HOST || !MQTT_PORT) throw new Error("MQTT_HOST or MQTT_PORT undefined");

// Obtener URL del broker
const URL = (() => {
    const protocolo = MQTT_PROTOCOL || (window.location.protocol === "https:" ? "wss" : "ws");
    let path = (MQTT_PATH || "").trim();
    if (path.length > 0 && !path.startsWith("/")) path = `/${path}`;
    return `${protocolo}://${MQTT_HOST}:${MQTT_PORT}${path}`;
})();

const isDev = import.meta.env.DEV;

const mqttService = {
    cliente: null,
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

    // Eventos
    configurar() {
        this.cliente.on("connect", () => {
            actualizarEstado("CONECTADO", "connected");
            if (isDev) {
                console.info(`[MQTT] conectado`, {
                    url: URL, 
                    clientId: this.cliente.options.clientId
                });
            }
            
            this.cliente.subscribe(topics.estado.ubicacion, (err) => {
                if (err) console.error(`[MQTT] error subscribe (${topics.estado.ubicacion})`, err);
            });
        });

        this.cliente.on("reconnect", () => {
            actualizarEstado("RECONECTANDO", "reconnecting");
            if (isDev) console.warn(`[MQTT] reconectando...`);
        });

        this.cliente.on("offline", () => {
            actualizarEstado("DESCONECTADO", "disconnected");
            if (isDev) console.warn(`[MQTT] desconectado`);
        });

        this.cliente.on("error", (err) => {
            actualizarEstado("ERROR", "error");
            console.error(`[MQTT] error: ${err.message}`);

            if (isDev && err.stack) console.error(err.stack);
        });

        this.cliente.on("message", (topic, message) => {
            try {
                const payload = JSON.parse(message.toString());
                
                if (isDev) console.info(`[MQTT] mensaje (${topic})`, payload);
                
                if (this.callback) {
                    this.callback(topic, payload);
                } 

            } catch (err) {
                console.error(`[MQTT] mensaje inválido (${topic})`);
                if (isDev) console.error("Payload:", message.toString());
            }
        });
    },

    recibir(handler) { 
        this.callback = handler; 
    },

    publicar(topic, mensaje) {
        if (!this.cliente?.connected) {
            console.warn(`[MQTT] publish sin conexión (${topic})`);
            return;
        }

        if (typeof mensaje !== "object") {
            console.error(`[MQTT] payload inválido (${topic})`);
            return;
        }

        const payload = JSON.stringify(mensaje);

        if (isDev) console.info(`[MQTT] publicando en ${topic}`, mensaje);

        this.cliente.publish(topic, payload, {qos: 0}, (err) => {
            if (err) {
                console.error(`[MQTT] error publish (${topic})`);
                if (isDev) console.error(payload);
            }
        });
    }
};

export default mqttService;