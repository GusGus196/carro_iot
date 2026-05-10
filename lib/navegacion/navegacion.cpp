#include "navegacion.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

static unsigned long ultimaPublicacion = 0;
static unsigned long ultimoRumboCalculado = 0;

bool primeraLecturaRealizada = false; // Omitir la primer lectura
static bool correccionAplicada = false; // Bandera para aplicar corrección de rumbo una sola vez por ciclo

double latAnterior, lonAnterior; // Variables para punto A (anterior)
double latActual = 0.0;
double lonActual = 0.0;
int satelites = 0;

static double distDestino = 0.0;
static double rumboDestino = 0.0;
static double rumboActual = 0.0;

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
    if (distDestino > 2.5) {
        navegar();
    } else {
        terminar();
    }
}

void calcularMetricas() {
    static unsigned long ultimoCalculo = 0;
    
    /*
        Calculamos la distancia en metros y rumbo en grados entre el Smart Car y el destino cada segundo,
        devuelve valores tipo double, Se usa la fórmula de Haversine para el cálculo de la distancia,
        y Azimuth para el rumbo
    */
    if (millis() - ultimoCalculo > 1000) {
        if (gps.location.isValid()) {
            distDestino = gps.distanceBetween(latActual, lonActual, destinoLat, destinoLon);
            rumboDestino = gps.courseTo(latActual, lonActual, destinoLat, destinoLon);

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
                rumboActual = gps.courseTo(latAnterior, lonAnterior, latActual, lonActual);
                ultimoRumboCalculado = millis();
                correccionAplicada = false;
            }

            latAnterior = latActual;
            lonAnterior = lonActual;
            primeraLecturaRealizada = true;
        } else {
            driver(0.0, 0.45);
        }
    }
    
    /* 
        Durante el segundo 1 del ciclo se hace una correción de rumbo solo una vez, 
        Comparando el rumbo actual con el rumbo al destino se obtiene el error en grados,
        permitiendo girar el coche hacia la dirección correcta.
    */
    if (tiempoTranscurrido < 1000 && primeraLecturaRealizada) {
        if (!correccionAplicada) {
            corregirOrientacion(rumboActual, rumboDestino);
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

        // La clave "destino" determina si el destino fue alcanzado o no con un booleano
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
    float velocidad = (abs(errorRumbo) > 45) ? 0.25 : 0.45;
    
    driver(giro, velocidad);
}