#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

#include "config.h"
void iniciarBuzzer();
void claxon();
void sonarConfirmacion();
void sonarError();
void ledRGB(int color[3]);
void direccionales(int velocidadX);
void parpadeo(int pinLed);
bool ledFreno(int velocidadY);

extern const int tolerancia;
extern const int intervalo;
#endif