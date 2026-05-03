import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";

const manual = {
    // Referencias a elementos del DOM del joystick
    container: null,
    puck: null,
    valX: null,
    valY: null,

    // Referencias a elementos del DOM de los botones
    btnClaxon: null,
    btnDirIzq: null,
    btnPrev: null,
    btnDirDer: null,

    // Estado interno y flujo de datos
    dragging: false,
    latestMsg: {x: 0, y: 0},
    sendInterval: null,
    estadoLuces: {izq: false, prev: false, der: false},
    abortController: null, // Control de limpieza masiva de eventos

    // Configuración técnica
    FRECUENCIA_MS: 50, // Intervalo de envío de datos (uno cada 50 ms)
    DEADZONE: 0.10, // Radio de la zona muerta del joystick

    // Inicializa el control manual y vincula todos los eventos
    iniciar() {
        // Si existía un controlador previo, lo abortamos para evitar fugas de memoria
        if (this.abortController) {
            this.abortController.abort();
        }

        // Señal para eliminar automáticamente todos los listeners al cambiar de modo
        this.abortController = new AbortController();
        const {signal} = this.abortController;

        this.container = document.getElementById("joystick-container");
        this.puck = document.getElementById("joystick-puck");
        this.valX = document.getElementById("valX");
        this.valY = document.getElementById("valY");
        this.btnClaxon = document.getElementById("btnClaxon");
        this.btnDirIzq = document.getElementById("btnDirIzq");
        this.btnPrev = document.getElementById("btnPrev");
        this.btnDirDer = document.getElementById("btnDirDer");

        if (!this.puck || !this.container) return;

        // Eventos de interacción en window (mouse y touch)

        this.puck.addEventListener("mousedown", () => this.iniciarJoystick(), {signal});
        window.addEventListener("mousemove", (event) => this.moverJoystick(event), {signal});
        window.addEventListener("mouseup", () => this.detenerJoystick(), {signal});

        // Touch: preventDefault evita el scroll de la pantalla
        this.puck.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this.iniciarJoystick();
        }, {signal, passive: false});

        window.addEventListener("touchmove", (event) => {
            if (this.dragging) event.preventDefault();
            this.moverJoystick(event);
        }, {signal, passive: false});

        window.addEventListener("touchend", () => this.detenerJoystick(), {signal});
        window.addEventListener("touchcancel", () => this.detenerJoystick(), {signal});

        // Listeners de botones

        if (this.btnClaxon) {
            this.btnClaxon.onclick = () => {
                mqttService.publicar(topics.accion.claxon, {estado: 1});
            };
        }

        if(this.btnDirIzq) this.btnDirIzq.onclick = () => this.controlarLuces("izq");
        if(this.btnPrev) this.btnPrev.onclick = () => this.controlarLuces("prev");
        if(this.btnDirDer) this.btnDirDer.onclick = () => this.controlarLuces("der");

        this.actualizarLuces();
    },

    // Activa el seguimiento del joystick e inicia el bucle de envío MQTT
    iniciarJoystick() {
        this.dragging = true;

        if (!this.sendInterval) {
            // Enviamos el último mensaje a una tasa constante (20 Hz) para no saturar el broker
            this.sendInterval = setInterval(() => {
                mqttService.publicar(topics.modo.manual, this.latestMsg);
            }, this.FRECUENCIA_MS);
        }
    },

    // Calcula coordenadas, limita el movimiento al círculo y normaliza valores (-1 a 1)
    moverJoystick(evento) {
        if (!this.dragging) return;

        const rect = this.container.getBoundingClientRect();
        const radius = this.container.offsetWidth / 2;
        
        const clientX = evento.touches ? evento.touches[0].clientX : evento.clientX;
        const clientY = evento.touches ? evento.touches[0].clientY : evento.clientY;

        let dx = clientX - (rect.left + radius);
        let dy = clientY - (rect.top + radius);

        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Restricción física del "puck" dentro del contenedor circular
        if (distance > radius) {
            dx *= radius / distance;
            dy *= radius / distance;
        }

        this.puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        
        // Normalización y aplicación de zona muerta
        const rawX = dx / radius;
        const rawY = (dy / radius) * -1; // Invertimos Y para que arriba sea positivo y abajo negativo

        const x = Math.abs(rawX) < this.DEADZONE ? 0 : parseFloat(rawX.toFixed(2));
        const y = Math.abs(rawY) < this.DEADZONE ? 0 : parseFloat(rawY.toFixed(2));

        this.latestMsg = {x, y};

        if (this.valX) this.valX.innerText = x.toFixed(2);
        if (this.valY) this.valY.innerText = y.toFixed(2);
    },

    // Detiene el envío de datos y restablece la posición del joystick
    detenerJoystick() {
        if (!this.dragging) return;
        this.dragging = false;

        if (this.sendInterval) {
            clearInterval(this.sendInterval);
            this.sendInterval = null;
        }

        this.puck.style.transform = `translate(-50%, -50%)`;
        this.latestMsg = {x: 0, y: 0};
        
        if (this.valX) this.valX.innerText = "0.00";
        if (this.valY) this.valY.innerText = "0.00";

        // Enviar mensaje de detención
        mqttService.publicar(topics.modo.manual, {x: 0, y: 0});
    },

    // Gestiona la lógica de exclusión mutua de las luces (solo una activa a la vez)
    controlarLuces(tipo) {
        if(this.estadoLuces[tipo]) {
            this.estadoLuces[tipo] = false;
        } else {
            this.estadoLuces = {izq: false, prev: false, der: false};
            this.estadoLuces[tipo] = true;
        }
    
        this.actualizarLuces();

        const estado = this.estadoLuces[tipo] ? tipo : "off";
        mqttService.publicar(topics.accion.luces, {luces: estado});
    },

    // Refleja el estado de las luces en las clases CSS de los botones
    actualizarLuces() {
        if(!this.btnDirIzq || !this.btnDirDer || !this.btnPrev) return;

        this.btnDirIzq.classList.toggle("btn-state-on", this.estadoLuces.izq);
        this.btnDirIzq.classList.toggle("btn-state-off", !this.estadoLuces.izq);
        
        this.btnPrev.classList.toggle("btn-state-on", this.estadoLuces.prev);
        this.btnPrev.classList.toggle("btn-state-off", !this.estadoLuces.prev);
        
        this.btnDirDer.classList.toggle("btn-state-on", this.estadoLuces.der);
        this.btnDirDer.classList.toggle("btn-state-off", !this.estadoLuces.der);
    },

    // Limpieza total de recursos y listeners para evitar listeners duplicados al cambiar de modo
    eliminar() {
        this.estadoLuces = {izq: false, prev: false, der: false};
        
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        this.detenerJoystick();

        // Liberación de referencias al DOM para el recolector de basura
        this.container = null;
        this.puck = null;
        this.valX = null;
        this.valY = null;
        this.btnClaxon = null;
        this.btnDirIzq = null;
        this.btnPrev = null;
        this.btnDirDer = null;
    }
}

export default manual;