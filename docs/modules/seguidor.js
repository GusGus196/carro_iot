import {TOPICS} from './topics.js' // Módulo de direcciones de topics MQTT
import {enviar} from './mqtt.js'; // Cliente y función enviar MQTT

export function iniciarSeguidor() {
    const btnSensor = document.getElementById('btnSensor');
    
    if (!btnSensor) return; // Evitar errores si el elemento no existe

    btnSensor.addEventListener("click", () => {
        btnSensor.classList.toggle('btn-action');
        btnSensor.classList.toggle('btn-desactivado');
        
        // Cambiar texto contenido
        btnSensor.textContent = btnSensor.classList.contains('btn-action') ? "Activar" : "Desactivar";
        
        // Si el botón no contiene la clase 'btn-action' enviar un 1, de lo contrario envía 0
        enviar(TOPICS.seguidor, !btnSensor.classList.contains('btn-action') ? "1" : "0");
    });
};