import './css/style.css';
import {initTheme} from "./modules/theme/theme.js"; // Cargar tema guardado en localStorage
import mqttService from "./modules/mqtt/mqttService.js"; // Objeto para el servicio MQTT
import {topics} from "./modules/mqtt/topics.js"; // Diccionario de tópicos MQTT

// Modos
import manual from "./modules/modes/manual.js";
import seguidor from "./modules/modes/seguidor.js";
import obstaculos from "./modules/modes/obstaculos.js";
import navegacion from "./modules/modes/navegacion.js";

initTheme();
mqttService.conectar();

const modeSelect = document.getElementById("mode-select");
const modeInterface = document.getElementById("mode-interface");

// Modo seleccionado
let currentMode = null;

/*
    Cambio de modo:
    - elimina modo anterior si existe
    - limpia interfaz y eventos si existen
    - monta nuevo modo
    - publica cambio por MQTT
*/
function setMode(mode, name) {
    if (currentMode?.eliminar) {
        currentMode.eliminar();
    }

    modeInterface.innerHTML = "";
    currentMode = mode;

    if (currentMode?.montar) {
        currentMode.montar(modeInterface);
    }

    mqttService.publicar(topics.accion.modo, {modo: name});
}

mqttService.recibir((topic, payload) => {
    if (!payload) return;

    if (topic === topics.estado.ubicacion && currentMode === navegacion) {
        const {lat, lon, rumbo, sat, destino} = payload;
        
        if (typeof lat === "number" && typeof lon === "number") {
            navegacion.actualizarInterfaz(lat, lon, rumbo, sat);
        }

        if (destino === true) {
            navegacion.reiniciar();
        }
    }
});

// Selector de modos
modeSelect.addEventListener("change", () => {
    const value = modeSelect.value;

    switch (value) {
        case "1":
            setMode(manual, "manual");
            break;

        case "2":
            setMode(seguidor, "seguidor");
            break;

        case "3":
            setMode(obstaculos, "obstaculos");
            break;

        case "4":
            setMode(navegacion, "navegacion");
            break;
    }
});