#ifndef DRIVER_H
#define DRIVER_H

#include <Arduino.h>

#include "config.h"
#include "sensor_velocidad.h"
#include "buzzer.h"
// Compensación utilizada para igualar potencia de los motores DC
extern const float compensacionIzquierda;
extern const float compensacionDerecha;

// Zona muerta del joystick
extern const float zonaMuerta;

// Valor PWM mínimos y máximos para activar el motor DC
extern const int minPWM;
extern const int maxPWM;
extern const int rangoPWM;

extern const float Kp;

extern const float biasForward;
extern const float biasReverse;

void iniciarDriver();
void driver(float valorX, float valorY);
int calibrarMotor(float motor);
float compensarMotor(float compensacion, float motor);
void aplicarGiro(float valorJoystick, int velocidad, int canal1, int canal2);
void escribirPWM(int canal, int valor);

#endif