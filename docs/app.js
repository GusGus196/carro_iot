
const clientId = 'web_joystick_' + Math.random().toString(16).substr(2, 8);
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
    clientId: clientId,
    clean: true
});

client.on('connect', () => console.log("MQTT Conectado"));

function send(topic, message) {
  if (client.connected) {
    client.publish(topic, message);
  }
}

// Interfaz
const modeSelect = document.getElementById('modeSelect');
const interfaceSpace = document.getElementById('interfaceSpace');

modeSelect.addEventListener('change', () => {
  const val = modeSelect.value;
  
  if (val == "1") {
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
  } else if (val == "2") {
    interfaceSpace.innerHTML = `<div class="mode-card"><h3>Modo Seguidor de Línea</h3><p>Activado</p></div>`;
      send("proyecto/carrito/control/modo", "linea");
  } else if (val == "3") {
    interfaceSpace.innerHTML = `<div class="mode-card"><h3>Modo GPS</h3><p>Esperando coordenadas...</p></div>`;
      send("proyecto/carrito/control/modo", "gps");
  }
});

// JOYSTICK
function initJoystick() {
    const container = document.getElementById('joystick-container');
    const puck = document.getElementById('joystick-puck');
    const valX = document.getElementById('valX');
    const valY = document.getElementById('valY');
    const btnClaxon = document.getElementById("btnClaxon");

    let dragging = false;
    const radius = container.offsetWidth / 2;

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

        send("proyecto/carrito/control/joystick", `${normX},${normY}`);
        valX.innerText = normX;
        valY.innerText = normY;
    };

    const stopJoystick = () => {
        if (!dragging) return;
        dragging = false;
        puck.style.transform = `translate(-50%, -50%)`;
        valX.innerText = "0.00";
        valY.innerText = "0.00";
        send("proyecto/carrito/control/joystick", "0.00,0.00");
    };

    // Eventos del Joystick
    puck.addEventListener('mousedown', () => dragging = true);
    puck.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, {passive: false});
    window.addEventListener('mousemove', moveJoystick);
    window.addEventListener('touchmove', moveJoystick, { passive: false });
    window.addEventListener('mouseup', stopJoystick);
    window.addEventListener('touchend', stopJoystick);

    // Evento del Claxon
    btnClaxon.addEventListener("click", () => send("proyecto/carrito/control/claxon", "1"));
}