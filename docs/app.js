let map, marker;

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
  const val = modeSelect.value;
  
  if (val == "1") { // Modo control manual
    interfaceSpace.innerHTML = `
    <div id="joystick-container">
      <div id="joystick-puck"></div>
    </div>
    <div class="stats">
      X: <span id="valX">0.00</span> | Y: <span id="valY">0.00</span>
    </div>
    <div class="controls">
      <button id="btnClaxon" class="btn-action">CLAXON</button>
    </div>`;
      send("proyecto/carrito/control/modo", "control");
      initJoystick(); 
  } else if (val == "2") { // Modo seguidor de línea
    interfaceSpace.innerHTML = `
    <div class="mode-card">
        <h3>Modo Seguidor de Línea</h3> <button id="btnSensor" type="button" class="btn-action">Activar</button>
    </div>`;
    send("proyecto/carrito/control/modo", "linea");
    sensor();
  } else if (val == "3") {
    interfaceSpace.innerHTML = `
        <div class="mode-card">
            <h3>Navegación GPS</h3>
            <div id="map" style="width: 100%; height: 400px; border-radius: 10px;"></div>
            <div class="stats">
              Lat: <span id="lat">---</span> | Lon: <span id="lon">---</span>
            </div>
        </div>`;
      send("proyecto/carrito/control/modo", "gps");
      initMap();
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
    window.addEventListener('touchmove', moveJoystick, { passive: false });
    window.addEventListener('mouseup', stopJoystick);
    window.addEventListener('touchend', stopJoystick);

    // Evento del botón claxon
    btnClaxon.addEventListener("click", () => send("proyecto/carrito/control/claxon", "1"));
}

function initMap() {
    // Inicializar el mapa centrado en una posición inicial (ej. tu ciudad)
    map = L.map('map').setView([19.249115150377094, -103.6975702080577], 15); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Crear el marcador del carrito
    marker = L.marker([19.249115150377094, -103.6975702080577]).addTo(map)
        .bindPopup('Mi Carrito')
        .openPopup();
}

client.on('message', (topic, message) => {
    if (topic === "proyecto/carrito/estado/ubicacion") {
        const data = message.toString().split(',');
        const lat = parseFloat(data[0]);
        const lon = parseFloat(data[1]);

        // Actualizar UI
        document.getElementById('lat').innerText = lat.toFixed(6);
        document.getElementById('lon').innerText = lon.toFixed(6);

        // Actualizar Mapa
        if (marker) {
            const newPos = [lat, lon];
            marker.setLatLng(newPos);
            map.panTo(newPos); // Seguir al carrito
        }
    }
});

function sensor(){
  const btnSensor = document.getElementById('btnSensor');

  btnSensor.addEventListener("click", () => {
  btnSensor.classList.toggle('btn-action');
  btnSensor.classList.toggle('btn-desactivado');

  btnSensor.textContent = 
    btnSensor.classList.contains('btn-action') 
      ? "Activar" 
      : "Desactivar";
  });

  send("proyecto/carrito/control/sensor", btnSensor.classList.contains('btn-action') ? "1" : "0");  
}