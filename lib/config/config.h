#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// --- WIFI Y MQTT ---
extern const char* ssid;
extern const char* password;
extern const char* mqtt_server;

// --- PINES ---
extern const int pinBuzzer;
extern const int motorA1;
extern const int motorA2;
extern const int motorB1;
extern const int motorB2;

// --- PWM ---
extern const int canalA1;
extern const int canalA2;
extern const int canalB1;
extern const int canalB2;
extern const int freq;
extern const int resolucion;

extern String modo;
extern unsigned long ultimaVezRecibido;

// Sensores de linea
extern const int pinS1, pinS2, pinS3, pinS4, pinS5;

#endif