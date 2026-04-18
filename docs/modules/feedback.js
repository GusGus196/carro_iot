/*
    Función para mostrar una alerta temporal en la parte superior central.
    Utilizado en el módulo GPS para envío de destino y notificación de llegada
*/
export function mostrarAlerta(title, message) {
    const alert = document.getElementById("custom-alert"); // Contenedor
    const alertTitle = document.getElementById("alert-title"); // Título
    const alertBody = document.getElementById("alert-body"); // Cuerpo

    // La visibilidad y animación de la alerta se controla con la clase CSS "alert-visible"
    if (alert) {
        alertTitle.innerText = title;
        alertBody.innerText = message;

        alert.classList.add("alert-visible"); // Mostramos la alerta

        setTimeout(() => {
            alert.classList.remove("alert-visible"); // Ocultamos la alerta a los 2 segundos
        }, 2000);
    }
}

/* 
    Actualiza el indicador visual de conexión MQTT:
    - Mensaje: texto a mostrar en el contenedor (ej. "Conectado")
    - Clase: estlo de color para el círculo (ej. status-conectado)
*/
export function actualizarStatusMQTT(mensaje, clase) {
    const dot = document.getElementById("status-dot"); // Círculo de color
    const text = document.getElementById("status-text"); // Texto
    
    if(dot && text) {
        text.innerText = mensaje;
        dot.className = `status-dot ${clase}`; // Limpia clases anteriores y aplica la nueva
    }
}