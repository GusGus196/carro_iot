import {TOPICS} from './modules/topics.js' // Topics MQTT
import {client, send} from './modules/mqtt.js'; // Cliente y función send() MQTT
import {initJoystick, stopJoystick} from './modules/joystick.js'; // Funciones del joystick 'modo manual'
import {initSeguidor} from './modules/seguidor.js'; // Activar 'modo seguidor de línea'
import {initMapa, actualizarPosicion} from './modules/gps.js'; // Funciones del mapa para 'modo navegación gps'
import {showAlert} from './modules/alert.js'; // Alerta personalizada para navegación GPS

const modeSelect = document.getElementById('modeSelect'); // Select del modo
const interfaceSpace = document.getElementById('interfaceSpace'); // Interfaz del modo

client.on('message', (topic, message) => {
    if (topic === TOPICS.ubicacion) {
        const data = message.toString().split(','); // Mensaje recibido del smart car con su posición
        const lat = parseFloat(data[0]); // Latitud del smart car
        const lon = parseFloat(data[1]); // Longitud del smart car

        if (!isNaN(lat) && !isNaN(lon)) {
            actualizarPosicion(lat, lon);
        }
    }

    if(topic === TOPICS.llegada) {
        // Mostramos una alerta personalizada al llegar al destino
        showAlert("NAVEGACIÓN GPS", "¡Se ha llegado al destino!");
    }
})

// Select del modo
modeSelect.addEventListener('change', () => {
    const value = modeSelect.value;
    /*
        value = 1, modo manual
        value = 2, seguidor de línea
        value = 3, navegación gps
    */

    stopJoystick(); // Detenerlo al cambiar de modo
    
    if (value === "1") {
        interfaceSpace.innerHTML = `
            <div id="joystick-container">
                <div id="joystick-puck"></div>
                </div>
                    <div class="stats">
                        X: <span id="valX">0.00</span> | Y: <span id="valY">0.00</span>
                    </div>
                <div class="controls">
                <button id="btnClaxon" class="btn-action">Claxon</button>
            </div>
        `;
        
        send(TOPICS.modo, "control");
        initJoystick();
    } else if (value === "2") {
        interfaceSpace.innerHTML = `
            <div class="mode-card">
                <button id="btnSensor" type="button" class="btn-action">Activar</button>
            </div>
        `;
        
        send(TOPICS.modo, "linea");
        initSeguidor();
    } else if (value === "3") {
        interfaceSpace.innerHTML = `
            <div class="mode-card">
                <div id="mapa"></div>
                <div class="stats">
                    <b>Destino</b><br>
                    Lat: <span id="latD">0.00</span> | Lon: <span id="lonD">0.00</span>
                </div>
                <div class="stats">
                    <b>Smart Car</b><br>
                    Lat: <span id="latC">0.00</span> | Lon: <span id="lonC">0.00</span>
                </div>
                <div class="controls">
                    <button id="btnConfirmar" class="btn-action">Enviar destino</button>
                </div>
            </div>
        `;

        send(TOPICS.modo, "gps");
        setTimeout(initMapa, 200);
    };
});