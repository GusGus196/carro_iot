import {TOPICS} from "./topics.js";
import {enviar} from "./mqtt.js";

let container, puck, btnClaxon, valX, valY;
let dragging = false; // Indica si el usuario está moviendo el joystick
let latestMsg = "0.00,0.00"; // Último valor x,y enviado
let sendInterval = null; // Intervalo para enviar datos
const FRECUENCIA_MS = 50; // Tiempo entre envíos de datos (50 ms o 20 veces por segundo)
const DEADZONE = 0.10; // Zona muerta del joystick

// Esta función se invoca al momento de tocar el control
const touchJoystick = () => {
    dragging = true; // Activar movimiento

    if (!sendInterval) {
        sendInterval = setInterval(() => {
            enviar(TOPICS.joystick, latestMsg); // Toma el último valor "latestMsg" y lo envía la broker MQTT
        }, FRECUENCIA_MS);
    }
};

const handleTouchStart = (evento) => {
    evento.preventDefault(); // Evita que la pantalla se mueva o haga scroll mientras se usa el joystick
    touchJoystick();
};

function aplicarZonaMuerta(valor) {
    return Math.abs(valor) < DEADZONE ? "0.00" : valor.toFixed(2);
}

// Función para inicializar todo el joystick
export function iniciarJoystick() {
    container = document.getElementById("joystick-container"); // Contenedor del joystick
    puck = document.getElementById("joystick-puck"); // Control (puck)
    btnClaxon = document.getElementById("btnClaxon"); // Botón del claxon
    valX = document.getElementById("valX"); // Valor X
    valY = document.getElementById("valY"); // Valor Y

    /*
        Se eliminan los event listeners y se vuelven a crear cada vez que se llama a iniciarJoystick(),
        debido a que esta función se ejecuta cada vez que cambiamos al "modo manual".
        Si no hacemos esto, los event listeners se duplicarán, generando mensajes duplicados al tópico
    */

    puck.removeEventListener("mousedown", touchJoystick);
    puck.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("mousemove", moverJoystick);
    window.removeEventListener("mouseup", detenerJoystick);
    window.removeEventListener("touchmove", moverJoystick);
    window.removeEventListener("touchend", detenerJoystick);

    puck.addEventListener("mousedown", touchJoystick);
    puck.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("mousemove", moverJoystick);
    window.addEventListener("touchmove", moverJoystick, { passive: false });
    window.addEventListener("mouseup", detenerJoystick);
    window.addEventListener("touchend", detenerJoystick);

    // Envía "1" al topic "claxon" cuando se presiona el botón
    btnClaxon.onclick = () => enviar(TOPICS.claxon, "1");
}

// Función invocada para calcular la posición del joystick al detectar movimiento
function moverJoystick(evento) {
    if (!dragging) return; // Si no hay movimiento, salir
    evento.preventDefault();

    if (!puck || !container) return; // Si cambiamos de modo, los elementos pueden no existir

    const radius = container.offsetWidth / 2;
    const rect = container.getBoundingClientRect();
    const clientX = evento.touches ? evento.touches[0].clientX : evento.clientX; // Posición del cursor en X
    const clientY = evento.touches ? evento.touches[0].clientY : evento.clientY; // Posición del cursor en Y
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;

    // Calcular distancia desde el centro (0,0)
    let dx = clientX - centerX;
    let dy = clientY - centerY;

    // Si la distancia es mayor que el radio, evita que el joystick salga del área
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radius) {
        dx *= radius / distance;
        dy *= radius / distance;
    }

    // El control se mueve visualmente a su posición inicial
    puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    
    // Los valores se normalizan entre -1 y 1
    const rawX = dx / radius;
    const rawY = (dy / radius) * -1;
    
    // Revisa que los valores no se encuentren dentro de la zona muerta del joystick
    const normX = aplicarZonaMuerta(rawX);
    const normY = aplicarZonaMuerta(rawY);
    
    latestMsg = `${normX},${normY}`; // Se enviará en el siguiente intervalo
    
    // Actualiza los valores en pantalla
    if (valX && valY) {
        valX.innerText = normX;
        valY.innerText = normY;
    }
}

// Función invocada al soltar el joystick
export function detenerJoystick() {
    if (!dragging) return; // Si no hay movimiento, salir
    dragging = false; // Detiene el movimiento

    if (sendInterval) {
        clearInterval(sendInterval);
        sendInterval = null; // Deja de enviar datos
    }

    // Regresa el control al centro y reinicia los valores a 0.00
    if (puck) puck.style.transform = `translate(-50%, -50%)`;
    if (valX) valX.innerText = "0.00";
    if (valY) valY.innerText = "0.00";
    
    enviar(TOPICS.joystick, "0.00,0.00"); // Detiene el vehículo
}