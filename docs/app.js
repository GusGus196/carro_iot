    let mapa, destino, destinoMarker, carroMarker; // Variables para GPS

    const modeSelect = document.getElementById('modeSelect');
    const interfaceSpace = document.getElementById('interfaceSpace');

    // Conexión MQTT
    const clientId = 'web_joystick_' + Math.random().toString(16).substr(2, 8); // Genera un ID de cliente único para el navegador
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', { // Conecta al broker públcio HiveMQ utilizando WebSockets
        clientId: clientId,
        clean: true
    });

    client.on('connect', () => {
        console.log("MQTT Conectado");
        client.subscribe("proyecto/carrito/estado/ubicacion");
    });

    // Función para enviar mensajes al broker
    function send(topic, message) {
    if (client.connected) {
        client.publish(topic, message); // Publica mensaje en el topic especificado
    }
    }

    // Cambio de modo
    modeSelect.addEventListener('change', () => {
    const value = modeSelect.value;
    
    if (value == "1") { // Modo control manual
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
        send("proyecto/carrito/control/modo", "control");
        initJoystick();
    } else if (value == "2") { // Modo seguidor de línea
        interfaceSpace.innerHTML = `
            <div class="mode-card">
                <button id="btnSensor" type="button" class="btn-action">Activar modo</button>
            </div>
        `;
        send("proyecto/carrito/control/modo", "linea");
        sensor();
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
        send("proyecto/carrito/control/modo", "gps");
        setTimeout(() => {
            initMap();
        }, 100);
    }
    });

    // Función para inicializar joystick
    function initJoystick() {
        const container = document.getElementById('joystick-container');
        const puck = document.getElementById('joystick-puck');
        const valX = document.getElementById('valX'); // Valor X mostrado en pantalla
        const valY = document.getElementById('valY'); // Valor Y mostrado en pantalla
        const btnClaxon = document.getElementById("btnClaxon"); // Botón claxon

        let dragging = false; // Indica si el joystick está siendo arrastrado
        const radius = container.offsetWidth / 2; // Radio máximo de movimiento del puck

        let latestMsg = "0.00,0.00"; 
        let sendInterval = null;
        const FRECUENCIA_MS = 50;

        // Función para mover el joystick
        const moveJoystick = (e) => {
            if (!dragging) return;
            
            e.preventDefault(); // Evita scroll o gestos del navegador

            // Coordenadas del contenedor
            const rect = container.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const centerX = rect.left + radius;
            const centerY = rect.top + radius;

            // Calcular desplazamiento del puck
            let dx = clientX - centerX;
            let dy = clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Limitar al radio del contenedor
            if (distance > radius) {
                dx *= radius / distance;
                dy *= radius / distance;
            }

            // Mover visualmente el puck
            puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

            // Valores normalizados de movimiento de -1 a 1 en x, y
            const normX = (dx / radius).toFixed(2);
            const normY = ((dy / radius) * -1).toFixed(2); // Invertido Y para que arriba se positivo arriba

            latestMsg = `${normX},${normY}`;
            valX.innerText = normX;
            valY.innerText = normY;
        };

        // Función para soltar el joystick
        const stopJoystick = () => {
            if (!dragging) return;
            dragging = false;

            clearInterval(sendInterval);
            sendInterval = null;

            // Centrar puck y reiniciar valores
            puck.style.transform = `translate(-50%, -50%)`;
            valX.innerText = "0.00";
            valY.innerText = "0.00";

            send("proyecto/carrito/control/joystick","0.00,0.00"); // Enviar posición 0
        };

        // Eventos del Joystick
        puck.addEventListener('mousedown', () => {
            dragging = true;
            
            // Inicia el envío constante a 20Hz
            if(!sendInterval) {
                sendInterval = setInterval(() => {
                    send("proyecto/carrito/control/joystick", latestMsg);
                }, FRECUENCIA_MS);
            }
        });

        puck.addEventListener('touchstart', (e) => { 
            dragging = true; 
            e.preventDefault(); 
            if(!sendInterval) {
                sendInterval = setInterval(() => {
                    send("proyecto/carrito/control/joystick", latestMsg);
                }, FRECUENCIA_MS);
            }
        }, {passive: false});
        

        window.addEventListener('mousemove', moveJoystick);
        window.addEventListener('touchmove', moveJoystick, {passive: false});
        window.addEventListener('mouseup', stopJoystick);
        window.addEventListener('touchend', stopJoystick);

        // Evento del botón claxon
        btnClaxon.addEventListener("click", () => send("proyecto/carrito/control/claxon", "1"));
    }

    function sensor() {
        const btnSensor = document.getElementById('btnSensor');

        btnSensor.addEventListener("click", () => {
            btnSensor.classList.toggle('btn-action');
            btnSensor.classList.toggle('btn-desactivado');

            btnSensor.textContent = btnSensor.classList.contains('btn-action') ? "Activar modo" : "Desactivar modo";
            send("proyecto/carrito/control/sensor", btnSensor.classList.contains('btn-action') ? "1" : "0");
        });
    }

    // Clase para crear iconos de Leaflet o personalizados
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

    let redIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png'});
    let greenIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png'});

    function initMap() {
        if (mapa) { // Si mapa ya fue inicializado y ocurrio un cambio de modo (select), creamos uno nuevo
            mapa.remove();
            destinoMarker = null;
            carroMarker = null;
        }

        mapa = L.map('mapa').setView([19.248302, -103.700119], 5); // Vista inicial México [lat, long], zoom

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { // Imágenes del mapa utilizando openstreetmap
            attribution: '&copy; OpenStreetMap'
        }).addTo(mapa);

        setTimeout(() => {
            mapa.invalidateSize();
            mapa.flyTo([19.248302, -103.700119], 16); // Efecto de zoom hacia la nueva dirección
        }, 1000);

        // Evento click en el mapa
        mapa.on('click', function(evento) {
            destino = evento.latlng;

            if (!destinoMarker) {
                destinoMarker = L.marker(evento.latlng, {icon: redIcon}).addTo(mapa).bindPopup("Destino"); // Crear marcador del destino seleccionado
            } else {
                destinoMarker.setLatLng(evento.latlng);
            }

            document.getElementById('latD').innerText = evento.latlng.lat.toFixed(6); // Latitud del destino con 6 decimales
            document.getElementById('lonD').innerText = evento.latlng.lng.toFixed(6); // longitud del destino con 6 decimales
        });

        // Botón de confirmación para enviar destino por MQTT
        document.getElementById('btnConfirmar').addEventListener('click', () => {
            if (destino) {
                const msg = `${destino.lat.toFixed(6)},${destino.lng.toFixed(6)}`; // latitud,longitud del destino
                send("proyecto/carrito/control/destino", msg);
                alert("Destino enviado!");
            } else {
                alert("Selecciona un punto de destino en el mapa.");
            }
        });
    }

    client.on('message', (topic, message) => {
        if (topic === "proyecto/carrito/estado/ubicacion") {
            const data = message.toString().split(',');
            const lat = parseFloat(data[0]);
            const lon = parseFloat(data[1]);

            // Solo actualizamos la ubicación si estamos en el modo GPS
            const latC = document.getElementById('latC');
            const lonC = document.getElementById('lonC');
            
            if (latC && lonC) {
                latC.innerText = lat.toFixed(6);
                lonC.innerText = lon.toFixed(6);
            }

            // Movimiento de la camara a la posición del carro
            if (mapa) {
                const posicion = [lat, lon];

                if (!carroMarker) {
                    carroMarker = L.marker(posicion, {icon: greenIcon}).addTo(mapa).bindPopup("Smart Car");
                    mapa.panTo(posicion);
                } else {
                    carroMarker.setLatLng(posicion);
                    mapa.panTo(posicion);
                }
            }
    }
});
