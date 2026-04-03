import {TOPICS} from "./topics.js";
import {send} from "./mqtt.js";
import {showAlert} from "./alert.js";

let mapa, destino, destinoMarker, carroMarker;

// Clase para crear iconos de Leaflet
const LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    }
});

// Clase para crear iconos custom
const CustomIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        shadowSize: [41, 41],
        shadowAnchor: [12, 41]
    }
});

// Nota: para generar un icono de las dos anteriores clases, debemos crear un nuevo objeto y agregar la URL o la dirección local de la imagen en el atributo 'iconUrl'
let redIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png'});
let greenIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png'});

// Función para crear el mapa
export function initMapa() {
    // Si mapa ya fue inicializado y ocurrió un cambio de modo (select), creamos uno nuevo y borramos los marcadores anteriores
    if (mapa) {
        mapa.remove();
        destinoMarker = null;
        carroMarker = null;
    }

    mapa = L.map('mapa').setView([19.248302, -103.700119], 5); // Vista inicial de México
    
     // Layer del mapa utilizando OpenStreetMap.org
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; OpenStreetMap'}).addTo(mapa);
    
     // Animación de zoom de hacia la nueva dirección de 1 segundo
    setTimeout(() => {
        mapa.invalidateSize();
        mapa.flyTo([19.248302, -103.700119], 16, {duration: 1});
    }, 1000);
    
    // Evento click en el mapa
    mapa.on('click', function(evento) {
        destino = evento.latlng;

        // Crear marcador con icono (Leaflet o custom) y texto flotante del destino seleccionado
        if (!destinoMarker) {
            destinoMarker = L.marker(evento.latlng, {icon: redIcon}).addTo(mapa).bindPopup("Destino");
        } else {
            destinoMarker.setLatLng(evento.latlng);
        }

        document.getElementById('latD').innerText = evento.latlng.lat.toFixed(4); // Latitud del destino
        document.getElementById('lonD').innerText = evento.latlng.lng.toFixed(4); // Longitud del destino

        // Nota: mostramos 4 decimales para optimizar el espacio, aunque se deben enviar 6 para mejorar la precisión
    });
    
    // Evento del botón 'btnConfirmar' para enviar destino
    document.getElementById('btnConfirmar').addEventListener('click', () => {
        if (destino) {
            const msg = `${destino.lat.toFixed(6)},${destino.lng.toFixed(6)}`; // Mensaje 'latitud,longitud' del destino
            send(TOPICS.destino, msg); // Enviamos el mensaje
            showAlert("NAVEGACIÓN GPS", "Destino enviado correctamente."); // Mostramos una alerta personalizada
        } else {
            showAlert("NAVEGACIÓN GPS", "Selecciona un destino antes de enviar.");
        }
    });
}

export function actualizarPosicion(lat, lon) {
    // Solo actualizamos la ubicación del smart car si estamos en el modo navegación GPS
    const latC = document.getElementById('latC');
    const lonC = document.getElementById('lonC');
    
    if (latC && lonC) {
        latC.innerText = lat.toFixed(4);
        lonC.innerText = lon.toFixed(4);
    }
    
    // Crear marcador del smart car
    if (mapa) {
        const posicion = [lat, lon];
        
        // Si el marcador no existe lo creamos, de lo contrario solo actualizamos su posición
        if (!carroMarker) {
            carroMarker = L.marker(posicion, {icon: greenIcon}).addTo(mapa).bindPopup("Smart Car");
            mapa.panTo(posicion, {animate: true, duration: 0.5}); // Cambiar el centro del mapa a la posición del smart car
        } else {
            carroMarker.setLatLng(posicion); // Actualizar posición del marcador con la posición recibida si el marcador ya existe
            mapa.panTo(posicion, {animate: true, duration: 0.5});
        }
    }
};