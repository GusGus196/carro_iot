#ifndef FEEDBACK_H
#define FEEDBACK_H

#include <Arduino.h>
#include <PCF8574.h>
#include <Wire.h>

#include "config.h"

//Funciones buzzer
void iniciarBuzzer();
void claxon();
void sonarConfirmacion();
void sonarError();

//funciones LED
void ledRGB(int color[3]);
void ledFreno(float velocidadY, float zonaMuerta);
void direccionales(const char* instruccion);

//Funciones auxiliares LEDs
void ledModo(const String &modo);
void verificarTimeoutLuces();

extern const int intervalo;
extern bool preventivasActivas;  
extern bool direccionalDerActiva;
extern bool direccionalIzqActiva;
#endif