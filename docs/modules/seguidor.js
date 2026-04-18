import { TOPICS } from "./topics.js";
import { enviar } from "./mqtt.js";

export function iniciarSeguidor() {
    const btnSensor = document.getElementById("btnSensor");
    if (!btnSensor) return;

    let activo = false;

    btnSensor.addEventListener("click", () => {
        activo = !activo;

        // Polarizar la clase, texto y mensaje al hacer click
        if (activo) {
            btnSensor.classList.remove("btn-state-off");
            btnSensor.classList.add("btn-state-on");
            btnSensor.textContent = "Desactivar";
            enviar(TOPICS.seguidor, "1");
        } else {
            btnSensor.classList.remove("btn-state-on");
            btnSensor.classList.add("btn-state-off");
            btnSensor.textContent = "Activar";
            enviar(TOPICS.seguidor, "0");
        }
    });
}