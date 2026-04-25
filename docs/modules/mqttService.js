import mqtt from "mqtt"; // Objeto "mqtt" de la librería MQTT.js
import {topics} from "./topics.js";
import {actualizarEstado} from "./feedback.js";

// Variables de entorno
const MQTT_HOST = import.meta.env.VITE_MQTT_HOST;
const MQTT_PORT = import.meta.env.VITE_MQTT_PORT;

// Seleccionar protocolo basado en el puerto y generar URL para conectarse al bróker
const PROTOCOL = ["443", "8883", "8884"].includes(MQTT_PORT) ? "wss" : "ws";
const URL = `${PROTOCOL}://${MQTT_HOST}:${MQTT_PORT}`;

// Objeto para monitorear toda la comunicación MQTT del Control Web
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

    // Eventos de la comunicación MQTT
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
            /* NOTA: agregar actualización de posición, 
                actualizar satélites y rumbo en interfaz, 
                agregar validación de llegada al destino,
                agregar console.log
            */
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

        if(typeof message === "object") {
            payload = JSON.stringify(message);
        } else {
            console.error(`[MQTT] Publish: el mensaje debe ser un objeto`);
        };

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