import mqtt from "mqtt";

import { TOPICS } from "./topics.js";
import { mostrarAlerta } from "./alert.js";

const MQTT_HOST = import.meta.env.VITE_MQTT_HOST;
const MQTT_PORT = import.meta.env.VITE_MQTT_PORT;

/*
    Selección automática de protocolo:
    Si el puerto es 8883, 8884 o 443, usamos 'wss' (Secure WebSockets).
    De lo contrario, usamos 'ws' (WebSockets)
*/
const protocol = (MQTT_PORT === "8883" || MQTT_PORT === "8884" || MQTT_PORT === "443") ? "wss" : "ws";
const connectURL = `${protocol}://${MQTT_HOST}:${MQTT_PORT}`;

// Cliente MQTT
export const client = mqtt.connect(connectURL, {
    clientId: "control-web-" + Math.random().toString(16).slice(2, 8), // Generar ID aleatorio
    clean: true,
    reconnectPeriod: 1000, // Reintenta reconectar cada segundo
    connectTimeout: 5000 // Tiempo de espera para considerar error
})

// Evento: conectado
client.on("connect", () => {
    mostrarAlerta("CLIENTE MQTT", "CONECTADO");
    console.log(`Conexión exitosa via ${protocol} a ${MQTT_HOST}`);

    // Suscripciones MQTT por defecto
    client.subscribe(TOPICS.ubicacion); // Escuchar la ubicación del Smart Car
    client.subscribe(TOPICS.llegada); // Esperar notificación de llegada al destino en modo "Navegación web"
});

// Evento: reconectar
client.on("reconnect", () => {
    mostrarAlerta("BROKER MQTT", "RECONECTANDO..");
});

// Evento: error
client.on("error", (err) => {
    mostrarAlerta("BROKER MQTT", "ERROR");
    console.error("Error MQTT:", err);
});

// Evento: desconectado
client.on("offline", () => {
    mostrarAlerta("BROKER MQTT", "DESCONECTADO");
});

// Función global para publicar mensajes
export function enviar(topic, message) {
    if (!client.connected) {
        mostrarAlerta("BROKER MQTT", "DESCONECTADO");
        console.warn("Intento de envío fallido: cliente MQTT no conectado.");
        return;
    }

    client.publish(topic, message, (err) => {
        if (!err) {
            // Debug de salida, comentar para producción
            console.log(`[ENVIADO] ${topic}: ${message}`);
        } else {
            console.error("Error al publicar:", err);
        }
    });
}