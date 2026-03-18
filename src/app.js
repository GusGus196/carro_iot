// --- CONFIGURACIÓN DE CONEXIÓN ---
// Creamos un ID aleatorio para que el Broker no nos desconecte por usar el mismo nombre que el ESP32
const clientId = 'web_joystick_' + Math.random().toString(16).substr(2, 8);

const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
};

// Conexión segura vía WebSockets
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', options);

client.on('connect', () => {
    console.log("MQTT conectado exitosamente desde el navegador");
});

client.on('error', (err) => {
    console.error("Error de conexión MQTT:", err);
});

// Función de envío segura
function send(topic, message) {
    if (client.connected) {
        client.publish(topic, message);
    }
}


const container = document.getElementById('joystick-container');
const puck = document.getElementById('joystick-puck');
const valX = document.getElementById('valX');
const valY = document.getElementById('valY');

let dragging = false;
const radius = container.offsetWidth / 2;

const moveJoystick = (e) => {
    if (!dragging) return;

    if (e.type === 'touchmove') e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {
        dx *= radius / distance;
        dy *= radius / distance;
    }

    puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;


    const normX = (dx / radius).toFixed(2);
    const normY = ((dy / radius) * -1).toFixed(2); 

    send("proyecto/carrito/control/joystick", `${normX},${normY}`);

    valX.innerText = normX;
    valY.innerText = normY;
};

const stopJoystick = () => {
    if (!dragging) return;
    dragging = false;

    puck.style.transform = `translate(-50%, -50%)`;
    valX.innerText = "0.00";
    valY.innerText = "0.00";

    send("proyecto/carrito/control/joystick", "0.00,0.00");
};


// Mouse
puck.addEventListener('mousedown', () => dragging = true);
window.addEventListener('mousemove', moveJoystick);
window.addEventListener('mouseup', stopJoystick);

// Touch (Añadido {passive: false} para permitir el preventDefault en algunos navegadores)
puck.addEventListener('touchstart', () => dragging = true);
window.addEventListener('touchmove', moveJoystick, { passive: false });
window.addEventListener('touchend', stopJoystick);

// Claxon
const btnClaxon = document.getElementById("btnClaxon");
btnClaxon.addEventListener("click", ()=>{
  send("proyecto/carrito/control/claxon", "1");
});