#ifndef CALLBACK_H
#define CALLBACK_H

#include <Arduino.h>

#include "joystick.h"
#include "config.h"

void callback(char* topic, uint8_t* payload, unsigned int length); // Cambiamos byte por uint8_t para evitar errores de compilación

#endif