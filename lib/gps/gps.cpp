#include "gps.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2); 

unsigned long últimaPublicación = 0;

void iniciarGPS() {
    SerialGPS.begin(9600, SERIAL_8N1, gpsRX, gpsTX);
}

void procesarGPS() {
    while (SerialGPS.available() > 0) {
        if (gps.encode(SerialGPS.read())) {
            if (gps.location.isValid()) {
                if (millis() - últimaPublicación > 2000) { // Mensajes cada 2 segundos si son válidos para no saturar el broker MQTT
                    String posicion = String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6); // Formato del mensaje para la página web
                    client.publish("proyecto/carrito/estado/ubicacion", posicion.c_str()); // Publicamos en el topic del broker
                    
                    últimaPublicación = millis();
                    
                    Serial.print("Posición enviada: "); Serial.println(posicion);
                }
            }
        }
    }
}