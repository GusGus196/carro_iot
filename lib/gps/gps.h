#ifndef GPS_H
#define GPS_H

#include <TinyGPS++.h> // Funciones para traducir el código NMEA del GPS, calcular distancia y rumbo entre dos coordenadas
#include <HardwareSerial.h> // Usar puertos serial del ESP32

#include "config.h"
#include "buzzer.h"
#include "reconnect.h" // Objeto cliente del MQTT para enviar posición al topic "smartcar/estado/ubicacion" y alerta a "smartcar/estado/llegada"
#include "driver.h" // Incluir función driver()

extern TinyGPSPlus gps;
extern HardwareSerial SerialGPS; 

void iniciarGPS();
void enviarUbicacion();

#endif