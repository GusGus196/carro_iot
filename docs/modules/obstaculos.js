import { TOPICS } from "./topics.js";
import { enviar } from "./mqtt.js";

export function iniciarObstaculos() {
    const btnObstaculos = document.getElementById("btnObstaculos");
    if (!btnObstaculos) return;

    let activo = false;

    btnObstaculos.addEventListener("click", () => {
        activo = !activo;

        // Polarizar la clase, texto y mensaje al hacer click
        if (activo) {
            btnObstaculos.classList.remove("btn-state-off");
            btnObstaculos.classList.add("btn-state-on");
            btnObstaculos.textContent = "Desactivar";
            enviar(TOPICS.obstaculos, "1");
        } else {
            btnObstaculos.classList.remove("btn-state-on");
            btnObstaculos.classList.add("btn-state-off");
            btnObstaculos.textContent = "Activar";
            enviar(TOPICS.obstaculos, "0");
        }
    });
}