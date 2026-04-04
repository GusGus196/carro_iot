#ifndef DRIVER_H
#define DRIVER_H

#include <Arduino.h>
#include "config.h"

void driver(float valorX, float valorY);
int calibracionmotor(float motor);
float compensacionMotor(float compensacion, float motor);
void aplicarGiroYPotencia(float lecturaJoystick, int velocidad, int canal1, int canal2);
#endif