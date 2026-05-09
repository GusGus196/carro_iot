#ifndef NAVEGACION_H
#define NAVEGACION_H

#include <TinyGPS++.h> // Funciones para traducir el código NMEA del GPS, calcular distancia y rumbo entre dos coordenadas
#include <HardwareSerial.h> // Usar puertos serial del ESP32

#include "config.h"
#include "feedback.h"
#include "reconnect.h" // Objeto cliente del MQTT para enviar información al topic "smartcar/estado/ubicacion"
#include "driver.h" // Incluir función driver()

extern TinyGPSPlus gps;
extern HardwareSerial SerialGPS; 

void iniciarGPS(); // Inicia la comunicación serial con el módulo GY-GPS6MV2
void enviarUbicacion();

void actualizarNavegacion();
void calcularMetricas();
void navegar();
void terminar();


void obtenerOrientacion();
void corregirOrientacion(double actual, double destino);

#endif