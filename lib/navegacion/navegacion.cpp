#include "navegacion.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

static unsigned long ultimaPublicacion = 0;
static unsigned long ultimoRumboCalculado = 0;

double latAnterior, lonAnterior; // Variables para punto A (anterior)
bool primeraLecturaRealizada = false; // Omitir la primer lectura
static bool correccionAplicada = false; // Bandera para corrección de rumbo

double latActual = 0.0;
double lonActual = 0.0;
int satelites = 0;

static double destinoDist = 0.0;
static double destinoRumbo = 0.0;
static double actualRumbo = 0.0;

void iniciarGPS() {
    SerialGPS.begin(9600, SERIAL_8N1, gpsRX, gpsTX);
}

void enviarUbicacion() {
    while (SerialGPS.available() > 0) {
        if (gps.encode(SerialGPS.read())) {
            if (gps.location.isValid() && (millis() - ultimaPublicacion > 1000)) {
                char payload[120];
                latActual = gps.location.lat();
                lonActual = gps.location.lng();
                satelites = gps.satellites.isValid() ? gps.satellites.value() : 0;
                
                snprintf(payload, sizeof(payload),
                    "{\"lat\":%.6f,\"lon\":%.6f,\"error\":%.1f,\"sat\":%d,\"destino\":false}",
                    latActual,
                    lonActual,
                    errorRumbo,
                    satelites
                );

                client.publish(topics.ubicacion, payload);
                ultimaPublicacion = millis();
            }
        }
    }
}

void actualizarNavegacion() {   
    if (!estadoNav) return;
    
    calcularMetricas();

    // Radio de 2.5 metros al destino
    if (destinoDist > 2.5) {
        navegar();
    } else {
        terminar();
    }
}

void calcularMetricas() {
    static unsigned long ultimoCalculo = 0;
    
    /*
        Calculamos la distancia en metros entre el Smart Car y el destino cada segundo,
        devuelve un valor tipo double, Se usa la fórmula de Haversine para el cálculo
    */
    if (millis() - ultimoCalculo > 1000) {
        if (gps.location.isValid()) {
            destinoDist = gps.distanceBetween(latActual, lonActual, destinoLat, destinoLon);
            destinoRumbo = gps.courseTo(latActual, lonActual, destinoLat, destinoLon);

        }

        ultimoCalculo = millis();
    }
}

void navegar() {
    unsigned long tiempoTranscurrido = millis() - ultimoRumboCalculado; // Ciclo de 6 segundos
    
    // Actualizar rumbo del Smart Car cada 5 segundos
    if (tiempoTranscurrido > 6000) {
        
        if (gps.location.isValid()) {
            if (primeraLecturaRealizada) {
                /*
                El módulo NEO-6M no tiene brújula, por lo que debe avanzar para que TinyGPS++ calcule el rumbo.
                La librería compara la posición anterior y actual para obtener la trayectoria actual, 
                devuelve el ángulo en grados (0–360): Norte=0, Este=90, Sur=180 y Oeste=270.
                */
               actualRumbo = gps.courseTo(latAnterior, lonAnterior, latActual, lonActual);
               ultimoRumboCalculado = millis();
               correccionAplicada = false;
            }

            latAnterior = gps.location.lat();
            lonAnterior = gps.location.lng();
            primeraLecturaRealizada = true;

        } else {
            driver(0.0, 0.45);
        }
    }
    
    /* 
        Durante el segundo 1 del intervalo se hace una correción de rumbo, 
        Comparando el rumbo actual con el rumbo al destino se obtiene el error en grados,
        permitiendo girar el coche hacia la dirección correcta.
    */
    if (tiempoTranscurrido < 1000 && primeraLecturaRealizada) {
        if (!correccionAplicada) {
            corregirOrientacion(actualRumbo, destinoRumbo);
            correccionAplicada = true;
        }

    } else {
        driver(0.0, 0.45);
    }
}

void terminar() {
    estadoNav = false;
    accionNav = "";
    errorRumbo = 0.0;
    
    driver(0, 0);
    
    if(client.connected()) {
        char payload[80];

        snprintf(payload, sizeof(payload),
            "{\"lat\":%.6f,\"lon\":%.6f,\"error\":%.1f,\"sat\":%d,\"destino\":true}",
            latActual,
            lonActual,
            errorRumbo,
            satelites
        );

        client.publish(topics.ubicacion, payload);
    }

    claxon();
}

void corregirOrientacion(double actual, double destino) {
    errorRumbo = destino - actual;

    if (errorRumbo > 180) errorRumbo -= 360;
    else if (errorRumbo < -180) errorRumbo += 360;
    
    float giro = (abs(errorRumbo) < 30) ? 0.0 : constrain(errorRumbo / 90.0, -0.20, 0.20);
    float velocidad = (abs(errorRumbo) > 45) ? 0.30 : 0.45;
    
    driver(giro, velocidad);
}