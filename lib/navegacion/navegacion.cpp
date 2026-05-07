#include "navegacion.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

static unsigned long ultimaPublicacion = 0;
static unsigned long ultimoRumboCalculado = 0;

double latAnterior, lonAnterior; // Variables para punto A (anterior)
bool primeraLecturaRealizada = false; // Omitir la primer lectura

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
                int satelites = gps.satellites.isValid() ? gps.satellites.value() : 0;
                
                snprintf(payload, sizeof(payload),
                    "{\"lat\":%.6f,\"lon\":%.6f,\"error\":%.1f,\"sat\":%d,\"destino\":false}",
                    gps.location.lat(),
                    gps.location.lng(),
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

    if (destinoDist <= 2.0) {
        terminar();
    } else {
        navegar();
    }
}

void calcularMetricas() {
    static unsigned long ultimoCalculo = 0;
    
    /*
        Calculamos la distancia en metros entre el Smart car y el destino cada 1 segundo,
        devuelve un valor tipo double, Se usa la fórmula de Haversine para el cálculo
    */
    if (millis() - ultimoCalculo > 1000) {
        if (gps.location.isValid()) {
            destinoDist = gps.distanceBetween(gps.location.lat(), gps.location.lng(), destinoLat, destinoLon);
            destinoRumbo = gps.courseTo(gps.location.lat(), gps.location.lng(), destinoLat, destinoLon);

        }

        ultimoCalculo = millis();
    }
}

void terminar() {
    estadoNav = false;
    accionNav = "";
    errorRumbo = 0.0;
    driver(0, 0);
    
    if(client.connected()) {
        char payload[80];
        int satelites = gps.satellites.isValid() ? gps.satellites.value() : 0;

        snprintf(payload, sizeof(payload),
            "{\"lat\":%.6f,\"lon\":%.6f,\"error\":%.1f,\"sat\":%d,\"destino\":true}",
            gps.location.isValid() ? gps.location.lat() : 0.0,
            gps.location.isValid() ? gps.location.lng() : 0.0,
            errorRumbo,
            satelites
        );

        client.publish(topics.ubicacion, payload);
    }
    claxon();
}

void navegar() {
    unsigned long tiempoTranscurrido = millis() - ultimoRumboCalculado;
    
    // Cada 6 segundos, actualizar posición y rumbo
    if (tiempoTranscurrido >= 6000) {
        ultimoRumboCalculado = millis();
        
        if (gps.location.isValid()) {
            if (primeraLecturaRealizada) {
                actualRumbo = gps.courseTo(latAnterior, lonAnterior, gps.location.lat(), gps.location.lng());
            }

            latAnterior = gps.location.lat();
            lonAnterior = gps.location.lng();
            primeraLecturaRealizada = true;

        } else {
            driver(0.0, 0.45);
        }
    }
    
    // Primer segundo: corregir orientación
    // Resto (5 segundos): avanzar para recalcular posición
    if (tiempoTranscurrido < 1000) {
        if (primeraLecturaRealizada) {
            corregirOrientacion(actualRumbo, destinoRumbo);
        } else {
            driver(0.0, 0.45);
        }

    } else {
        driver(0.0, 0.45); // Avanzar el resto del tiempo
    }
}

void obtenerOrientacion() {
    /*
        El smart car no cuenta con una brújula incluida, por lo que debemos hacerlo que avance 
        para que el GPS pueda orientarse. Al avanzar, el objeto .course de la librería TinyGPS++ procesa 
        los datos de desplazamiento, comparando la posición anterior con la nueva para trazar una línea de trayectoria. 
        
        Mediante el método .deg(), se extrae este ángulo en grados decimales (0 a 360), 
        tomando el Norte como 0 y aumentando en sentido horario (Este 90, Sur 180, Oeste 270), 
        lo que permite al coche conocer su rumbo actual en grados (hacia donde se dirige) 
        y como ya sabemos el rumbo hacia el destino, podemos calcular la diferencia de grados (error) y
        hacer que el smart car gire en dirección al destino
    */
    actualRumbo = gps.course.deg();
    corregirOrientacion(actualRumbo, destinoRumbo); // Utiliza el driver para corregir la orientación
}

void corregirOrientacion(double actual, double destino) {
    errorRumbo = destino - actual;

    if (errorRumbo > 180) errorRumbo -= 360;
    else if (errorRumbo < -180) errorRumbo += 360;
    
    float giro = (abs(errorRumbo) < 30) ? 0.0 : constrain(errorRumbo / 90.0, -0.20, 0.20);
    float velocidad = (abs(errorRumbo) > 45) ? 0.25 : 0.45;
    
    driver(giro, velocidad);
}