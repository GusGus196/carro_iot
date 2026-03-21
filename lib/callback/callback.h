#ifndef CALLBACK_H
#define CALLBACK_H

#include <Arduino.h>
#include "joystick.h"
#include "config.h"


// Cambiamos byte por uint8_t para evitar errores de compilación
void callback(char* topic, uint8_t* payload, unsigned int length);

#endif