import mqttService from "./mqttService.js";
import {topics} from "./topics.js";

const obstaculos = {
    btnObstaculos: null,
    activo: false,

    iniciar() {
        this.btnObstaculos = document.getElementById("btnObstaculos");
        
        if(!this.btnObstaculos) {
            return;
        } else {
            this.btnObstaculos.onclick = () => {
                this.controlar();
            }
        }
    },

    controlar() {
        this.activo = !this.activo;

        this.btnObstaculos.classList.toggle("btn-state-on", this.activo);
        this.btnObstaculos.classList.toggle("btn-state-off", !this.activo);
        this.btnObstaculos.textContent = this.activo ? "Desactivar" : "Activar";
        
        const msg = {accion: this.activo ? "activar" : "desactivar"};
        mqttService.publicar(topics.modo.obstaculos, msg);
    },

    eliminar() {
        if (this.btnObstaculos) {
            this.btnObstaculos.onclick = null;
        }
        
        if(this.activo) {
            mqttService.publicar(topics.modo.obstaculos, {accion: "Desactivar"});
        }

        this.btnObstaculos = null;
        this.activo = false;
    }
}

export default obstaculos;