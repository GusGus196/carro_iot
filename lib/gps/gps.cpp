#include "gps.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2); // Puerto Serial 2

void iniciarGPS() {
    SerialGPS.begin(9600, SERIAL_8N1, gpsRX, gpsTX);
}

void procesarGPS() {
    while (SerialGPS.available() > 0) {
        if (gps.encode(SerialGPS.read())) {
            if (gps.location.isValid()) {
                // JSON simple o un string con las coordenadas
                String coords = String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);
                
                // Publicamos la ubicación cada vez que se actualice
                client.publish("proyecto/carrito/estado/ubicacion", coords.c_str());
            }
        }
    }
}