const modeSelect = document.getElementById('modeSelect'); // Select del modo
const interfaceSpace = document.getElementById('interfaceSpace'); // Interfaz del modo (contenedor)
let mapa, destino, destinoMarker, carroMarker; // Variables para GPS

const TOPICS = {
    modo: "smartcar/control/modo",
    joystick: "smartcar/control/joystick",
    claxon: "smartcar/control/claxon",
    sensor: "smartcar/control/sensor",
    destino: "smartcar/control/destino",
    ubicacion: "smartcar/estado/ubicacion",
    llegada: "smartcar/estado/llegada"
};

// Conexión MQTT
const clientId = 'smartcar-webcontroller-' + Math.random().toString(16).substr(2, 8); // Genera un ID de cliente
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', { // Conecta al broker público HiveMQ utilizando WebSockets
    clientId: clientId,
    clean: true
});

client.on('connect', () => {
    console.log("MQTT Conectado");
    client.subscribe(TOPICS.ubicacion);
});

// Función para enviar mensajes al broker
function send(topic, message) {
    if (client.connected) {
        client.publish(topic, message); // Publica mensaje en el topic dado
    }
}

/* 
    Cambio de modo
    value = 1 modo control manual
    value = 2 modo seguidor de líneas
    value = 3 modo navegación GPS
*/
modeSelect.addEventListener('change', () => {
    const value = modeSelect.value;
    if (value == "1") {
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
    } else if (value == "2") {
        interfaceSpace.innerHTML = `
            <div class="mode-card">
                <button id="btnSensor" type="button" class="btn-action">Activar modo</button>
            </div>
        `;
    
        send(TOPICS.modo, "linea");
        initSeguidor();
    } else if (value == "3") {
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
            initMapa(); // Esperar 100ms a que renderice el contenedor para crear el mapa
        }, 100);
    }
});

/* Control manual 🗿 */

// Inicializar el joystick cuando modoSelect value = 1
function initJoystick() {
    const container = document.getElementById('joystick-container'); 
    const puck = document.getElementById('joystick-puck'); 
    const valX = document.getElementById('valX'); 
    const valY = document.getElementById('valY'); 
    
    const btnClaxon = document.getElementById("btnClaxon"); 
    const radius = container.offsetWidth / 2; 
    const FRECUENCIA_MS = 50;

    let dragging = false; // Controla si el joystick está en movimiento
    let latestMsg = "0.00,0.00"; // Últimos valores enviados
    let sendInterval = null; // Intervalo de envío de datos
    
    // Función para mover el joystick
    const moveJoystick = (e) => {
        if (!dragging) return;
    
        e.preventDefault();
    
        const rect = container.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const centerX = rect.left + radius;
        const centerY = rect.top + radius;
    
        let dx = clientX - centerX;
        let dy = clientY - centerY;
    
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance > radius) {
            dx *= radius / distance;
            dy *= radius / distance;
        }
    
        puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        const normX = (dx / radius).toFixed(2);
        const normY = ((dy / radius) * -1).toFixed(2);
        latestMsg = `${normX},${normY}`;
        valX.innerText = normX;
        valY.innerText = normY;
    };
    
    // Función para iniciar el drag
    const startJoystick = () => {
        dragging = true;

        if (!sendInterval) {
            sendInterval = setInterval(() => {
                send(TOPICS.joystick, latestMsg);
            }, FRECUENCIA_MS);
        }
    };

    // Función para detener el drag y regresar el control a 0,0
    const stopJoystick = () => {
        dragging = false;

        if (sendInterval) {
            clearInterval(sendInterval);
            sendInterval = null;
        }

        puck.style.transform = `translate(-50%, -50%)`;
        valX.innerText = "0.00";
        valY.innerText = "0.00";
        send(TOPICS.joystick, "0.00,0.00"); // Enviamos la posición 0.00,0.00
    };

    // Remover listeners previos para evitar duplicados
    window.removeEventListener('mousemove', moveJoystick);
    window.removeEventListener('touchmove', moveJoystick);
    window.removeEventListener('mouseup', stopJoystick);
    window.removeEventListener('touchend', stopJoystick);
    
    // Agregar listeners
    puck.addEventListener('mousedown', startJoystick);
    puck.addEventListener('touchstart', (e) => { 
        e.preventDefault();
        startJoystick();
    }, {passive: false});

    window.addEventListener('mousemove', moveJoystick);
    window.addEventListener('touchmove', moveJoystick, {passive: false});
    window.addEventListener('mouseup', stopJoystick);
    window.addEventListener('touchend', stopJoystick);
    
    // Evento del botón claxon
    btnClaxon.addEventListener("click", () => {
        send(TOPICS.claxon, "1");
    });
}

/* Seguidor de líneas 🗿 */

// Inicializar cuando modoSelect value = 2 y el botón contiene la clase 'btn-action'
function initSeguidor() {
    const btnSensor = document.getElementById('btnSensor');
    
    btnSensor.addEventListener("click", () => {
        btnSensor.classList.toggle('btn-action');
        btnSensor.classList.toggle('btn-desactivado');
        btnSensor.textContent = btnSensor.classList.contains('btn-action') ? "Activar modo" : "Desactivar modo";
        
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
    if (mapa) { // Si mapa ya fue inicializado y ocurrio un cambio de modo (select), creamos uno nuevo y borramos las direcciones lat, long anteriores
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
        document.getElementById('lonD').innerText = evento.latlng.lng.toFixed(4); // longitud del destino
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