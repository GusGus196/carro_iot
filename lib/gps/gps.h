#ifndef GPS_H
#define GPS_H

#include <TinyGPS++.h> // Traduce el código NMEA del GPS
#include <haversine.h> // Ecuaciones para determinar el rumbo y la distancia entre dos puntos GPS
#include <HardwareSerial.h> // Usar puertos serial del ESP32

#include "config.h"
#include "buzzer.h"
#include "reconnect.h" // Objeto cliente del MQTT para enviar posición al topic "proyecto/carrito/estado/ubicacion"
#include "driver.h" // Incluir función driver()

extern TinyGPSPlus gps;
extern HardwareSerial SerialGPS; 

void iniciarGPS();
void procesarGPS();
void actualizarNavegacion();
void obtenerOrientacion();

#endif