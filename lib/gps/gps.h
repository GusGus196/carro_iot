#ifndef GPS_H
#define GPS_H

#include <TinyGPS++.h> // Traduce el código NMEA del GPS
#include <HardwareSerial.h> // Usar puertos serial del ESP32

#include "config.h"
#include "reconnect.h" // Objeto cliente del MQTT para enviar posición al topic "proyecto/carrito/estado/ubicacion"

extern TinyGPSPlus gps;

void iniciarGPS();
void procesarGPS();

#endif