import {TOPICS} from "./topics.js";
import {enviar} from "./mqtt.js";
import {mostrarAlerta} from "./alert.js";

let mapa, destino, carroMarcador, destinoMarcador;

// Ícono para el Smart Car
const carroIcono = L.icon({
    iconUrl: "modules/assets/car-front.svg",
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    popupAnchor: [0, -18]
});

// Ícono para el destino
const destinoIcono = L.icon({
    iconUrl: "modules/assets/geo-fill.svg",
    iconSize: [32, 32], // Tamaño del ícono
    iconAnchor: [16, 32], // Centrar punta inferior
    popupAnchor: [0, -32], // Mensaje emergente sobre el ícono
    
    // Sombra
    shadowUrl: "modules/assets/marker-shadow.png",
    shadowSize: [35, 35],
    shadowAnchor: [10, 35]
});

// Función para enviar el destino por MQTT al presionar el botón "btnEnviar"
const enviarDestino = () => {
    if (destino) {
        const msg = `${destino.lat.toFixed(6)},${destino.lng.toFixed(6)}`; // Mensaje "lat, lon" del destino
        enviar(TOPICS.destino, msg); // Enviamos el mensaje
        mostrarAlerta("NAVEGACIÓN GPS", "Destino enviado correctamente."); // Mostramos una alerta personalizada
    } else {
        mostrarAlerta("NAVEGACIÓN GPS", "Selecciona un destino antes de enviar.");
    }
}

// Función para crear el mapa
export function iniciarMapa() {
    // Definimos los límites de nuestro mapa local
    const inferiorIzquierda = L.latLng(19.244693, -103.705745);
    const superiorDerecha = L.latLng(19.251293, -103.695145);
    const limites = L.latLngBounds(inferiorIzquierda, superiorDerecha); // Rectángulo formado

    /* 
        Si el mapa ya fue inicializado y ocurrió un cambio de modo,
        creamos uno nuevo y borramos los marcadores anteriores. De lo contrario, se crearán duplicados.
    */
    if (mapa) {
        mapa.remove();
        destinoMarcador = null;
        carroMarcador = null;
    }

    // Configuramos el mapa para que no se pueda salir de los límites
    mapa = L.map("mapa", {
        center: [19.248, -103.700],
        zoom: 15,
        maxBounds: limites, // Bloquea el desplazamiento fuera de la zona
        maxBoundsViscosity: 1.0 // Evita que el usuario "empuje" el mapa al vacío
    });

    // Definimos la capa de imágenes y aplicamos los límites
    L.tileLayer("mapa/{z}/{x}/{y}.png", {
        minZoom: 15,
        maxZoom: 19,
        bounds: limites, // Además, evita que Leaflet solicite tiles fuera de rango
        attribution: "&copy; OpenStreetMap contributors (offline)",
        noWrap: true // Evita que el mapa se repita infinitamente
    }).addTo(mapa);

    // Animación flyTo desde el punto inicial (zoom 15) hasta un punto con zoom 19
    setTimeout(() => {
        mapa.invalidateSize();
        mapa.flyTo([19.2491, -103.6974], 19, {
            animate: true,
            duration: 2,
            easeLinearity: 0.25
        });
    }, 1000);
    
    // Evento de clic sobre el mapa
    mapa.on("click", function(evento) {
        destino = evento.latlng;

        // Crear marcador con ícono y texto flotante del destino seleccionado
        if (!destinoMarcador) {
            destinoMarcador = L.marker(evento.latlng, {icon: destinoIcono})
                .addTo(mapa)
                .bindPopup("Destino");
        } else {
            destinoMarcador.setLatLng(evento.latlng);
        }

        document.getElementById("latD").innerText = evento.latlng.lat.toFixed(4); // Latitud del destino
        document.getElementById("lonD").innerText = evento.latlng.lng.toFixed(4); // Longitud del destino

        // Nota: mostramos 4 decimales para optimizar el espacio, aunque se deben enviar 6 para mejorar la precisión
    });
    
    // Evento del botón "btnEnviar" para enviar el destino
    const btnEnviar = document.getElementById("btnEnviar");
    btnEnviar.removeEventListener("click", enviarDestino); 
    btnEnviar.addEventListener("click", enviarDestino);
};

export function actualizarPosicion(lat, lon) {
    // Solo actualizamos la ubicación del Smart Car si estamos en el modo navegación GPS
    const latC = document.getElementById("latC");
    const lonC = document.getElementById("lonC");
    
    if (latC && lonC) {
        latC.innerText = lat.toFixed(4);
        lonC.innerText = lon.toFixed(4);
    }
    
    if (mapa) {
        const posicion = [lat, lon];
        
        // Si el marcador no existe, lo creamos; de lo contrario, solo actualizamos su posición
        if (!carroMarcador) {
            carroMarcador = L.marker(posicion, {icon: carroIcono})
                .addTo(mapa)
                .bindPopup("Smart Car");
            mapa.panTo(posicion, {animate: true, duration: 0.5}); // Seguir la posición del Smart Car
        } else {
            carroMarcador.setLatLng(posicion); // Actualizar posición del marcador si ya existe
        }
    }
};

/*
    Esta función se ejecuta una vez que el Smart Car ha llegado a su destino.
    Elimina el pin del destino, el objeto, la coordenada y los valores de latitud y longitud mostrados en pantalla.
    De este modo, podemos definir un nuevo destino e iniciar la ruta nuevamente.
*/
export function reiniciarDestino() {
    if (mapa && destinoMarcador) {
        mapa.removeLayer(destinoMarcador);
        destinoMarcador = null;
        destino = null;
    }
    
    const latD = document.getElementById("latD");
    const lonD = document.getElementById("lonD");
    if (latD && lonD) {
        latD.innerText = "0.0000";
        lonD.innerText = "0.0000";
    }
}