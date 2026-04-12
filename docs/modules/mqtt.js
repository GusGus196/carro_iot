import {TOPICS} from "./topics.js";

// Generar un ID de cliente
const clientId = "web-" + crypto.randomUUID();

// Cliente conectado al broker público HiveMQ utilizando WebSockets
export const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
    clientId: clientId,
    clean: true
});

client.on("connect", () => {
    console.log("MQTT conectado");
    client.subscribe(TOPICS.ubicacion); // El GPS puede tardar en obtener un "fix" inicial o ubicación, nos suscribimos desde el inicio para recibirla en cuanto esté disponible
    client.subscribe(TOPICS.llegada); // El GPS enviara un mensaje "1" cuando se encuentre dentro del área de llegada
});

client.on("reconnect", () => console.warn("Reconectando al servidor MQTT..."));
client.on("error", (err) => console.error("Error de conexión MQTT:", err));
client.on("offline", () => console.error("Estado offline, revisa tu conexión"));

// Función para enviar mensajes al broker
export function enviar(topic, message) {
    if (client.connected) {
        client.publish(topic, message);
    
        // Comentar la siguiente linea para dejar de mostrar los mensajes enviados
        console.log(`${topic}: ${message}`);
    };
};