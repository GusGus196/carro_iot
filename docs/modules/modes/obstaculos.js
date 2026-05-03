import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";

const obstaculos = {
    btnObstaculos: null, // Elemento HTML del botón
    activo: false, // Estado lógico del modo

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
        // Alternar estado, estilo visual del botón y payload del mensaje
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
        
        // Medida de seguridad: apagar el modo si se cambia de menú mientras estaba activo
        if(this.activo) {
            mqttService.publicar(topics.modo.obstaculos, {accion: "desactivar"});
        }

        this.btnObstaculos = null;
        this.activo = false;
    }
}

export default obstaculos;