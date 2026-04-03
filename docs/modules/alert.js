export function showAlert(title, message) {
    const alert = document.getElementById('custom-alert');
    const alertTitle = document.getElementById('alert-title');
    const alertText = document.getElementById('alert-text');

    if (alert) {
        alertTitle.innerText = title;
        alertText.innerText = message;

        alert.classList.add('alert-visible'); // Mostramos la alerta

        setTimeout(() => {
            alert.classList.remove('alert-visible'); // Ocultamos la alerta a los 2 segundos
        }, 2000);
    };
};