import {TOPICS} from "./topics.js";
import {enviar} from "./mqtt.js";

let container, puck, btnClaxon, valX, valY;

let dragging = false; // Indica si el usuario está moviendo el joystick
let latestMsg = "0.00,0.00"; // Último valor x,y enviado
let sendInterval = null; // Intervalo para enviar datos
const FRECUENCIA_MS = 50; // Tiempo entre envío de datos (50ms o 20 veces por segundo)

// Función para inicializar todo el joystick
export function iniciarJoystick() {
    container = document.getElementById('joystick-container'); // Div del contenedor joystick
    puck = document.getElementById('joystick-puck'); // Div del control (puck)
    btnClaxon = document.getElementById('btnClaxon'); // Botón del claxon
    valX = document.getElementById('valX'); // Stats x
    valY = document.getElementById('valY'); // Stats y

    // Esta función se invoca al momento de tocar el control
    const startJoystick = () => {
        dragging = true; // Activar movimiento

        if (!sendInterval) {
            sendInterval = setInterval(() => {
                enviar(TOPICS.joystick, latestMsg); // Toma el último valor 'latestMsg' y lo envía por MQTT
            }, FRECUENCIA_MS); // Este intervalo determina el tiempo de envío de mensajes de movimiento hacia el topic 'joystick' cada 50ms
        }
    };

    /*
        Se eliminan los event listeners y se vuelven a crear cada que se llama a iniciarJoystick(),
        debido a que esta función se llama cada vez que cambiamos de modo en el selector a 'modo manual',
        si no hacemos este proceso, los event listeners se duplicarán cada que cambiamos de modo y volvemos a modo manual,
        generando mensajes duplicados de envío al topic
    */

    window.removeEventListener('mousemove', moverJoystick);
    window.removeEventListener('mouseup', detenerJoystick);
    window.removeEventListener('touchmove', moverJoystick);
    window.removeEventListener('touchend', detenerJoystick);

    puck.addEventListener('mousedown', startJoystick);
    puck.addEventListener('touchstart', (evento) => {
        evento.preventDefault(); // Evita que la pantalla se mueva o haga scroll mientras el joystick se utiliza
        startJoystick();
    }, { passive: false }); // Permite utilizar preventDefault()

    window.addEventListener('mousemove', moverJoystick);
    window.addEventListener('touchmove', moverJoystick, {passive: false});
    window.addEventListener('mouseup', detenerJoystick);
    window.addEventListener('touchend', detenerJoystick);

    btnClaxon.onclick = () => enviar(TOPICS.claxon, "1"); // Enviar un '1' al topic 'claxon' cuando el botón es presionado
};

// Función invocada para calcular la posición del joystick al detectar movimiento
function moverJoystick(evento) {
    if (!dragging) return; // Si no hay movimiento, salir
    evento.preventDefault();

    if (!dragging || !puck || !container) return;
    
    if (!container || !puck) return; // Si cambiamos de modo, ambos elementos dejaran de existir

    const radius = container.offsetWidth / 2;
    const rect = container.getBoundingClientRect();
    const clientX = evento.touches ? evento.touches[0].clientX : evento.clientX; // Obtener posición del cursor en x
    const clientY = evento.touches ? evento.touches[0].clientY : evento.clientY; // Obtener posición del cursor en y
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

    // El control se mueve visualmente a tu posición
    puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    
    // Los valores se normalizan entre los límites -1 a 1
    const normX = (dx / radius).toFixed(2);
    const normY = ((dy / radius) * -1).toFixed(2);
    
    latestMsg = `${normX},${normY}`; // Los valores normalizados se enviarán en el siguiente mensaje en startJoystick()
    
    // El div de stats para x,y se actualiza
    if(valX && valY) {
        valX.innerText = normX;
        valY.innerText = normY;
    }
};

// Función invocada al soltar el joystick
export function detenerJoystick() {
    if (!dragging) return; // Si aún hay movimiento, salir
    dragging = false; // Detiene el movimiento

    if (sendInterval) {
        clearInterval(sendInterval);
        sendInterval = null; // Deja de enviar datos por startJoystick()
    }

    // Regresa el control al centro y el div que muestra estadísticas para x,y a 0.00
    if (puck) puck.style.transform = `translate(-50%, -50%)`;
    if (valX) valX.innerText = "0.00";
    if (valY) valY.innerText = "0.00";
    
    enviar(TOPICS.joystick, "0.00,0.00"); // Envía el mensaje directamente y detiene el smart car
};