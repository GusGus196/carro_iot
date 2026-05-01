import mqtt from "mqtt"; // Objeto mqtt con los métodos de la librería MQTT

import { TOPICS } from "./topics.js";
import { mostrarAlerta, actualizarStatusMQTT } from "./feedback.js";

// Variables de entorno
const MQTT_HOST = import.meta.env.VITE_MQTT_HOST;
const MQTT_PORT = import.meta.env.VITE_MQTT_PORT;

/*
Selección automática de protocolo:
Si el puerto es 443, 8883, o 8884 usamos 'wss' (Secure WebSockets).
De lo contrario, usamos 'ws' (WebSockets)
*/
const PROTOCOL = (MQTT_PORT === "443" || MQTT_PORT === "8883" || MQTT_PORT === "8884") ? "wss" : "ws";
const connectURL = `${PROTOCOL}://${MQTT_HOST}:${MQTT_PORT}`;

// Cliente MQTT
export const client = mqtt.connect(connectURL, {
    clientId: "control-web-" + Math.random().toString(16).slice(2, 8), // Generar ID aleatorio
    clean: true,
    reconnectPeriod: 1000, // Reintenta reconectar cada segundo
    connectTimeout: 5000 // Tiempo de espera para considerar error
})

// Estado: conectado
client.on("connect", () => {
    actualizarStatusMQTT("CONECTADO", "status-online");
    console.log(`[MQTT] Conexión establecida vía ${PROTOCOL} en ${MQTT_HOST}:${MQTT_PORT}`);

    // Suscripciones MQTT por defecto
    client.subscribe(TOPICS.ubicacion); // Escuchar la ubicación del Smart Car
    client.subscribe(TOPICS.llegada); // Esperar notificación de llegada al destino en modo "Navegación GPS"
});

// Estado: desconectado
client.on("offline", () => {
    actualizarStatusMQTT("DESCONECTADO", "status-offline");
});

// Estado: reconectando
client.on("reconnect", () => {
    actualizarStatusMQTT("RECONECTANDO", "status-reconnecting");
});

// Estado: error
client.on("error", (err) => {
    actualizarStatusMQTT("ERROR", "status-error");
    console.error("[MQTT]", err);
});

// Función global para publicar mensajes al broker NQTT
export function enviar(topic, message) {
    if (!client.connected) {
        actualizarStatusMQTT("DESCONECTADO", "status-offline");
        console.warn("[PUBLISH] Fallido: cliente desconectado");
        return;
    }

    client.publish(topic, message, (err) => {
        if (!err) {
            // Debug de salida, comentar para producción
            console.log(`[PUBLISH] ${topic}: ${message}`);
        } else {
            console.error("[PUBLISH]", err);
        }
    });
}