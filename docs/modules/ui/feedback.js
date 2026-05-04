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

// Función para actualizar el indicador visual y texto del estado de la conexión MQTT
export function actualizarEstado(message, status) {
    const contenedor = document.getElementById("mqtt-status");
    const indicador = document.getElementById("status-dot");
    const texto = document.getElementById("status-text");

    if (!contenedor || !indicador || !texto) return;

    const indicadorClases = {
        connecting: "bg-info",
        connected: "bg-success",
        reconnecting: "bg-primary",
        disconnected: "bg-neutral",
        error: "bg-error"
    };

    texto.textContent = message;

    indicador.classList.remove("bg-info", "bg-success", "bg-primary", "bg-neutral", "bg-error");
    indicador.classList.add(indicadorClases[status] || "bg-neutral");

    if (status === "connecting" || status === "reconnecting") {
        indicador.classList.add("animate-pulse");
    } else {
        indicador.classList.remove("animate-pulse");
    }
}