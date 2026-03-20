#ifndef JOYSTICK_H
#define JOYSTICK_H
#include <Arduino.h>

#define motorA1 18
#define motorA2 19
#define motorB1 21
#define motorB2 22

// Declaramos que las variables existen en otro lado
extern float valorX;
extern float valorY;

// Canales
const int canalA1 = 0;
const int canalA2 = 1;
const int canalB1 = 2;
const int canalB2 = 3;

const int freq = 5000; 
const int resolucion = 8;


void iniciarJoystick();

void joystick(char* mensaje);
#endif