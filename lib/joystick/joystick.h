#ifndef JOYSTICK_H
#define JOYSTICK_H

#include <Arduino.h>

#include "config.h"
#include "driver.h"

extern float valorX;
extern float valorY;

void iniciarJoystick();
void procesarJoystick(char* mensaje);

#endif