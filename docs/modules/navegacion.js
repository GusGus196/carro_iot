import L from "leaflet";
import "leaflet/dist/leaflet.css";

import mqttService from "./mqttService.js";
import {topics} from "./topics.js";
import {notificar} from "./feedback.js";

const navegacion = {
    mapa: null,
    destino: null,
    ultimoDestino: null,
    marcadorD: null, // Marcador dinámico del destino seleccionado
    marcadorSC: null, // Marcador dinámico del Smart Car
    
    // Referencias a elementos del DOM
    btnGPS: null,
    latD: null,
    lonD: null,
    latSC: null,
    lonSC: null,

    /*
        Estados de navegación:
        1. REPOSO: mapa creado, sin destino definido.
        2. LISTO: destino marcado, esperando confirmación de envío.
        3. NAVEGANDO: el Smart Car está en movimiento.
        4. PAUSA: detenido con un destino activo.
    */
    estado: "REPOSO",

    iconos: {
        smartcar: L.icon({
            iconUrl: "assets/car-front.svg",
            iconSize: [35, 35],
            iconAnchor: [17.5, 17.5], // Punto del icono que se alinea con la coordenada
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

    iniciarMapa() {
        // Perímetros de seguridad (Bounding Box) para el mapa local
        const inferiorIzq = L.latLng(19.244693, -103.705745);
        const superiorDer = L.latLng(19.251293, -103.695145);
        const limites = L.latLngBounds(inferiorIzq, superiorDer);
    
        // Limpieza de instancia previa para evitar fugas de memoria
        if (this.mapa) {
            this.mapa.remove();
            this.marcadorD = null;
            this.marcadorSC = null;
        }

        this.mapa = L.map("mapa", {
            center: [19.248, -103.700],
            zoom: 15,
            maxBounds: limites,
            maxBoundsViscosity: 1.0 // Evita el desplazamiento fuera de los límites
        });

        L.tileLayer("mapa/{z}/{x}/{y}.png", {
            minZoom: 16,
            maxZoom: 19,
            bounds: limites,
            attribution: "&copy; OpenStreetMap Contributors (offline)",
            noWrap: true
        }).addTo(this.mapa);

        // Eventos "click" y referencias

        this.mapa.on("click", (event) => this.seleccionarDestino(event.latlng));

        this.btnGPS = document.getElementById("btnGPS");
        if (this.btnGPS) this.btnGPS.onclick = () => this.controlarDestino();
        
        this.latD = document.getElementById("latD");
        this.lonD = document.getElementById("lonD");
        this.latSC = document.getElementById("latSC");
        this.lonSC = document.getElementById("lonSC");
        
        // Ajuste de renderizado post-carga para evitar áreas vacías
        setTimeout(() => {
            if (this.mapa) {
                this.mapa.invalidateSize();

                // Animación inicial
                this.mapa.flyTo([19.2491, -103.6974], 19, {
                    animate: true,
                    duration: 1.5,
                });   
            }
        }, 1000);
    },

    seleccionarDestino(latlng) {
        this.destino = latlng;

        if (!this.marcadorD) {
            this.marcadorD = L.marker(latlng, {icon: this.iconos.destino}).addTo(this.mapa).bindPopup("Destino");
        } else {
            this.marcadorD.setLatLng(latlng);
        }
        
        if (this.latD && this.lonD) {
            this.latD.innerText = latlng.lat.toFixed(4);
            this.lonD.innerText = latlng.lng.toFixed(4);
        }

        if (this.estado === "REPOSO") {
            this.estado = "LISTO";
        }

        this.actualizarBoton();
    },

    controlarDestino() {
        switch (this.estado) {
            case "REPOSO":
            case "LISTO":
                if (!this.destino) return notificar("NAVEGACIÓN GPS", "Por favor, selecciona un punto en el mapa.");
                
                this.estado = "NAVEGANDO";
                this.enviarAccion("iniciar");
                notificar("NAVEGACIÓN GPS", "¡Destino guardado! Iniciando navegación...");
                break;

            case "NAVEGANDO":
                this.estado = "PAUSA";
                this.enviarAccion("detener");
                notificar("NAVEGACIÓN GPS", "¡Navegación pausada! Esperando acción...");
                break;
            
            case "PAUSA":
                // Verifica si el destino cambió significativamente (> 1 metro)
                if (this.destino.distanceTo(this.ultimoDestino) > 1) {
                    this.enviarAccion("iniciar");
                    notificar("NAVEGACIÓN GPS", "¡Destino actualizado! Calculando nueva ruta...");
                } else {
                    this.enviarAccion("reanudar");
                    notificar("NAVEGACIÓN GPS", "Reanudando navegación hacia el destino guardado.");
                }
                
                this.estado = "NAVEGANDO";
                break;
        }

        this.actualizarBoton();       
    },

    enviarAccion(accion) {
        const msg = {
            accion: accion,
            lat: parseFloat(this.destino.lat.toFixed(6)),
            lon: parseFloat(this.destino.lng.toFixed(6))
        };
        
        mqttService.publicar(topics.modo.gps, msg);
        this.ultimoDestino = L.latLng(this.destino.lat, this.destino.lng);
    },

    actualizarPosicion(lat, lon) {
        if (this.latSC && this.lonSC) {
            this.latSC.innerText = lat.toFixed(4);
            this.lonSC.innerText = lon.toFixed(4);
        }

        if (this.mapa) {
            const posicion = [lat, lon];

            if (!this.marcadorSC) {
                this.marcadorSC = L.marker(posicion, {icon: this.iconos.smartcar}).addTo(this.mapa).bindPopup("Smart Car");
                this.mapa.panTo(posicion, {animate: true, duration: 1}); // Animación de seguimiento solo al crear el marcador
            } else {
                this.marcadorSC.setLatLng(posicion);
            }
        }
    },

    actualizarBoton() {
        if (!this.btnGPS) return;        
        this.btnGPS.classList.remove("btn-state-on", "btn-state-off");

        if (this.estado === "REPOSO" || this.estado === "LISTO") {
            this.btnGPS.innerText = "Enviar destino";
            this.btnGPS.classList.add("btn-state-off");

        } else if (this.estado === "NAVEGANDO") {
            this.btnGPS.innerText = "Detener navegación";
            this.btnGPS.classList.add("btn-state-on");

        } else {
            // estado "PAUSA"
            const haCambiado = this.destino.distanceTo(this.ultimoDestino) > 1;
            this.btnGPS.innerText = haCambiado ? "Enviar nuevo destino" : "Reanudar navegación";
            this.btnGPS.classList.add("btn-state-off");
        }
    },

    reiniciarDestino() {
        notificar("NAVEGACIÓN GPS", "¡Destino alcanzado con éxito!");
        
        if (this.mapa && this.marcadorD) {
            this.mapa.removeLayer(this.marcadorD);
            this.destino = null;
            this.marcadorD = null;
        }

        this.estado = "REPOSO";
        this.actualizarBoton();

        if (this.latD && this.lonD) {
            this.latD.innerText = "0.0000";
            this.lonD.innerText = "0.0000";
        }
    },

    eliminar() {
        if (this.mapa) {
            this.mapa.off();
            this.mapa.remove();
            this.mapa = null;
        }

        this.destino = null;
        this.ultimoDestino = null;
        this.marcadorD = null;
        this.marcadorSC = null;

        if (this.btnGPS) this.btnGPS.onclick = null;

        this.btnGPS = null;
        this.latD = null;
        this.lonD = null;
        this.latSC = null;
        this.lonSC = null;

        this.estado = "REPOSO";
    }
};

export default navegacion;