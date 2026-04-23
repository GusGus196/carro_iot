import { enviar } from "./mqtt.js";
import { TOPICS } from "./topics.js";

let btnIzq, btnDer, btnPrev;
let estadoLuces = { 
    izq: false,
    der: false,
    prev: false 
};

// Direccional izquierda
const dirIzq = () => {
    estadoLuces.izq = !estadoLuces.izq;
    if (estadoLuces.izq) {
        estadoLuces.der = false;
        estadoLuces.prev = false; 
    }
    
    actualizarInterfaz();
    const valor = estadoLuces.izq ? "izq" : "off";
    enviar(TOPICS.luces, JSON.stringify({luces: valor}));
};

// Direccional derecha
const dirDer = () => {
    estadoLuces.der = !estadoLuces.der;
    if (estadoLuces.der) {
        estadoLuces.izq = false;
        estadoLuces.prev = false;
    }
    
    actualizarInterfaz();
    const valor = estadoLuces.der ? "der" : "off";
    enviar(TOPICS.luces, JSON.stringify({luces: valor}));
};

// Preventivas
const prev = () => {
    estadoLuces.prev = !estadoLuces.prev;
    if (estadoLuces.prev) {
        estadoLuces.izq = false;
        estadoLuces.der = false;
    }
    
    actualizarInterfaz();
    const valor = estadoLuces.prev ? "prev" : "off";
    enviar(TOPICS.luces, JSON.stringify({luces: valor}));
};

export function iniciarLuces() {
    btnIzq = document.getElementById("btnDirIzq");
    btnDer = document.getElementById("btnDirDer");
    btnPrev = document.getElementById("btnPrev");

    // Reiniciar objeto de estado al iniciar
    estadoLuces = { 
        izq: false,
        der: false,
        prev: false 
    };

    // Remover y asignar listeners para evitar duplicados
    btnIzq.removeEventListener("click", dirIzq);
    btnDer.removeEventListener("click", dirDer);
    btnPrev.removeEventListener("click", prev);

    btnIzq.addEventListener("click", dirIzq);
    btnDer.addEventListener("click", dirDer);
    btnPrev.addEventListener("click", prev);
    
    actualizarInterfaz(); // Función para que inicien en "state-off"
}

function actualizarInterfaz() {
    if (!btnIzq || !btnDer || !btnPrev) return;

    btnIzq.classList.toggle("btn-state-on", estadoLuces.izq);
    btnIzq.classList.toggle("btn-state-off", !estadoLuces.izq);

    btnDer.classList.toggle("btn-state-on", estadoLuces.der);
    btnDer.classList.toggle("btn-state-off", !estadoLuces.der);

    btnPrev.classList.toggle("btn-state-on", estadoLuces.prev);
    btnPrev.classList.toggle("btn-state-off", !estadoLuces.prev);
}