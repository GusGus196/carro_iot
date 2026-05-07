// Función para actualizar el indicador visual y texto del estado de la conexión MQTT
export function actualizar(message, status) {
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