// Elementos del HTML
const modeSelect = document.getElementById('modeSelect');
const interfaceSpace = document.getElementById('interfaceSpace');

// Conexión MQTT
const clientId = 'web_joystick_' + Math.random().toString(16).substr(2, 8); // Genera un ID de cliente único para el navegador
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', { // Conecta al broker públcio HiveMQ utilizando WebSockets
    clientId: clientId,
    clean: true
});

client.on('connect', () => console.log("MQTT Conectado")); // Confirmación de la conexión

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
    interfaceSpace.innerHTML = `<div class="mode-card"><h3>Modo Seguidor de Línea</h3><p>Activado</p></div>`;
      send("proyecto/carrito/control/modo", "linea");
  } else if (val == "3") { // Modo GPS
    interfaceSpace.innerHTML = `<div class="mode-card"><h3>Modo GPS</h3><p>Esperando coordenadas...</p></div>`;
      send("proyecto/carrito/control/modo", "gps");
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

        console.log("Enviando:", `${normX},${normY}`); // Visualizar en consola los envíos
        send("proyecto/carrito/control/joystick",`${normX},${normY}`);
        valX.innerText = normX;
        valY.innerText = normY;
    };

    // Función para soltar el joystick
    const stopJoystick = () => {
        if (!dragging) return;
        dragging = false;

        // Centrar puck y reiniciar valores
        puck.style.transform = `translate(-50%, -50%)`;
        valX.innerText = "0.00";
        valY.innerText = "0.00";
        send("proyecto/carrito/control/joystick","0.00,0.00"); // Enviar posición 0
    };

    // Eventos del Joystick
    puck.addEventListener('mousedown', () => dragging = true); // Inicio del arrastre con mouse
    puck.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, {passive: false}); // Inicio del arrastre con touch
    window.addEventListener('mousemove', moveJoystick);
    window.addEventListener('touchmove', moveJoystick, { passive: false });
    window.addEventListener('mouseup', stopJoystick);
    window.addEventListener('touchend', stopJoystick);

    // Evento del botón claxon
    btnClaxon.addEventListener("click", () => send("proyecto/carrito/control/claxon", "1"));
}