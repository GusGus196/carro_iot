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

void iniciarGPS(); // Iniciar la comunicación serial con el módulo GY-GPS6MV2
void enviarUbicacion(); // Enviar la ubicación del smart car para actualizar el marcador en el controlador web
void actualizarNavegacion(); // Obtener la distancia y el ángulo entre el smart car y el destino, publicar la alerta cuando se alcance el destino y detener el driver

#endif