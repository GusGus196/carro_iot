// const modeSelect = document.getElementById('modeSelect'); // Select del modo
// const interfaceSpace = document.getElementById('interfaceSpace'); // Interfaz del modo (contenedor)
let container, puck, btnClaxon, valX, valY; // Variables para joystick
let mapa, destino, destinoMarker, carroMarker; // Variables para GPS

// const TOPICS = {
//     modo: "smartcar/control/modo",
//     joystick: "smartcar/control/joystick",
//     claxon: "smartcar/control/claxon",
//     sensor: "smartcar/control/sensor",
//     destino: "smartcar/control/destino",
//     ubicacion: "smartcar/estado/ubicacion",
//     llegada: "smartcar/estado/llegada"
// };

// Conexión MQTT
// const clientId = 'smartcar-mqttcontroller-' + Math.random().toString(16).slice(2, 10); // Genera un ID de cliente
// const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', { // Conecta al broker público HiveMQ utilizando WebSockets
//     clientId: clientId,
//     clean: true
// });

// client.on('connect', () => {
//     console.log("MQTT conectado");
//     client.subscribe(TOPICS.ubicacion); // Escuchar la ubicación del smart car siempre
// });

// client.on('reconnect', () => {
//     console.warn("Reconectando al servidor MQTT...");
// });

// client.on('error', (err) => {
//     console.error("Error de conexión MQTT:", err);
//     client.end();
// });

// client.on('offline', () => {
//     console.error("Estado offline, revisa tu conexión");
// });

// // Función para enviar mensajes al broker
// function send(topic, message) {
//     if (client.connected) {
//         client.publish(topic, message); // Publica mensaje en el topic indicado
    
//         // En caso de hacer test en los TOPICS, utilizar la siguiente linea:
//         console.log(`${topic}: ${message}`);
//     }
// }

