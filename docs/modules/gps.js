import L from "leaflet"; // Objeto "L" de la librería Leaflet
import "leaflet/dist/leaflet.css"; // Estilos CSS usados por Leaflet
import mqttService from "./mqttService.js";
import {topics} from "./topics.js";
import {notificar} from "./feedback.js";

const gps = {
    mapa: null,
    destino: null,
    marcadorSC: null, // Marcador del Smart Car
    marcadorD: null, // Marcador del destino
    btnGPS: null, // Botón GPS
    navegando: false, // Propiedad de control de navegación
    iconos: { // Iconos de los marcadores
        smartcar: L.icon({
            iconUrl: "assets/car-front.svg", // URL local del ícono
            iconSize: [35, 35], // Tamaño del ícono
            iconAnchor: [17.5, 17.5], // Píxel del ícono donde se posiciona la coordenada
            popupAnchor: [0, -18] // Posición del mensaje emergente sobre el ícono
        }),
        destino: L.icon({
            iconUrl: "assets/geo-fill.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            
            shadowUrl: "assets/marker-shadow.png", // URL local de la sombra
            shadowSize: [35, 35], // Tamaño de la sombra
            shadowAnchor: [10, 35] // Píxel de la sombra donde se posiciona la coordenada
        })
    },

    // Método para crear y configurar el mapa y sus eventos
    iniciarMapa() {
        // Límites del mapa local
        const inferiorIzq = L.latLng(19.244693, -103.705745);
        const superiorDer = L.latLng(19.251293, -103.695145);
        const limites = L.latLngBounds(inferiorIzq, superiorDer);
    
        // Si el mapa ya fue creado anteriormente o se cambio de modo,
        // se vuelve a crear al igual que los marcadores para evitar duplicados
        if (this.mapa) {
            this.mapa.remove();
            this.marcadorSC = null;
            this.marcadorD = null;
        }

        // L.map crea una instancia de la clase Map de la librería Leaflet.
        // Se encarga de definir el contenedor, configuración y estado del mapa,
        // los eventos (click, arrastre), conversión de coordenadas a píxeles, etc.
        this.mapa = L.map("mapa", {
            center: [19.248, -103.700], // Coordenada central inicial del mapa
            zoom: 15, // Nivel de zoom inicial del mapa
            maxBounds: limites, // Área rectangular permitida
            maxBoundsViscosity: 1.0 // Bloquear el desplazamiento fuera de la zona límite
        });

        // L.tileLayer crea una instancia de la clase Layer.
        // Gestiona de forma asíncrona la cuadrícula de imágenes mediante un sistema de plantillas URL,
        // construye la visualización del mapa a partir de los eventos (click, arrastre) del usuario
        L.tileLayer("mapa/{z}/{x}/{y}.png", {
            minZoom: 16, // Nivel de zoom mínimo
            maxZoom: 19, // Nivel de zoom máximo
            bounds: limites, // Evita que Leaflet solicite tiles (imágenes) fuera del área
            attribution: "&copy; OpenStreetMap contributors (offline)",
            noWrap: true // Evita que el mapa se repita infinitamente
        }).addTo(this.mapa);

        // Evento click sobre el mapa, llamamos al método seleccionarDestino
        this.mapa.on("click", (event) => this.seleccionarDestino(event.latlng));

        // Configurar botón del modo GPS para controlar el destino,
        // utilizando el método controlarDestino
        this.btnGPS = document.getElementById("btnGPS");
        if(this.btnGPS) {
            this.btnGPS.onclick = () => this.controlarDestino();
        }

        // Animación de 1.5 segundos desde la coordenada central inicial hasta el punto dado
        setTimeout(() => {
            this.mapa.invalidateSize(); // Evitar errores de visualización (áreas grises)
            this.mapa.flyTo([19.2491, -103.6974], 19, {
                animate: true,
                duration: 1.5,
                easeLinearity: 0.25
            });
        }, 1000);
    },

    // Método para leer la coordenada seleccionada, mostrarla y configurar el marcador del destino
    seleccionarDestino(latlng) {
        this.destino = latlng;

        // Si el marcador no existe se crea, de lo contrario solo se actualiza su posición
        if(!this.marcadorD) {
            this.marcadorD = L.marker(latlng, {
                icon: this.iconos.destino
            }).addTo(this.mapa).bindPopup("Destino");
        } else {    
            this.marcadorD.setLatLng(latlng);
        }
        
        // NOTA: solo se muestran 4 decimales en la interfaz, pero se deben enviar 6 al Smart Car
        document.getElementById("latD").innerHTML = latlng.lat.toFixed(4); // Latitud del destino
        document.getElementById("lonD").innerHTML = latlng.lng.toFixed(4); // Longitud del destino
    },

    // Método para enviar el destino y definir el control (iniciar/detener/reanudar)
    controlarDestino() {
        // Si no se esta navegando, enviamos el destino seleccionado y la acción "iniciar"
        if(!this.navegando) {
            if(this.destino) {
                const msg = {
                    lat: parseFloat(this.destino.lat.toFixed(6)),
                    lon: parseFloat(this.destino.lng.toFixed(6)),
                    accion: "iniciar"
                }

                // Publicamos el mensaje y mostramos una alerta
                mqttService.publicar(topics.modo.gps, msg);
                notificar("Navegación GPS", "¡Destino enviado! Iniciando navegación...");

                this.navegando = true; // Invertimos la propiedad de control
                this.actualizarBoton(true); // Llamamos al método para actualizar el botón
            } else {
                notificar("Navegación GPS", "Selecciona un destino para enviar");
            }
        } else {
            mqttService.publicar(topics.modo.gps, {accion: "detener"});
            notificar("Navegación GPS", "Navegación detenida");

            this.navegando = false;
            this.actualizarBoton(false);
        }
    },

    actualizarPosicion(lat, lon) {
        const latSC = document.getElementById("latSC");
        const lonSC = document.getElementById("lonSC");

        if (latSC && latSC) {
            latSC.innerText = lat.toFixed(4);
            lonSC.innerText = lon.toFixed(4);
        }

        if (this.mapa) {
            const posicion = [lat, lon];
            if (!this.marcadorSC) {
                this.marcadorSC = L.marker(posicion, {
                    icon: this.iconos.smartcar
                }).addTo(this.mapa).bindPopup("Smart Car");

                this.mapa.panTo(posicion, {
                    animate: true,
                    duration: 1
                });
            } else {
                this.marcadorSC.setLatLng(posicion);
            }
        }
    },

    actualizarBoton(estado) {
        if (!this.btnGPS) return;

        if (estado) {
            this.btnGPS.classList.replace("btn-state-off", "btn-state-on");
            this.btnGPS.textContent = "Detener destino";
        } else {
            this.btnGPS.classList.replace("btn-state-on", "btn-state-off");
            this.btnGPS.textContent = "Enviar destino";
        }
    },

    /*
    Esta función se ejecuta una vez que el Smart Car ha llegado a su destino.
    Elimina el pin del destino, el objeto, la coordenada y los valores de latitud y longitud mostrados en pantalla.
    De este modo, podemos definir un nuevo destino e iniciar la ruta nuevamente
    */
    reiniciarDestino() {
        if (this.mapa && this.marcadorD) {
            this.mapa.removeLayer(this.marcadorD);
            this.marcadorD = null;
            this.destino = null;
        }

        this.navegando = false;
        this.actualizarBoton(false);
        
        const latD = document.getElementById("latD");
        const lonD = document.getElementById("lonD");

        if (latD && lonD) {
            latD.innerText = "0.0000";
            lonD.innerText = "0.0000";
        }
    }
};

export default gps;