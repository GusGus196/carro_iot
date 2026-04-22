import { mostrarAlerta } from "./modules/feedback.js"; // Alerta personalizada
import { iniciarMapa, actualizarPosicion, reiniciarDestino } from "./modules/gps.js"; // Funciones del mapa para modo "navegación GPS"
import { iniciarJoystick, detenerJoystick } from "./modules/joystick.js"; // Funciones del joystick para el modo "manual"
import { client, enviar } from "./modules/mqtt.js"; // Cliente MQTT y función enviar()
import { iniciarSeguidor } from "./modules/seguidor.js"; // Activar y desactivar el modo "seguidor de línea"
import { TOPICS } from "./modules/topics.js" // Tópicos MQTT

const modeSelect = document.getElementById("modeSelect"); // Select del modo
const interfaceSpace = document.getElementById("interfaceSpace"); // Interfaz del modo

client.on("message", (topic, message) => {
    // Actualizar la posición del Smart Car
    if (topic === TOPICS.ubicacion) {
        const data = message.toString().split(","); // Mensaje de posición recibido del Smart Car
        const lat = parseFloat(data[0]); // Latitud
        const lon = parseFloat(data[1]); // Longitud

        if (!isNaN(lat) && !isNaN(lon)) {
            actualizarPosicion(lat, lon);
            
            // Debug de entrada, comentar para producción
            console.log(`[SUBSCRIBE] ${topic}: ${lat}, ${lon}`);
        }
    };

    /* 
    NOTA: esta condición solo se cumple cuando el Smart Car ha llegado a su destino.
    Se establece un radio de llegada debido al error de precisión del módulo GY-GPS6MV2
    */
    if (topic === TOPICS.llegada) {
        mostrarAlerta("Navegación GPS", "¡Se ha llegado al destino!"); // Mostramos una alerta personalizada
        reiniciarDestino(); // Función para reiniciar los valores de destino y marcador
    }
});

// Select del modo
modeSelect.addEventListener("change", () => {
    const value = modeSelect.value;

    detenerJoystick(); // Detener al cambiar de modo (publicar "0.0,0.0")

    switch (value) {
        case "1": // Modo manual
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
            break;

        case "2": // Seguidor de línea
            interfaceSpace.innerHTML = `
                <div class="mode-card">
                    <button id="btnSensor" type="button" class="btn-action btn-state-off">Activar</button>
                </div>
            `;

            enviar(TOPICS.modo, "linea");
            iniciarSeguidor();
            break;

        case "3": // Navegación GPS
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
                        <button id="btnDestino" class="btn-action">Enviar destino</button>
                    </div>
                </div>
            `;

            enviar(TOPICS.modo, "gps");
            requestAnimationFrame(() => iniciarMapa());
            break;

        default:
            // Por si acaso (valor inválido)
            interfaceSpace.innerHTML = `
                <p class="placeholder-text">Selecciona un modo válido</p>
            `;
            break;
    }
});