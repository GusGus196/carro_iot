import L from "leaflet";
import "leaflet/dist/leaflet.css";
import mqttService from "../mqtt/mqttService.js";
import {topics} from "../mqtt/topics.js";
import {notificar} from "../ui/feedback.js"; // Notificación del estado de navegación

const navegacion = {
    mapa: null,
    destino: null,
    ultimoDestino: null,
    marcadorD: null, // Marcador dinámico del destino
    marcadorSC: null, // Marcador dinámico del Smart Car

    contenedor: null, // Interfaz del modo

    // Elementos de la interfaz
    btnNavegacion: null,
    divDistancia: null,
    divRumbo: null,
    divSatelites: null,

    /*
        Estados de navegación:
            1. SIN_DESTINO: mapa creado, sin destino definido.
            2. DESTINO_SELECCIONADO: destino marcado, esperando confirmación de envío.
            3. NAVEGANDO: el Smart Car está en movimiento.
            4. PAUSADO: detenido con un destino activo (el destino guardado se puede reanudar o cambiar).
    */
    estado: "SIN_DESTINO",

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

    // Cargar la interfaz del modo
    montar(contenedor) {
        this.contenedor = contenedor;

        contenedor.innerHTML = `
            <div class="mode-wrapper-full animate-fade-in relative">
                <div id="mapa" class="absolute inset-0 z-0"></div>
                <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex flex-col gap-3 z-10">
                    <div class="grid grid-cols-3 bg-base-200/95 backdrop-blur-md rounded-2xl shadow-xl border border-base-300 overflow-hidden">
                        <div class="flex flex-col items-center py-3">
                            <span class="text-[10px] uppercase opacity-50">Distancia</span>
                            <span id="divDistancia" class="font-mono text-sm font-bold text-primary">0.0m</span>
                        </div>
                        <div class="flex flex-col items-center py-3 border-x border-base-300">
                            <span class="text-[10px] uppercase opacity-50">Rumbo</span>
                            <span id="divRumbo" class="font-mono text-sm font-bold text-secondary">0°</span>
                        </div>
                        <div class="flex flex-col items-center py-3">
                            <span class="text-[10px] uppercase opacity-50">Satélites</span>
                            <span id="divSatelites" class="font-mono text-sm font-bold text-accent">0</span>
                        </div>
                    </div>
                    <button id="btnNavegacion" class="btn btn-success w-full shadow-xl font-black uppercase tracking-widest">
                        Enviar destino
                    </button>
                </div>
            </div>
        `;

        this.enlazar(); // Obtener los elementos de la interfaz y asignar eventos
        this.iniciarMapa(); // Inicializar el mapa utilizando Leaflet
    },

    enlazar() {
        this.btnNavegacion = this.contenedor.querySelector("#btnNavegacion");
        this.divDistancia = this.contenedor.querySelector("#divDistancia");
        this.divRumbo = this.contenedor.querySelector("#divRumbo");
        this.divSatelites = this.contenedor.querySelector("#divSatelites");

        this.mapaClickHandler = (event) => this.seleccionarDestino(event.latlng);
        this.btnClick = () => this.controlarDestino();

        this.btnNavegacion?.addEventListener("click", this.btnClick);
    },

    iniciarMapa() {
        if (this.mapa) this.mapa.remove(); // Evitar duplicados

        this.mapa = L.map("mapa", {
            center: [19.248216, -103.700332],
            zoom: 17,
            zoomControl: false,
            maxBounds: [[-90, -180], [90, 180]], // Límite para evitar mapa en el vacío
            maxBoundsViscosity: 1.0,
            worldCopyJump: false // Evitar mapa infinito horizontalmente
        });

        const layerOutdoors = L.tileLayer("https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png", 
            {
                minZoom: 3, // Evita salirse del mapa haciendo zoom
                maxZoom: 21,
                noWrap: true, // Evitar que las imágenes se repitan horizontalmente
                attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
            }
        );

        const layerSatellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                minZoom: 3,
                maxZoom: 19,
                noWrap: true,
                attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
            }
        );

        layerOutdoors.addTo(this.mapa);

        this.layersControl = L.control.layers({
            Outdoors: layerOutdoors,
            Satélite: layerSatellite
        }).addTo(this.mapa);

        this.mapa.on("click", this.mapaClickHandler);
    },

    // Crear y actualizar marcador del destino
    seleccionarDestino(latlng) {
        this.destino = latlng;

        if (!this.marcadorD) {
            this.marcadorD = L.marker(latlng, {icon: this.iconos.destino}).addTo(this.mapa).bindPopup(`
                <div class="text-xs font-mono">
                    <b>Destino</b><br>
                    <b>lat: ${latlng.lat.toFixed(5)}</b><br>
                    <b>lon: ${latlng.lng.toFixed(5)}</b><br>
                </div>
            `);
            
            this.marcadorD.openPopup(); // Abrir la ventana emergente solo al crear el marcador

        } else {
            this.marcadorD.setLatLng(latlng).setPopupContent(`
                <div class="text-xs font-mono">
                    <b>Destino</b><br>
                    <b>lat: ${latlng.lat.toFixed(5)}</b><br>
                    <b>lon: ${latlng.lng.toFixed(5)}</b><br>
                </div>
            `);
        }
        
        if (this.estado === "SIN_DESTINO") this.estado = "DESTINO_SELECCIONADO";

        this.actualizarBoton();
    },

    controlarDestino() {
        switch (this.estado) {
            case "SIN_DESTINO": // Fallback
            case "DESTINO_SELECCIONADO":
                if (!this.destino) return notificar("NAVEGACIÓN GPS", "Selecciona un punto en el mapa.");

                notificar("NAVEGACIÓN GPS", "¡Destino guardado! Iniciando navegación...");
                this.estado = "NAVEGANDO";
                this.enviarAccion("iniciar");
                break;

            case "NAVEGANDO":
                notificar("NAVEGACIÓN GPS", "¡Navegación pausada! Esperando acción...")
                this.estado = "PAUSADO";
                this.enviarAccion("detener");
                break;

            case "PAUSADO": {
                if (!this.ultimoDestino || this.destino.distanceTo(this.ultimoDestino) > 1) {
                    notificar("NAVEGACIÓN GPS", "¡Destino actualizado! Calculando nueva ruta...");
                    this.enviarAccion("iniciar");
                } else {
                    notificar("NAVEGACIÓN GPS", "Reanudando navegación hacia el destino guardado.");
                    this.enviarAccion("reanudar");
                }

                this.estado = "NAVEGANDO";
                break;
            }
        }

        this.actualizarBoton();
    },

    enviarAccion(accion) {
        mqttService.publicar(topics.modo.navegacion, {
            accion,
            lat: Number(this.destino.lat.toFixed(6)),
            lon: Number(this.destino.lng.toFixed(6))
        });

        this.ultimoDestino = L.latLng(this.destino);
    },

    actualizarInterfaz(lat, lon, sat, rumbo) {
        if (!this.mapa) return;

        if (this.divRumbo) this.divRumbo.textContent = `${Math.round(rumbo)}°`;
        if (this.divSatelites) this.divSatelites.textContent = sat;

        const pos = L.latLng(lat, lon);

        if (this.destino && this.divDistancia) {
            const dist = this.destino.distanceTo(pos);
            this.divDistancia.textContent = `${dist.toFixed(2)}m`;
        }
        
        // Inicializar el marcador del Smart Car y su ventana emergente
        const popup = `
            <div class="text-xs font-mono">
                <b>Smart Car</b><br>
                <b>lat: ${lat.toFixed(5)}</b><br>
                <b>lon: ${lon.toFixed(5)}</b><br>
            </div>
        `;
        
        if (!this.marcadorSC) {
            this.marcadorSC = L.marker(pos, {icon: this.iconos.smartcar}).addTo(this.mapa).bindPopup(popup);
            
            // Animación de vuelo al marcador solo al obtener la primer ubicación
            this.mapa.flyTo(pos, 19, {
                animate: true,
                duration: 1
            });
        } else {
            this.marcadorSC.setLatLng(pos).setPopupContent(popup);
        }
    },

    actualizarBoton() {
        if (!this.btnNavegacion) return;

        this.btnNavegacion.className = "btn w-full shadow-xl font-black uppercase tracking-widest";

        if (this.estado === "SIN_DESTINO" || this.estado === "DESTINO_SELECCIONADO") {
            this.btnNavegacion.classList.add("btn-success");
            this.btnNavegacion.textContent = "Enviar destino";
            
        } else if (this.estado === "NAVEGANDO") {
            this.btnNavegacion.classList.add("btn-error");
            this.btnNavegacion.textContent = "Detener navegación";
            
        } else { // PAUSADO
            if (!this.destino || !this.ultimoDestino || this.destino.distanceTo(this.ultimoDestino) > 1) {
                this.btnNavegacion.textContent = "Enviar nuevo destino";
                this.btnNavegacion.classList.add("btn-success");
            } else {
                this.btnNavegacion.textContent = "Reanudar navegación";
                this.btnNavegacion.classList.add("btn-info");
            }
        }
    },

    reiniciar() {
        notificar("NAVEGACIÓN GPS", "¡Destino alcanzado!");

        this.mapa?.removeLayer(this.marcadorD);
        this.marcadorD = null;

        this.destino = null;
        this.ultimoDestino = null;
        this.estado = "SIN_DESTINO";

        this.actualizarBoton();
    },

    eliminar() {
        this.mapa?.off("click", this.mapaClickHandler);
        this.mapa?.remove();
        this.mapa = null;
        this.destino = null;
        this.ultimoDestino = null;
        this.marcadorD = null;
        this.marcadorSC = null;

        this.layersControl?.remove();
        this.layersControl = null;
        
        this.contenedor = null;

        this.btnNavegacion?.removeEventListener("click", this.btnClick);
        this.btnNavegacion = null;
        this.divDistancia = null;
        this.divRumbo = null;
        this.divSatelites = null;

        this.mapaClickHandler = null;
        this.btnClick = null;

        this.estado = "SIN_DESTINO";
    }
};

export default navegacion;