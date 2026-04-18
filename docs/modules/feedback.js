/*
Función para mostrar una alerta temporal en la parte superior central.
Utilizado en el módulo GPS para envío de destino y notificación de llegada
*/

let alertTimeout;

export function mostrarAlerta(title, message) {
    const alert = document.getElementById("custom-alert"); // Contenedor
    const alertTitle = document.getElementById("alert-title"); // Título
    const alertBody = document.getElementById("alert-body"); // Cuerpo

    // La visibilidad y animación de la alerta se controla con la clase CSS "alert-visible"
    if (alert) {
        // Cancela el temporizador anterior para reiniciar el tiempo de la alerta en caso de oprimir más de una vez
        clearTimeout(alertTimeout);

        alertTitle.innerText = title;
        alertBody.innerText = message;
        alert.classList.add("alert-visible"); // Mostramos la alerta

        alertTimeout = setTimeout(() => {
            alert.classList.remove("alert-visible"); // Ocultamos la alerta a los 3 segundos
        }, 3000);
    }
}

/*
Actualiza el indicador visual de conexión MQTT:
    - Mensaje: texto a mostrar (ej. "CONECTADO")
    - Clase: color del indicador (ej. status-online)
*/
export function actualizarStatusMQTT(mensaje, clase) {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    const estados = [
        "status-start",
        "status-online",
        "status-offline",
        "status-connecting",
        "status-reconnecting",
        "status-error"
    ];

    if(dot && text) {
        text.innerText = mensaje;
        // Solo cambia la clase dinámica, manteniendo la base 'status-dot'
        dot.classList.remove(...estados);
        dot.classList.add(clase);
    }
}