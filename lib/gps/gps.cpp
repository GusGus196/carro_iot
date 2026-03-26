#include "gps.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2); 

unsigned long ultimaPublicacion = 0;

void iniciarGPS() {
    SerialGPS.begin(9600, SERIAL_8N1, gpsRX, gpsTX);
}

void procesarGPS() {
    while (SerialGPS.available() > 0) {
        if (gps.encode(SerialGPS.read())) {
            if (gps.location.isValid()) {
                if (millis() - ultimaPublicacion > 2000) { // Mensajes cada 2 segundos si son válidos para no saturar el broker MQTT
                    String posicion = String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6); // Formato del mensaje para la página web
                    client.publish("proyecto/carrito/estado/ubicacion", posicion.c_str()); // Publicamos en el topic del broker
                    
                    ultimaPublicacion = millis();
                    
                    Serial.print("Posición enviada: "); Serial.println(posicion);
                }
            }
        }
    }
}

void actualizarNavegacion() {
    if (gps.location.isValid() && destino) {
        double distanciaAlObjetivo = calculateDistance(gps.location.lat(), gps.location.lng(), destinoLatitud, destinoLongitud);
        double rumboAlObjetivo = calculateAzimuth(gps.location.lat(), gps.location.lng(), destinoLatitud, destinoLongitud);

        Serial.print("Distancia: "); Serial.print(distanciaAlObjetivo); Serial.print("m | Rumbo: "); Serial.println(rumboAlObjetivo);

        if (distanciaAlObjetivo < 2.5) {
            destino = false;
            driver(0, 0);
            client.publish("proyecto/carrito/estado/notificacion", "1");
        } else {
            obtenerOrientacion();
        }
    }
}

double rumboActual = 0.00;

void obtenerOrientacion() {
    double latA = gps.location.lat();
    double lngA = gps.location.lng();

    // driver(0, 0.2);
    sonarConfirmacion();
    delay(1000);
    sonarConfirmacion();
    delay(1000);
    sonarConfirmacion();
    delay(1000);
    // driver(0, 0);

    double latD = gps.location.lat();
    double lngD = gps.location.lng();

    rumboActual = calculateAzimuth(latA, lngA, latD, lngD);

    Serial.println(rumboActual);
}