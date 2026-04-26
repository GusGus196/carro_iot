import L from "leaflet";
import "leaflet/dist/leaflet.css";

import mqttService from "./mqttService.js";
import {topics} from "./topics.js";
import {notificar} from "./feedback.js";

const gps = {
    mapa: null,
    destino: null,
    marcadorD: null, // Marcador del destino seleccionado
    marcadorSC: null, // Marcador dinámico del Smart Car
    
    // Referencias a elementos del DOM (botón de acción GPS y contenedor visual de coordenadas)
    btnGPS: null,
    latD: null,
    lonD: null,
    latSC: null,
    lonSC: null,

    navegando: false, // Flag de control de estado de navegación

    iconos: {
        smartcar: L.icon({
            iconUrl: "assets/car-front.svg",
            iconSize: [35, 35],
            iconAnchor: [17.5, 17.5], // Píxel del icono donde se posiciona la coordenada
            popupAnchor: [0, -18]
        }),
        destino: L.icon({
            iconUrl: "assets/geo-fill.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            shadowUrl: "assets/marker-shadow.png",
            shadowSize: [35, 35],
            shadowAnchor: [10, 35]
        })
    },

    // Configura la instancia del mapa, límites geográficos y capas de imágenes
    iniciarMapa() {
        // Definición de perímetros de seguridad (Bounding Box) para el mapa local
        const inferiorIzq = L.latLng(19.244693, -103.705745);
        const superiorDer = L.latLng(19.251293, -103.695145);
        const limites = L.latLngBounds(inferiorIzq, superiorDer);
    
        // Limpieza de instancia previa para evitar fugas de memoria o duplicidad
        if (this.mapa) {
            this.mapa.remove();
            this.marcadorSC = null;
            this.marcadorD = null;
        }

        this.mapa = L.map("mapa", {
            center: [19.248, -103.700],
            zoom: 15,
            maxBounds: limites,
            maxBoundsViscosity: 1.0 // Evita el "rebote" fuera de los límites
        });

        // Carga las imágenes locales (public/mapa) para rellenar el mapa
        L.tileLayer("mapa/{z}/{x}/{y}.png", {
            minZoom: 16,
            maxZoom: 19,
            bounds: limites,
            attribution: "&copy; OpenStreetMap contributors (offline)",
            noWrap: true // Evita que el mapa se repita infinitamente
        }).addTo(this.mapa);

        // Eventos click del mapa, referencias y evento del botón
        this.mapa.on("click", (event) => this.seleccionarDestino(event.latlng));

        this.btnGPS = document.getElementById("btnGPS");
        if(this.btnGPS) this.btnGPS.onclick = () => this.controlarDestino();
        
        this.latD = document.getElementById("latD");
        this.lonD = document.getElementById("lonD");
        this.latSC = document.getElementById("latSC");
        this.lonSC = document.getElementById("lonSC");
        
        // Ajuste de renderizado post-carga para evitar áreas grises y animación de 1.5 segundos de desplazamiento
        setTimeout(() => {
            if(this.mapa) {
                this.mapa.invalidateSize();
                this.mapa.flyTo([19.2491, -103.6974], 19, {
                    animate: true,
                    duration: 1.5,
                });   
            }
        }, 1000);
    },

    // Controlar la selección visual y lógica del punto de destino
    seleccionarDestino(latlng) {
        this.destino = latlng;

        if(!this.marcadorD) {
            this.marcadorD = L.marker(latlng, {
                icon: this.iconos.destino
            }).addTo(this.mapa).bindPopup("Destino");
        } else {    
            this.marcadorD.setLatLng(latlng); // Si ya existe, solo lo actualizamos
        }
        
        // Actualización de interfaz: se toman solo 4 decimales por espacio
        if (this.latD && this.lonD) {
            this.latD.innerText = latlng.lat.toFixed(4);
            this.lonD.innerText = latlng.lng.toFixed(4);
        }
    },

    // Envío de coordenadas al Smart Car y tipo de acción
    controlarDestino() {
        if(!this.navegando) {
            if(this.destino) {
                // El Smart Car requiere precisión de 6 decimales para navegación GPS
                const msg = {
                    lat: parseFloat(this.destino.lat.toFixed(6)),
                    lon: parseFloat(this.destino.lng.toFixed(6)),
                    accion: "iniciar"
                };

                mqttService.publicar(topics.modo.gps, msg);
                notificar("NAVEGACIÓN GPS", "¡Destino enviado! Iniciando navegación...");

                this.navegando = true;
                this.actualizarBoton(true);
            } else {
                notificar("NAVEGACIÓN GPS", "Selecciona un destino en el mapa.");
            }
        } else {
            mqttService.publicar(topics.modo.gps, {accion: "detener"});
            notificar("NAVEGACIÓN GPS", "¡Navegación interrumpida! Esperando acción...");

            this.navegando = false;
            this.actualizarBoton(false);
        }
    },

    // Actualiza la posición del Smart Car con la información recibida en el tópico de estado "ubicación"
    actualizarPosicion(lat, lon) {
        if (this.latSC && this.lonSC) {
            this.latSC.innerText = lat.toFixed(4);
            this.lonSC.innerText = lon.toFixed(4);
        }

        if (this.mapa) {
            const posicion = [lat, lon];
            if (!this.marcadorSC) {
                this.marcadorSC = L.marker(posicion, {
                    icon: this.iconos.smartcar
                }).addTo(this.mapa).bindPopup("Smart Car");

                // Centrar mapa en el marcador del Smart Car en la primera detección
                this.mapa.panTo(posicion, {
                    animate: true,
                    duration: 1
                });
            } else {
                this.marcadorSC.setLatLng(posicion);
            }
        }
    },

    // Cambia el estilo y texto del botón GPS según el estado de la navegación
    actualizarBoton(estado) {
        if (!this.btnGPS) return;

        if (estado) {
            this.btnGPS.classList.replace("btn-state-off", "btn-state-on");
            this.btnGPS.textContent = "Detener navegación";
        } else {
            this.btnGPS.classList.replace("btn-state-on", "btn-state-off");
            this.btnGPS.textContent = "Enviar destino";
        }
    },

    // Limpia el destino actual y su marcador tras completar la ruta
    reiniciarDestino() {
        notificar("NAVEGACIÓN GPS", "¡Destino alcanzado!");
        
        if (this.mapa && this.marcadorD) {
            this.mapa.removeLayer(this.marcadorD);
            this.marcadorD = null;
            this.destino = null;
        }

        this.navegando = false;
        this.actualizarBoton(false);

        if (this.latD && this.lonD) {
            this.latD.innerText = "0.0000";
            this.lonD.innerText = "0.0000";
        }
    },

    eliminar() {
        // Destruir la instancia del mapa y limpiar memoria de Leaflet
        if (this.mapa) {
            this.mapa.off();
            this.mapa.remove();
            this.mapa = null;
        }

        this.marcadorD = null;
        this.marcadorSC = null;
        this.destino = null;

        // Liberación de referencias al DOM para el recolector de basura
        if (this.btnGPS) this.btnGPS.onclick = null;
        this.btnGPS = null;
        this.latD = null;
        this.lonD = null;
        this.latSC = null;
        this.lonSC = null;

        // Restablecer flags
        this.navegando = false;
    }
};

export default gps;