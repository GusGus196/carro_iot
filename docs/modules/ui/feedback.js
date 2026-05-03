let notificationTimeout;

// Muestra una notificación flotante de 3 segundos (usada principalmente en navegación)
export function notificar(title, message) {
    const notification = document.getElementById("custom-notification");
    const notificationTitle = document.getElementById("notification-title");
    const notificationBody = document.getElementById("notification-body");

    if (notification && notificationTitle && notificationBody) {
        clearTimeout(notificationTimeout); // Evita que el tiempo de la notificación anterior oculte a la nueva antes de tiempo

        notificationTitle.textContent = title;
        notificationBody.textContent = message;
        notification.classList.add("notification-visible");

        notificationTimeout = setTimeout(() => {
            notification.classList.remove("notification-visible");
        }, 3000);
    }
}

// Actualiza el indicador visual y el texto de estado de la conexión MQTT
export function actualizarEstado(message, status) {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    
    // Mapeamos tus estados internos a clases de daisyUI
    const daisyClasses = {
        "status-connecting": "badge-info",
        "status-online": "badge-success",
        "status-offline": "badge-neutral",
        "status-reconnecting": "badge-warning",
        "status-error": "badge-error"
    };

    if (dot && text) {
        text.textContent = message;

        dot.classList.remove("badge-info", "badge-success", "badge-neutral", "badge-warning", "badge-error", "animate-pulse");

        const nuevaClase = daisyClasses[status] || "badge-neutral";
        dot.classList.add(nuevaClase);

        if (status === "status-connecting" || status === "status-reconnecting") {
            dot.classList.add("animate-pulse");
        }
    }
}