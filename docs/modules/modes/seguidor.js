import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";

const seguidor = {
    btnSeguidor: null, // Elemento HTML del botón
    activo: false, // Estado lógico del modo

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
        // Alternar estado, estilo visual del botón y payload del mensaje
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
        
        // Medida de seguridad: apagar el modo si se cambia de menú mientras estaba activo
        if(this.activo) {
            mqttService.publicar(topics.modo.seguidor, {accion: "desactivar"});
        }

        this.btnSeguidor = null;
        this.activo = false;
    }
}

export default seguidor;