/* 
    Cambio de modo
    value = 1, modo control manual
    value = 2, modo seguidor de línea
    value = 3, modo navegación GPS
*/
modeSelect.addEventListener('change', () => {
    send(TOPICS.joystick, "0.00,0.00");
    stopJoystick();
    
    const value = modeSelect.value;
    
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
                <button id="btnSensor" type="button" class="btn-action">Activar modo</button>
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
                    <button id="btnConfirmar" class="btn-action">Confirmar destino</button>
                </div>
            </div>
        `;
    
        send(TOPICS.modo, "gps");
        setTimeout(() => {
            initMapa(); // Esperar 200ms para renderizar el contenedor antes de crear el mapa
        }, 200);

    }
});

/* Control manual 🗿 */

let dragging = false; // Indica si el usuario está moviendo el joystick
let latestMsg = "0.00,0.00"; // Último valor x,y enviado
let sendInterval = null; // Intervalo para enviar datos
const FRECUENCIA_MS = 50; // Tiempo entre envío de datos (50ms o 20 veces por segundo)

// Función para inicializar todo el joystick
function initJoystick() {
    // Cachear referencias para utilizar en moveJoystick() y stopJoystick()
    container = document.getElementById('joystick-container'); // Div del contenedor joystick
    puck = document.getElementById('joystick-puck'); // Div del control (puck)
    btnClaxon = document.getElementById('btnClaxon'); // Botón del claxon
    valX = document.getElementById('valX'); // Stats x
    valY = document.getElementById('valY'); // Stats y

    // Esta función se invoca al momento de tocar el control
    const startJoystick = () => {
        dragging = true; // Activar movimiento

        if (!sendInterval) {
            sendInterval = setInterval(() => {
                send(TOPICS.joystick, latestMsg); // Toma el último valor 'latestMsg' y lo envía por MQTT
            }, FRECUENCIA_MS); // Este intervalo determina el tiempo de envío de mensajes de movimiento hacia el topic 'joystick' cada 50ms
        }
    };

    /*
        Se eliminan los event listeners y se vuelven a crear cada que se llama a initJoystick(),
        debido a que esta función se llama cada vez que cambiamos de modo en el selector a 'modo manual',
        si no hacemos este proceso, los event listeners se duplicarán cada que cambiamos de modo y volvemos a modo manual,
        generando mensajes duplicados de envío al TOPIC joystick
    */

    window.removeEventListener('mousemove', moveJoystick);
    window.removeEventListener('mouseup', stopJoystick);
    window.removeEventListener('touchmove', moveJoystick);
    window.removeEventListener('touchend', stopJoystick);

    puck.addEventListener('mousedown', startJoystick);
    puck.addEventListener('touchstart', (evento) => {
        evento.preventDefault(); // Evita que la pantalla se mueva o haga scroll mientras el joystick se utiliza
        startJoystick();
    }, { passive: false }); // Permite utilizar preventDefault()

    window.addEventListener('mousemove', moveJoystick);
    window.addEventListener('touchmove', moveJoystick, {passive: false});
    window.addEventListener('mouseup', stopJoystick);
    window.addEventListener('touchend', stopJoystick);

    btnClaxon.onclick = () => send(TOPICS.claxon, "1");
}

// Función invocada para calcular la posición del joystick al detectar movimiento
const moveJoystick = (evento) => {
    if (!dragging) return; // Si no hay movimiento, salir
    evento.preventDefault();

    if (!dragging || !puck || !container) return;
    
    if (!container || !puck) return; // Si cambiamos de modo, ambos elementos dejaran de existir

    const radius = container.offsetWidth / 2;
    const rect = container.getBoundingClientRect();
    const clientX = evento.touches ? evento.touches[0].clientX : evento.clientX; // Obtener posición del cursor en x
    const clientY = evento.touches ? evento.touches[0].clientY : evento.clientY; // Obtener posición del cursor en y
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;

    // Calcular distancia desde el centro (0,0)
    let dx = clientX - centerX;
    let dy = clientY - centerY;

    // Si la distancia es mayor que el radio, evita que el joystick salga del área
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radius) {
        dx *= radius / distance;
        dy *= radius / distance;
    }

    // El control se mueve visualmente a tu posición
    puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    
    // Los valores se normalizan entre los límites -1 a 1
    const normX = (dx / radius).toFixed(2);
    const normY = ((dy / radius) * -1).toFixed(2);
    
    latestMsg = `${normX},${normY}`; // Los valores normalizados se enviarán en el siguiente mensaje en startJoystick()
    
    // El div de stats para x,y se actualiza
    if(valX && valY) {
        valX.innerText = normX;
        valY.innerText = normY;
    }
};

// Función invocada al soltar el joystick
const stopJoystick = () => {
    if (!dragging) return; // Si aún hay movimiento, salir
    dragging = false; // Detiene el movimiento

    if (sendInterval) {
        clearInterval(sendInterval);
        sendInterval = null; // Deja de enviar datos por startJoystick()
    }

    // Regresa el control al centro y el div que muestra estadísticas para x,y a 0.00
    if (puck) puck.style.transform = `translate(-50%, -50%)`;
    if (valX) valX.innerText = "0.00";
    if (valY) valY.innerText = "0.00";
    
    send(TOPICS.joystick, "0.00,0.00"); // Envía el mensaje directamente y detiene el smart car
};

/* Seguidor de líneas 🗿 */

// Inicializar cuando modoSelect value = 2 y el botón contiene la clase 'btn-action'
function initSeguidor() {
    const btnSensor = document.getElementById('btnSensor');
    
    btnSensor.addEventListener("click", () => {
        btnSensor.classList.toggle('btn-action');
        btnSensor.classList.toggle('btn-desactivado');
        btnSensor.textContent = btnSensor.classList.contains('btn-action') ? "Activar modo" : "Desactivar modo"; // Cambiar texto contenido
        send(TOPICS.sensor, btnSensor.classList.contains('btn-action') ? "1" : "0"); // Si el botón contiene la clase 'btn-action' enviar un 1, de lo contrario envía 0
    });
}

/* Navegación GPS 🗿 */

// Clase para crear iconos de Leaflet
const LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    }
});

// Clase para crear iconos custom
const CustomIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        shadowSize: [41, 41],
        shadowAnchor: [12, 41]
    }
});

// Nota: para generar un icono de las dos anteriores clases, debemos crear un nuevo objeto y agregar la URL o la dirección local de la imagen en el atributo 'iconUrl'
let redIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png'});
let greenIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png'});

// Función para crear el mapa
function initMapa() {
    if (mapa) { // Si mapa ya fue inicializado y ocurrió un cambio de modo (select), creamos uno nuevo y borramos las direcciones lat, long anteriores
        mapa.remove();
        destinoMarker = null;
        carroMarker = null;
    }
    mapa = L.map('mapa').setView([19.248302, -103.700119], 5); // Vista inicial de México
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { // Layer del mapa utilizando OpenStreetMap.org
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);
    setTimeout(() => {
        mapa.invalidateSize();
        mapa.flyTo([19.248302, -103.700119], 16, {
            duration: 1
        }); // Animación de zoom de hacia la nueva dirección de 1 segundo
    }, 1000);
    
    // Evento click en el mapa
    mapa.on('click', function(evento) {
        destino = evento.latlng;
        if (!destinoMarker) {
            destinoMarker = L.marker(evento.latlng, {icon: redIcon}).addTo(mapa).bindPopup("Destino"); // Crear marcador con icono (Leaflet o custom) y texto flotante del destino seleccionado
        } else {
            destinoMarker.setLatLng(evento.latlng);
        }
        document.getElementById('latD').innerText = evento.latlng.lat.toFixed(4); // Latitud del destino
        document.getElementById('lonD').innerText = evento.latlng.lng.toFixed(4); // Longitud del destino
        // Nota: mostramos 4 decimales para optimizar el espacio, aunque se deben enviar 6 para mejorar la precisión
    });
    
    // Evento del botón 'btnConfirmar' para enviar destino
    document.getElementById('btnConfirmar').addEventListener('click', () => {
        if (destino) {
            const msg = `${destino.lat.toFixed(6)},${destino.lng.toFixed(6)}`; // Mensaje 'latitud,longitud' del destino
            send(TOPICS.destino, msg); // Enviamos el mensaje
            alert("Destino enviado!");
        } else {
            alert("Selecciona un punto de destino en el mapa.");
        }
    });
}

client.on('message', (topic, message) => {
    if (topic === TOPICS.ubicacion) {
        const data = message.toString().split(','); // Mensaje recibido del smart car con su posición
        const lat = parseFloat(data[0]); // Latitud del smart car
        const lon = parseFloat(data[1]); // Longitud del smart car
        
        // Solo actualizamos la ubicación del smart car si estamos en el modo navegación GPS
        const latC = document.getElementById('latC');
        const lonC = document.getElementById('lonC');
        
        if (latC && lonC) {
            latC.innerText = lat.toFixed(4);
            lonC.innerText = lon.toFixed(4);
        }
        
        // Crear marcador del smart car
        if (mapa) {
            const posicion = [lat, lon];
            
            // Si el marcador no existe lo creamos, de lo contrario solo actualizamos su posición
            if (!carroMarker) {
                carroMarker = L.marker(posicion, {icon: greenIcon}).addTo(mapa).bindPopup("Smart Car");  // Crear marcador con icono (Leaflet o custom) y texto flotante de la posición del smart car
                mapa.panTo(posicion, {animate: true, duration: 0.5}); // Cambiar el centro del mapa a la posición del smart car, simulando un seguimiento
            } else {
                carroMarker.setLatLng(posicion); // Actualizar posición del marcador con la posición recibida
                mapa.panTo(posicion, {animate: true, duration: 0.5});
            }
        }
    }
});