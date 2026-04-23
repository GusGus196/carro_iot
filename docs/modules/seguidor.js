import { TOPICS } from "./topics.js";
import { enviar } from "./mqtt.js";

export function iniciarSeguidor() {
    const btnSeguidor = document.getElementById("btnSeguidor");
    if (!btnSeguidor) return;

    let activo = false;

    btnSeguidor.addEventListener("click", () => {
        activo = !activo;

        // Polarizar la clase, texto y mensaje al hacer click
        if (activo) {
            btnSeguidor.classList.remove("btn-state-off");
            btnSeguidor.classList.add("btn-state-on");
            btnSeguidor.textContent = "Desactivar";
            enviar(TOPICS.seguidor, "1");
        } else {
            btnSeguidor.classList.remove("btn-state-on");
            btnSeguidor.classList.add("btn-state-off");
            btnSeguidor.textContent = "Activar";
            enviar(TOPICS.seguidor, "0");
        }
    });
}