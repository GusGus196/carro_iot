#ifndef CALLBACK_H
#define CALLBACK_H

#include <Arduino.h>

#include "config.h"
#include "buzzer.h"
#include "joystick.h"

// Cambiamos byte por uint8_t para evitar errores de compilación
void callback(char* topic, uint8_t* payload, unsigned int length);
void mensajeModo(char* mensaje);
String extraerComando(const char* topicCompleto);
float mensajeSensor(char mensaje, float velocidadDeseada);
void mensajeTopic(char* topic, char* mensajeChar);
#endif