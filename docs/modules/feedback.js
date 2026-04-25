let notificationTimeout;

// Muestra una notificación visual (utilizada en el modo "Navegación GPS")
export function notificar(title, message) {
    const notification = document.getElementById("custom-notification");
    const notificationTitle = document.getElementById("notification-title");
    const notificationBody = document.getElementById("notification-body");

    if (notification && notificationTitle && notificationBody) {
        clearTimeout(notificationTimeout);

        notificationTitle.textContent = title;
        notificationBody.textContent = message;
        notification.classList.add("notification-visible");

        notificationTimeout = setTimeout(() => {
            notification.classList.remove("notification-visible");
        }, 3000);
    }
}

// Actualiza indicador visual con el estado de la comunicación MQTT (utilizada en el módulo mqttService.js)
export function actualizarEstado(message, status) {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    
    const estados = [
        "status-connecting",
        "status-online",
        "status-offline",
        "status-reconnecting",
        "status-error"
    ];

    if (dot && text) {
        if (dot.classList.contains(status)) {
            return;
        } 

        text.textContent = message;
        dot.classList.remove(...estados);
        dot.classList.add(status);
    }
}