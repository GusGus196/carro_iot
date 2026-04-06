#ifndef DRIVER_H
#define DRIVER_H

#include <Arduino.h>

#include "config.h"

void driver(float valorX, float valorY);
int calibrarMotor(float motor);
float compensarMotor(float compensacion, float motor);
void aplicarGiro(float valorJoystick, int velocidad, int canal1, int canal2);
void escribirPWM(int canal, int valor);

#endif