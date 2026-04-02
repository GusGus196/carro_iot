import {TOPICS} from "./topics.js";

const clientId = 'smartcar-mqttcontroller-' + Math.random().toString(16).slice(2, 10); // ID de cliente
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', { // Cliente conectado al broker público HiveMQ utilizando WebSockets
    clientId: clientId,
    clean: true
});

client.on('connect', () => {
    console.log("MQTT conectado");
    client.subscribe(TOPICS.ubicacion); // Escuchar la ubicación del smart car
});

client.on('reconnect', () => console.warn("Reconectando al servidor MQTT..."));
client.on('error', (err) => console.error("Error de conexión MQTT:", err));
client.on('offline', () => console.error("Estado offline, revisa tu conexión"));

// Función para enviar mensajes al broker
function send(topic, message) {
    if (client.connected) {
        client.publish(topic, message);
    
        // Comentar la siguiente linea para dejar de mostrar los mensajes enviados:
        console.log(`${topic}: ${message}`);
    }
}

export {client, send};