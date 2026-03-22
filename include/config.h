#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// WIFI Y MQTT
extern const char* ssid;
extern const char* password;
extern const char* mqtt_server;

// PINES IN DRV8833
extern const int motorA1;
extern const int motorA2;
extern const int motorB1;
extern const int motorB2;

// CANALES PWM
extern const int canalA1;
extern const int canalA2;
extern const int canalB1;
extern const int canalB2;

extern const int freq;
extern const int resolucion;

// PIN BUZZER
extern const int pinBuzzer;

// VARIABLES DE ESTADO
extern String modo;
extern unsigned long ultimaVezRecibido;

#endif