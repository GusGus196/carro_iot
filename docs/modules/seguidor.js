import mqttService from "./mqttService.js";
import {topics} from "./topics.js";

const seguidor = {
    btnSeguidor: null,
    activo: false,

    iniciar() {
        this.btnSeguidor = document.getElementById("btnSeguidor");
        
        if(!this.btnSeguidor) {
            return;
        } else {
            this.btnSeguidor.onclick = () => {
                this.controlar();
            }
        }
    },

    controlar() {
        this.activo = !this.activo;

        this.btnSeguidor.classList.toggle("btn-state-on", this.activo);
        this.btnSeguidor.classList.toggle("btn-state-off", !this.activo);
        this.btnSeguidor.textContent = this.activo ? "Desactivar" : "Activar";
        
        const msg = {accion: this.activo ? "activar" : "desactivar"};
        mqttService.publicar(topics.modo.seguidor, msg);
    },

    eliminar() {
        if (this.btnSeguidor) {
            this.btnSeguidor.onclick = null;
        }
        
        if(this.activo) {
            mqttService.publicar(topics.modo.seguidor, {accion: "Desactivar"});
        }

        this.btnSeguidor = null;
        this.activo = false;
    }
}

export default seguidor;