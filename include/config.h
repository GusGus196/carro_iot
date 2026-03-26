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
extern const int canalBuzzer;

extern const int freq;
extern const int resolucion;

// PIN BUZZER
extern const int pinBuzzer;
extern const int freqBuzzer;

// PINES ULTRASONICO
extern const int trig;
extern const int echo;

// PINES REFLECTIVO
extern const int pinS1;
extern const int pinS2;
extern const int pinS3;
extern const int pinS4;
extern const int pinS5;

// PINES GPS
extern const int gpsRX;
extern const int gpsTX;

// VARIABLES DEL GPS
extern float destinoLatitud;
extern float destinoLongitud;
extern bool destino;

// VARIABLES DE ESTADO
extern String modo;
extern unsigned long ultimaVezRecibido;

extern float velocidadConstante;

#endif