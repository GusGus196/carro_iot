import {TOPICS} from './topics.js' // Módulo de direcciones de topics MQTT
import {send} from './mqtt.js'; // Cliente y función enviar MQTT

export function initSeguidor() {
    const btnSensor = document.getElementById('btnSensor');
    
    btnSensor.addEventListener("click", () => {
        btnSensor.classList.toggle('btn-action');
        btnSensor.classList.toggle('btn-desactivado');
        btnSensor.textContent = btnSensor.classList.contains('btn-action') ? "Activar modo" : "Desactivar modo"; // Cambiar texto contenido
        
        send(TOPICS.sensor, btnSensor.classList.contains('btn-action') ? "1" : "0"); // Si el botón contiene la clase 'btn-action' enviar un 1, de lo contrario envía 0
    });
}