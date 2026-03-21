#ifndef JOYSTICK_H
#define JOYSTICK_H

#include <Arduino.h>
#include "config.h"
#include "driver.h"
// Declaramos que las variables existen en otro lado
extern float valorX;
extern float valorY;

void iniciarJoystick();

void joystick(char* mensaje);
#endif