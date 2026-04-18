#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

#include "config.h"
//Funciones buzzer
void iniciarBuzzer();
void claxon();
void sonarConfirmacion();
void sonarError();

//funciones Led
void ledRGB(int color[3]);
bool ledFreno(int velocidadY);
void direccionales(String velocidadX);

//Funciones auxiliares leds
void parpadeoDirec(int pinLed);
void parpadeoInter(int pinLed1, int pinLed2);

extern const int intervalo;
extern bool preventivasActivas = false;
extern bool direccionalDerActiva = false;
extern bool direccionalIzqActiva = false;
#endif