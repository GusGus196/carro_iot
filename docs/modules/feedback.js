/*
    Función para mostrar una alerta temporal en la parte superior central.
    Utilizado en el módulo GPS para envío de destino y notificación de llegada.
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
    Actualiza el indicador visual del estado de conexión MQTT en la parte superior derecha del HTML.
    Modifica el texto descriptivo y el color del círculo de estado.
*/
export function actualizarStatusMQTT(mensaje, clase) {
    const dot = document.getElementById("status-dot"); // Círculo de estado
    const text = document.getElementById("status-text"); // Texto
    
    if(dot && text) {
        // Actualizamos el texto y agregamos la clase por defecto "status-dot" y la clase dinámica
        text.innerText = mensaje;

        dot.className = `status-dot ${clase}`; // Reescribimos las clases para evitar duplicados
    }
}