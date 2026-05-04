    import './css/style.css';
    import mqttService from "./modules/mqtt/mqttService.js"; // Objeto para el Servicio MQTT
    import {topics} from "./modules/mqtt/topics.js"; // Diccionario de los tópicos MQTT

    // Objeto para cada modo
    import manual from "./modules/modes/manual.js";
    import seguidor from "./modules/modes/seguidor.js";
    import obstaculos from "./modules/modes/obstaculos.js";
    import navegacion from "./modules/modes/navegacion.js";

    mqttService.conectar();

    mqttService.recibir((topic, payload) => {
        if (topic === topics.estado.ubicacion) {
            const {lat, lon, sat, rumbo, alcanzado} = payload;
            
            if(lat && lon) {
                navegacion.actualizarPosicion(lat, lon);
            }

            if(alcanzado === true) {
                navegacion.reiniciar();
            }
        }
    });

    const modeSelect = document.getElementById("mode-select");
    const modeInterface = document.getElementById("mode-interface");

    modeSelect.addEventListener("change", () => {
        const value = modeSelect.value;
        
        // Garbage collector
        manual.eliminar();
        seguidor.eliminar();
        obstaculos.eliminar();
        navegacion.eliminar();

        switch (value) {
            case "1": // Control manual
                modeInterface.innerHTML = `
                    <div class="mode-wrapper">
                        <div id="joystick-container">
                            <div id="joystick-puck"></div>
                        </div>
                        <div class="stats">
                            X: <span id="valX">0.00</span> | Y: <span id="valY">0.00</span>
                        </div>
                        <div class="flex flex-col items-center gap-4">
                            <div class="flex gap-3">
                                <button id="btnDirIzq" class="btn-light btn-state-off">
                                    <img src="assets/manual/arrow-left.svg" alt="L">
                                </button>
                                <button id="btnPrev" class="btn-light btn-state-off">
                                    <img src="assets/manual/warning.svg" alt="P">
                                </button>
                                <button id="btnDirDer" class="btn-light btn-state-off">
                                    <img src="assets/manual/arrow-right.svg" alt="R">
                                </button>
                            </div>
                            <button id="btnClaxon" class="btn-action">
                                Claxon
                            </button>
                        </div>
                    </div>
                `;

                mqttService.publicar(topics.accion.modo, {modo: "manual"});
                manual.iniciar();
                break;

            case "2": // Seguidor de línea
                modeInterface.innerHTML = `
                    <div class="mode-wrapper">
                        <button id="btnSeguidor" class="btn-action btn-state-off">
                            Activar
                        </button>
                    </div>
                `;
                
                mqttService.publicar(topics.accion.modo, {modo: "seguidor"});
                seguidor.iniciar();
                break;
                
            case "3": // Evitar obstáculos
                modeInterface.innerHTML = `
                    <div class="mode-wrapper">
                        <button id="btnObstaculos" class="btn-action btn-state-off">
                            Activar
                        </button>
                    </div>
                `;
                
                mqttService.publicar(topics.accion.modo, {modo: "obstaculos"});
                obstaculos.iniciar();
                break;

            case "4": // Navegación
                modeInterface.innerHTML = `
                    <div class="mode-wrapper-full animate-fade-in">
                        <div id="mapa" class="w-full h-full bg-base-300"></div>
                        <div class="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 z-1000 w-full px-4 justify-center">
                            <div class="bg-base-200/90 backdrop-blur-md px-4 py-2 rounded-full border border-base-content/10 shadow-lg flex items-center gap-2">
                                <span class="text-[10px] opacity-50 uppercase tracking-tighter">Distancia</span>
                                <span id="spanDistancia" text-sm font-bold text-primary">0.0m</span>
                            </div>
                            <div class="bg-base-200/90 backdrop-blur-md px-4 py-2 rounded-full border border-base-content/10 shadow-lg flex items-center gap-2">
                                <span class="text-[10px] opacity-50 uppercase tracking-tighter">Error Rumbo</span>
                                <span id="spanRumbo" text-sm font-bold text-secondary">0°</span>
                            </div>
                            <div class="bg-base-200/90 backdrop-blur-md px-4 py-2 rounded-full border border-base-content/10 shadow-lg flex items-center gap-2">
                                <span class="text-[10px] opacity-50 uppercase tracking-tighter">Satelites</span>
                                <span id="spanSatelites" text-sm font-bold text-secondary">0</span>
                            </div>
                        </div>
                        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-1000 w-full max-w-[320px] px-4">
                            <button id="btnNavegacion" class="btn btn-neutral w-full shadow-2xl uppercase tracking-widest transition-all active:scale-95 border-none">
                                Enviar destino
                            </button>
                        </div>
                    </div>
                `;

                mqttService.publicar(topics.accion.modo, {modo: "navegacion"});
                requestAnimationFrame(() => navegacion.iniciarMapa()); // Evitar errores de renderizado
                break;

            default:
                // Por si acaso (valor inválido o vacío)
                modeInterface.innerHTML = `
                    <p class="text-base-content/60">
                        Selecciona un modo de operación válido
                    </p>
                `;
        }
    });