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
    };
}