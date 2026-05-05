import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";

const seguidor = {
    contenedor: null,
    toggle: null,
    activo: false,

    montar(contenedor) {
        this.contenedor = contenedor;

        contenedor.innerHTML = `
            <div class="mode-wrapper mode-center">
                <input type="checkbox" class="toggle toggle-success toggle-lg md:toggle-xl"/>
            </div>
        `;

        this.enlazar();
    },

    enlazar() {
        this.toggle = this.contenedor.querySelector(".toggle");

        this.toggleClick = () => this.controlar();
        this.toggle?.addEventListener("change", this.toggleClick);
    },

    controlar() {
        this.activo = this.toggle.checked;

        const msg = {accion: this.activo ? "activar" : "desactivar"};
        mqttService.publicar(topics.modo.seguidor, msg);
    },

    eliminar() {
        this.toggle?.removeEventListener("change", this.toggleClick);

        if (this.activo) {
            // Mensaje de seguridad
            mqttService.publicar(topics.modo.seguidor, {accion: "desactivar"});
        }

        this.contenedor = null;
        this.toggle = null;
        this.toggleClick = null;
        this.activo = false;
    }
}

export default seguidor;