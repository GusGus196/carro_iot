import L from "leaflet";
import "leaflet/dist/leaflet.css";
import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";
import {notificar} from "../ui/feedback.js";

const navegacion = {
    mapa: null,
    destino: null,
    ultimoDestino: null,
    marcadorD: null, // Marcador dinámico del destino seleccionado
    marcadorSC: null, // Marcador dinámico del Smart Car
    
    // Referencias a elementos del DOM
    btnNavegacion: null,
    spanDistancia: null,
    spanRumbo: null,
    spanSatelites: null,
    
    /*
        Estados de navegación:
        1. REPOSO: mapa creado, sin destino definido.
        2. LISTO: destino marcado, esperando confirmación de envío.
        3. NAVEGANDO: el Smart Car está en movimiento.
        4. PAUSA: detenido con un destino activo (el destino se puede reanudar o modificar).
    */
    estado: "REPOSO",

    iconos: {
        smartcar: L.icon({
            iconUrl: "assets/map/car-front.svg",
            iconSize: [35, 35],
            iconAnchor: [17.5, 17.5], // Punto del icono que se alinea con la coordenada
            popupAnchor: [0, -18]
        }),
        
        destino: L.icon({
            iconUrl: "assets/map/geo-alt-fill.svg",
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        })
    },

    iniciarMapa() {
        // Limpieza de instancia previa para evitar fugas de memoria
        if (this.mapa) {
            this.mapa.remove();
            this.marcadorD = null;
            this.marcadorSC = null;
        }

        this.mapa = L.map("mapa", {
            center: [19.243349, -103.728511],
            zoom: 13
        });

        L.tileLayer("https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png", {
            attribution: "&copy; OpenStreetMap Contributors",
            noWrap: true,
            worldCopyJump: false
        }).addTo(this.mapa);

        // Eventos "click" y referencias

        this.mapa.on("click", (event) => this.seleccionarDestino(event.latlng));

        this.btnGPS = document.getElementById("btnGPS");    
        this.divDistancia = document.getElementById("divDistancia");
        this.divRumbo = document.getElementById("divRumbo");
        this.divSatelites = document.getElementById("divSatelites");

        if (this.btnGPS) this.btnGPS.onclick = () => this.controlarDestino();
        
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
        }, 500);
    },

    seleccionarDestino(latlng) {
        this.destino = latlng;

        if (!this.marcadorD) {
            this.marcadorD = L.marker(latlng, {icon: this.iconos.destino}).addTo(this.mapa).bindPopup(`<div class="text-center font-mono text-xs"><b>Posición GPS</b><br>Lat: ${this.destino.lat.toFixed(6)}<br>Lon: ${this.destino.lng.toFixed(6)}</div>`);
        } else {
            this.marcadorD.setLatLng(latlng);
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
        
        mqttService.publicar(topics.modo.navegacion, msg);
        this.ultimoDestino = L.latLng(this.destino.lat, this.destino.lng);
    },

    actualizarInfo(lat, lon, sat, rumbo) {
        // Usamos ?. por si el elemento no existe en el DOM en ese microsegundo
        if (this.divRumbo) this.divRumbo.innerText = `${Math.round(rumbo)}°`;
        if (this.divSatelites) this.divSatelites.innerText = sat;
        
        if (this.mapa) {
            const posicionSC = L.latLng(lat, lon); // Usar objeto LatLng de Leaflet es más seguro

            if (this.destino && this.divDistancia) {
                const distancia = this.destino.distanceTo(posicionSC);
                // Formateo: si es menos de 1m, mostrar 0. Si es más, mostrar 2 decimales
                this.divDistancia.innerHTML = distancia > 0.5 ? `${distancia.toFixed(2)}m` : "0.00m";
            }

            if (!this.marcadorSC) {
                this.marcadorSC = L.marker(posicionSC, {icon: this.iconos.smartcar}).addTo(this.mapa).bindPopup("Smart Car");
                this.mapa.setView(posicionSC, 19); // Centrado inicial suave
            } else {
                this.marcadorSC.setLatLng(posicionSC);
                // Opcional: Descomenta la siguiente línea si quieres que el mapa siga al carro
                // this.mapa.panTo(posicionSC); 
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

    reiniciar() {
        notificar("NAVEGACIÓN GPS", "¡Destino alcanzado con éxito!");
        
        if (this.mapa && this.marcadorD) {
            this.mapa.removeLayer(this.marcadorD);
            this.destino = null;
            this.marcadorD = null;
        }

        this.estado = "REPOSO";
        this.actualizarBoton();
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
        this.divDistancia = null;
        this.divRumbo = null;
        this.divSatelites = null;

        this.estado = "REPOSO";
    }
};

export default navegacion;