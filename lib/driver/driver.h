#ifndef DRIVER_H
#define DRIVER_H
#include <Arduino.h>
#include "config.h"

void driver(int valorX, int valorY);
int calibracionmotor(float motor);
int compensacionMotor(float compensacion, int velocidad);
void aplicarGiroYPotencia(float lecturaJoystick, int velocidad, int canal1, int canal2);
#endif
