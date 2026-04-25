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

export function estadoMQTT(mensaje, clase) {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    
    const estados = ["status-start", "status-online", "status-offline", "status-reconnecting", "status-error"];

    if (dot && text) {
        if (dot.classList.contains(clase)) return;

        text.textContent = mensaje;
        dot.classList.remove(...estados);
        dot.classList.add(clase);
    }
}