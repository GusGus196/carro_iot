import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";

const seguidor = {
    contenedor: null,
    toggleSeguidor: null,
    activo: false,

    montar(contenedor) {
        this.contenedor = contenedor;

        contenedor.innerHTML = `
            <div class="mode-wrapper mode-center">
                <input type="checkbox" class="toggle toggle-success toggle-lg md:toggle-xl" />
            </div>
        `;

        this.enlazar();
    },

    enlazar() {
        this.toggleSeguidor = this.contenedor.querySelector(".toggle");

        this.toggleClick = () => this.controlar();
        this.toggleSeguidor?.addEventListener("change", this.toggleClick);
    },

    controlar() {
        this.activo = this.toggleSeguidor.checked;

        const msg = {accion: this.activo ? "activar" : "desactivar"};
        mqttService.publicar(topics.modo.seguidor, msg);
    },

    eliminar() {
        this.toggleSeguidor?.removeEventListener("change", this.toggleClick);

        if (this.activo) {
            mqttService.publicar(topics.modo.seguidor, {accion: "desactivar"});
        }

        this.contenedor = null;
        this.toggleSeguidor = null;
        this.toggleClick = null;
        this.activo = false;
    }
}

export default seguidor;