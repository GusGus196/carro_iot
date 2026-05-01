import mqttService from "./modules/mqttService.js"; // Objeto para el Servicio MQTT
import {topics} from "./modules/topics.js"; // Diccionario de los tópicos MQTT

// Objeto para cada modo
import manual from "./modules/manual.js";
import seguidor from "./modules/seguidor.js";
import obstaculos from "./modules/obstaculos.js";
import navegacion from "./modules/navegacion.js";

mqttService.conectar();

mqttService.recibir((topic, payload) => {
    if (topic === topics.estado.ubicacion) {
        const {lat, lon, sat, rumbo, alcanzado} = payload;
        
        if(lat && lon) {
            navegacion.actualizarPosicion(lat, lon);
        }

        if(alcanzado === true) {
            navegacion.reiniciar();
        }
    }
});

const modeSelect = document.getElementById("mode-select");
const interfaceSpace = document.getElementById("interface-space");

modeSelect.addEventListener("change", () => {
    const value = modeSelect.value;
    
    // Garbage collector
    manual.eliminar();
    seguidor.eliminar();
    obstaculos.eliminar();
    navegacion.eliminar();

    switch (value) {
        case "1": // Control manual
            interfaceSpace.innerHTML = `
                <div id="joystick-container">
                    <div id="joystick-puck"></div>
                </div>
                <div class="stats">
                    X: <span id="valX">0.00</span> | Y: <span id="valY">0.00</span>
                </div>
                <div class="controls-grid">
                    <div class="light-group">
                        <button id="btnDirIzq" class="btn-light btn-state-off">
                            <img src="assets/arrow-left.svg" alt="L">
                        </button>
                        <button id="btnPrev" class="btn-light btn-state-off">
                            <img src="assets/warning.svg" alt="P">
                        </button>
                        <button id="btnDirDer" class="btn-light btn-state-off">
                            <img src="assets/arrow-right.svg" alt="R">
                        </button>
                    </div>
                    <button id="btnClaxon" class="btn-action">Claxon</button>
                </div>
            `;

            mqttService.publicar(topics.accion.modo, {modo: "manual"});
            manual.iniciar();
            break;

        case "2": // Seguidor de línea
            interfaceSpace.innerHTML = `
                <div class="mode-card">
                    <button id="btnSeguidor" type="button" class="btn-action btn-state-off">Activar</button>
                </div>
            `;
            
            mqttService.publicar(topics.accion.modo, {modo: "seguidor"});
            seguidor.iniciar();
            break;
            
        case "3": // Evitar obstáculos
            interfaceSpace.innerHTML = `
                <div class="mode-card">
                    <button id="btnObstaculos" type="button" class="btn-action btn-state-off">Activar</button>
                </div>
            `;
            
            mqttService.publicar(topics.accion.modo, {modo: "obstaculos"});
            obstaculos.iniciar();
            break;

        case "4": // Navegación GPS
            interfaceSpace.innerHTML = `
                <div class="mode-card">
                    <div id="mapa"></div>
                    <div class="stats">
                        <b>Destino</b><br>
                        Lat: <span id="latD">0.00</span> | Lon: <span id="lonD">0.00</span>
                    </div>
                    <div class="stats">
                        <b>Smart Car</b><br>
                        Lat: <span id="latSC">0.00</span> | Lon: <span id="lonSC">0.00</span>
                    </div>
                    <div class="controls">
                        <button id="btnGPS" class="btn-action btn-state-off">Enviar destino</button>
                    </div>
                </div>
            `;

            mqttService.publicar(topics.accion.modo, {modo: "navegacion"});
            // Se usa requestAnimationFrame para asegurar que el DOM se haya actualizado antes de iniciar el mapa
            requestAnimationFrame(() => navegacion.iniciarMapa());
            break;

        default:
            // Por si acaso (valor inválido o vacío)
            interfaceSpace.innerHTML = `
                <p class="placeholder-text">Selecciona un modo de operación válido</p>
            `;
            break;
    }
});