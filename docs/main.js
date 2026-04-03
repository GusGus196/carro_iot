import {TOPICS} from './modules/topics.js' // Topics MQTT
import {client, enviar} from './modules/mqtt.js'; // Cliente y función enviar() MQTT
import {iniciarJoystick, detenerJoystick} from './modules/joystick.js'; // Funciones del joystick 'modo manual'
import {iniciarSeguidor} from './modules/seguidor.js'; // Activar y desactivar 'modo seguidor de línea'
import {iniciarMapa, actualizarPosicion, reiniciarDestino} from './modules/gps.js'; // Funciones del mapa para 'modo navegación gps'
import {mostrarAlerta} from './modules/alert.js'; // Alerta personalizada para navegación GPS

const modeSelect = document.getElementById('modeSelect'); // Select del modo
const interfaceSpace = document.getElementById('interfaceSpace'); // Interfaz del modo

client.on('message', (topic, message) => {
    // Actualizar la posición del smart car
    if (topic === TOPICS.ubicacion) {
        const data = message.toString().split(','); // Mensaje recibido del smart car con su posición
        const lat = parseFloat(data[0]); // Latitud del smart car
        const lon = parseFloat(data[1]); // Longitud del smart car

        if (!isNaN(lat) && !isNaN(lon)) {
            actualizarPosicion(lat, lon);
            console.log(`${topic}: ${lat}, ${lon}`); // Comentar esta linea para dejar de mostrar mensajes de ubicación recibidos
        };
    };

    /* 
        Esta condición solo se cumple cuando el smart car ha llegado a su destino.
        Se establece un radio de llegada 2-5 metros entre el smart car y el destino,
        debido a la imprecisión que pueda causar del módulo GY-GPS6MV2
    */
    if(topic === TOPICS.llegada) {
        mostrarAlerta("NAVEGACIÓN GPS", "¡Se ha llegado al destino!"); // Mostramos una alerta personalizada al llegar
        reiniciarDestino(); // Función para reiniciar los valores de destino
    }
});

// Select del modo
modeSelect.addEventListener('change', () => {
    const value = modeSelect.value;
    /*
        value = 1, modo manual
        value = 2, seguidor de línea
        value = 3, navegación gps
    */

    detenerJoystick(); // Detenerlo al cambiar de modo
    
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
        
        enviar(TOPICS.modo, "control");
        iniciarJoystick();
    } else if (value === "2") {
        interfaceSpace.innerHTML = `
            <div class="mode-card">
                <button id="btnSensor" type="button" class="btn-action">Activar</button>
            </div>
        `;
        
        enviar(TOPICS.modo, "linea");
        iniciarSeguidor();
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
                    <button id="btnEnviar" class="btn-action">Enviar destino</button>
                </div>
            </div>
        `;

        enviar(TOPICS.modo, "gps");
        setTimeout(iniciarMapa, 200);
    };
});