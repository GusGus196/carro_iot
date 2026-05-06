import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";

const manual = {
    contenedor: null,
    container: null,
    puck: null,
    valX: null,
    valY: null,
    btnClaxon: null,
    btnDirIzq: null,
    btnPrev: null,
    btnDirDer: null,

    dragging: false,
    latestMsg: {x: 0, y: 0},
    sendInterval: null,
    estadoLuces: {izq: false, prev: false, der: false},
    abortController: null,

    FRECUENCIA_MS: 50,
    DEADZONE: 0.10,

    montar(contenedor) {
        if (this.abortController) {
            this.abortController.abort();
        }

        this.contenedor = contenedor;

        contenedor.innerHTML = `
            <div class="mode-wrapper mode-center gap-8">
                <div id="joystick-container" class="relative w-52 h-52 rounded-full border-4 border-base-300 shadow-inner shrink-0 bg-base-200/50">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-base-content/10 rounded-full pointer-events-none"></div>
                    <div id="joystick-puck" class="absolute w-16 h-16 rounded-full shadow-2xl top-1/2 left-1/2 cursor-grab" style="background: var(--color-success); transform: translate(-50%, -50%); touch-action: none; z-index: 10;"></div>
                </div>
                <div class="flex justify-center gap-8 text-xs font-mono opacity-70">
                    <p>X: <span id="valX" class="font-black text-success text-sm">0.00</span></p>
                    <p>Y: <span id="valY" class="font-black text-success text-sm">0.00</span></p>
                </div>
                <div class="flex flex-col items-center gap-3 w-full max-w-xs">
                    <div class="flex gap-3">
                        <button id="btnDirIzq" class="btn btn-outline btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button id="btnPrev" class="btn btn-outline btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 5.5L19.5 19h-15L12 7.5z"/></svg>
                        </button>
                        <button id="btnDirDer" class="btn btn-outline btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                    <button id="btnClaxon" class="btn btn-success w-2/3 mt-2 active:scale-98 transition-transform duration-100">Claxon</button>
                </div>
            </div>
        `;

        this.enlazar();
    },

    enlazar() {
        this.abortController = new AbortController();
        const {signal} = this.abortController;

        this.container = this.contenedor.querySelector("#joystick-container");
        this.puck = this.contenedor.querySelector("#joystick-puck");
        this.valX = this.contenedor.querySelector("#valX");
        this.valY = this.contenedor.querySelector("#valY");
        this.btnClaxon = this.contenedor.querySelector("#btnClaxon");
        this.btnDirIzq = this.contenedor.querySelector("#btnDirIzq");
        this.btnPrev = this.contenedor.querySelector("#btnPrev");
        this.btnDirDer = this.contenedor.querySelector("#btnDirDer");

        if (!this.puck || !this.container) return;

        this.puck.addEventListener("mousedown", () => this.iniciarJoystick(), {signal});
        window.addEventListener("mousemove", (event) => this.moverJoystick(event), {signal});
        window.addEventListener("mouseup", () => this.detenerJoystick(), {signal});
        window.addEventListener("blur", () => this.detenerJoystick(), {signal});

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

        this.btnClaxon?.addEventListener("click", () => {
            mqttService.publicar(topics.accion.claxon, {estado: 1});
        }, {signal});

        this.btnDirIzq?.addEventListener("click", () => this.controlarLuces("izq"), {signal});
        this.btnPrev?.addEventListener("click", () => this.controlarLuces("prev"), {signal});
        this.btnDirDer?.addEventListener("click", () => this.controlarLuces("der"), {signal});

        this.actualizarLuces();
    },

    iniciarJoystick() {
        this.dragging = true;

        if (!this.sendInterval) {
            this.sendInterval = setInterval(() => {
                mqttService.publicar(topics.modo.manual, this.latestMsg);
            }, this.FRECUENCIA_MS);
        }
    },

    moverJoystick(evento) {
        if (!this.dragging) return;

        const rect = this.container.getBoundingClientRect();
        const radius = this.container.offsetWidth / 2;

        const clientX = evento.touches ? evento.touches[0].clientX : evento.clientX;
        const clientY = evento.touches ? evento.touches[0].clientY : evento.clientY;

        let dx = clientX - (rect.left + radius);
        let dy = clientY - (rect.top + radius);

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > radius) {
            dx *= radius / distance;
            dy *= radius / distance;
        }

        this.puck.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        const rawX = dx / radius;
        const rawY = (dy / radius) * -1;

        const x = Math.abs(rawX) < this.DEADZONE ? 0 : parseFloat(rawX.toFixed(2));
        const y = Math.abs(rawY) < this.DEADZONE ? 0 : parseFloat(rawY.toFixed(2));

        this.latestMsg = {x, y};

        if (this.valX) this.valX.innerText = x.toFixed(2);
        if (this.valY) this.valY.innerText = y.toFixed(2);
    },

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

        mqttService.publicar(topics.modo.manual, {x: 0, y: 0});
    },

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

    actualizarLuces() {
        if(!this.btnDirIzq || !this.btnDirDer || !this.btnPrev) return;

        const activar = (btn, activo) => {
            btn.classList.toggle("btn-success", activo);
            btn.classList.toggle("btn-outline", !activo);
            btn.classList.toggle("animate-pulse", activo);
        };

        activar(this.btnDirIzq, this.estadoLuces.izq);
        activar(this.btnPrev, this.estadoLuces.prev);
        activar(this.btnDirDer, this.estadoLuces.der);
    },

    eliminar() {
        this.estadoLuces = {izq: false, prev: false, der: false};

        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        this.detenerJoystick();

        this.contenedor = null;
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