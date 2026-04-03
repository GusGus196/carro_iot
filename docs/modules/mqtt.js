import {TOPICS} from "./topics.js";

const clientId = 'smartcar-webcontroller-' + Math.random().toString(16).slice(2, 10); // ID de cliente

// Cliente conectado al broker público HiveMQ utilizando WebSockets
export const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
    clientId: clientId,
    clean: true
});

client.on('connect', () => {
    console.log("MQTT conectado");
    client.subscribe(TOPICS.ubicacion); 
    // El GPS puede tardar en obtener un "fix" inicial o ubicación, nos suscribimos desde el inicio para recibirla en cuanto esté disponible
});

client.on('reconnect', () => console.warn("Reconectando al servidor MQTT..."));
client.on('error', (err) => console.error("Error de conexión MQTT:", err));
client.on('offline', () => console.error("Estado offline, revisa tu conexión"));

// Función para enviar mensajes al broker
export function send(topic, message) {
    if (client.connected) {
        client.publish(topic, message);
    
        // Comentar la siguiente linea para dejar de mostrar los mensajes enviados:
        console.log(`${topic}: ${message}`);
    };
};