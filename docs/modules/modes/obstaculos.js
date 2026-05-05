import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";

const obstaculos = {
    contenedor: null,
    toggleObstaculos: null,
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
        this.toggleObstaculos = this.contenedor.querySelector(".toggle");

        this.toggleClick = () => this.controlar();
        this.toggleObstaculos?.addEventListener("change", this.toggleClick);
    },

    controlar() {
        this.activo = this.toggleObstaculos.checked;

        const msg = {accion: this.activo ? "activar" : "desactivar"};
        mqttService.publicar(topics.modo.obstaculos, msg);
    },

    eliminar() {
        this.toggleObstaculos?.removeEventListener("change", this.toggleClick);

        if (this.activo) {
            mqttService.publicar(topics.modo.obstaculos, {accion: "desactivar"});
        }

        this.contenedor = null;
        this.toggleObstaculos = null;
        this.toggleClick = null;
        this.activo = false;
    }
}

export default obstaculos;