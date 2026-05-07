#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>
#include <PCF8574.h>
#include <Wire.h>

#include "config.h"
//Funciones buzzer
void iniciarBuzzer();
void claxon();
void sonarConfirmacion();
void sonarError();

//funciones Led
void ledRGB(int color[3]);
void ledFreno(float velocidadY, int zonaMuerta);
void direccionales(const char* instruccion);

//Funciones auxiliares leds
void ledModo(const String &modo);
void verificarTimeoutLuces();

extern const int intervalo;
extern bool preventivasActivas;  
extern bool direccionalDerActiva;
extern bool direccionalIzqActiva;
#endif