import mqttService from "./mqttService.js";
import {topics} from "./topics.js";

const manual = {
    // Referencias a elementos DOM
    container: null,
    puck: null,
    valX: null,
    valY: null,

    // Estado interno
    dragging: false,
    latestMsg: {x: 0, y: 0},
    sendInterval: null,
    AbortController: null,

    // Configuración ténica
    FRECUENCIA_MS: 50,
    DEADZONE: 0.10,

    // Método para inicializar los eventos window del objeto joystick
    iniciar() {
        // Si ya existía un controlador para el joystick, lo removemos
        if (this.abortController) {
            this.abortController.abort();
        }

        // Crear una nueva señal de control
        this.abortController = new AbortController();
        const {signal} = this.abortController;

        // Vincular elementos del DOM
        this.container = document.getElementById("joystick-container");
        this.puck = document.getElementById("joystick-puck");
        this.valX = document.getElementById("valX");
        this.valY = document.getElementById("valY");
        const btnClaxon = document.getElementById("btnClaxon");

        if (!this.puck || !this.container) return;

        // 4. Registrar eventos usando signal
        
        // Mouse
        this.puck.addEventListener("mousedown", (event) => this.iniciarJoystick(event), {signal});
        window.addEventListener("mousemove", (event) => this.moverJoystick(event), {signal});
        window.addEventListener("mouseup", () => this.detenerJoystick(), {signal});

        // Touch (con preventDefault para evitar scroll en móviles)
        this.puck.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this.iniciarJoystick(event);
        }, {signal, passive: false});

        window.addEventListener("touchmove", (event) => {
            if (this.dragging) event.preventDefault();
            this.moverJoystick(event);
        }, {signal, passive: false});

        window.addEventListener("touchend", () => this.detenerJoystick(), {signal});

        // Claxon
        if (btnClaxon) {
            btnClaxon.onclick = () => {
                mqttService.publicar(topics.accion.claxon, {estado: 1});
            };
        }
    },

    // Método activado al momento de tocar el joystick
    iniciarJoystick() {
        this.dragging = true;

        if (!this.sendInterval) {
            this.sendInterval = setInterval(() => {
                mqttService.publicar(topics.modo.manual, this.latestMsg);
            }, this.FRECUENCIA_MS);
        }
    },

    // Método para calcular la posición del joystick en x, y al detectar movimiento
    moverJoystick(evento) {
        if (!this.dragging) return;

        const rect = this.container.getBoundingClientRect();
        const radius = this.container.offsetWidth / 2;
        
        // Detectar posición según el tipo de entrada
        const clientX = evento.touches ? evento.touches[0].clientX : evento.clientX;
        const clientY = evento.touches ? evento.touches[0].clientY : evento.clientY;

        let dx = clientX - (rect.left + radius);
        let dy = clientY - (rect.top + radius);

        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si la distancia es mayor que el radio, evitamos que el joystick salga del área circular
        if (distance > radius) {
            dx *= radius / distance;
            dy *= radius / distance;
        }

        // Mover el Puck visualmente
        this.puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        
        // Normalización de los valores entre -1.00 a 1.00
        const rawX = dx / radius;
        const rawY = (dy / radius) * -1;

        // Aplicar zona muerta y formatear
        const x = Math.abs(rawX) < this.DEADZONE ? 0 : parseFloat(rawX.toFixed(2));
        const y = Math.abs(rawY) < this.DEADZONE ? 0 : parseFloat(rawY.toFixed(2));

        this.latestMsg = {x, y}; // La posición se enviará en el siguiente intervalo

        // Mostrar los valores x, y en stats
        if (this.valX) this.valX.innerText = x.toFixed(2);
        if (this.valY) this.valY.innerText = y.toFixed(2);
    },

    // Método activo al soltar el joystick
    detenerJoystick() {
        if (!this.dragging) return;
        this.dragging = false;

        if (this.sendInterval) {
            clearInterval(this.sendInterval);
            this.sendInterval = null;
        }

        // Reiniciar el joystick a su posición inicial y reiniciar los valores a 0.00
        this.puck.style.transform = `translate(-50%, -50%)`;
        this.latestMsg = { x: 0, y: 0 };
        
        if (this.valX) this.valX.innerText = "0.00";
        if (this.valY) this.valY.innerText = "0.00";

        // Enviar posición cero para detener
        mqttService.publicar(topics.modo.manual, {x: 0, y: 0});
    },

    /*
    NOTA: este método es necesario llamarlo cuando se cambia de modo en main.js,
    se encarga de eliminar los event listeners del objeto window y el joystick.
    Si no hacemos esto, los event listeners se duplicarán cuando volvamos a iniciar este modo,
    generando mensajes duplicados al tópico del modo manual
    */
    eliminar() {
        if (this.abortController) {
            this.abortController.abort(); // Elimina todos los listeners de window y puck
            this.abortController = null;
        }
        this.detenerJoystick(); // Reinicia intervalos y variables
    }
}

export default manual;