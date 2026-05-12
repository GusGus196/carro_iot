const THEME_KEY = "control-web-theme";

export function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const html = document.documentElement;
    const controller = document.querySelector(".theme-controller");

    if (savedTheme) {
        html.setAttribute("data-theme", savedTheme);

        if (controller) {
            controller.checked = savedTheme === "light";
        }
    }

    if (controller) {
        controller.addEventListener("change", (event) => {
            const theme = event.target.checked ? "light" : "dark";
            html.setAttribute("data-theme", theme);
            localStorage.setItem(THEME_KEY, theme);
        });
    }
}