import {TOPICS} from "./topics.js";
import {enviar} from "./mqtt.js";

export function iniciarSeguidor() {
    const btnSensor = document.getElementById("btnSensor");
    
    if (!btnSensor) return;

    btnSensor.addEventListener("click", () => {
        btnSensor.classList.toggle("btn-action");
        btnSensor.classList.toggle("btn-desactivado");
        
        // Cambiar texto contenido
        btnSensor.textContent = btnSensor.classList.contains("btn-action") ? "Activar" : "Desactivar";
        
        // Si el botón no contiene la clase "btn-action" enviar un 1, de lo contrario envía 0
        enviar(TOPICS.seguidor, !btnSensor.classList.contains("btn-action") ? "1" : "0");
    });
};