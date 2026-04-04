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

void iniciarGPS(); // Inicia la comunicación serial con el módulo GY-GPS6MV2
void enviarUbicacion(); // Envia la ubicación del smart car para actualizar el marcador en el controlador web
void actualizarNavegacion(); // Obtiene la distancia y el ángulo entre el smart car y el destino, publica la alerta cuando se alcance el destino y detiene el driver
void obtenerOrientacion(); // Obtiene el ángulo de orientación actual del smart car e invoca la correción de orientación en dirección al destino
void corregirOrientacion(double actual, double destino); // Establece la correción de orientación manipulando el giro y la velocidad mientras el smart car avanza

#endif