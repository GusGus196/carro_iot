let notificationTimeout;

// Muestra una notificación flotante de 3 segundos (usada principalmente en GPS)
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

        // Remover clases de estado previas antes de agregar la nueva
        dot.classList.remove(...estados);
        dot.classList.add(status);
    }
}