#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

extern const char* ssid;
extern const char* password;
extern const char* mqtt_server;
extern const int port;

extern const char* topic_modo;
extern const char* topic_joystick;
extern const char* topic_claxon;
extern const char* topic_seguidor;
extern const char* topic_obstaculos;
extern const char* topic_destino;

extern const char* topic_ubicacion;
extern const char* topic_llegada;

extern const int motorA1;
extern const int motorA2;
extern const int motorB1;
extern const int motorB2;

extern const int canalA1;
extern const int canalA2;
extern const int canalB1;
extern const int canalB2;
extern const int canalBuzzer;

extern const int freq;
extern const int resolucion;

extern const int pinBuzzer;
extern const int freqBuzzer;

extern const int trig;
extern const int echo;

extern const int pinS1;
extern const int pinS2;
extern const int pinS3;
extern const int pinS4;
extern const int pinS5;

extern const int sensorVelDer;
extern const int sensorVelIzq;

extern const int gpsRX;
extern const int gpsTX;

extern double destinoLat;
extern double destinoLon;
extern bool hayDestino;

extern double destinoDistancia;
extern double destinoRumbo;
extern double actualRumbo;

extern String modo;
extern unsigned long ultimaVezRecibido;
extern float velocidadConstante;

extern float momentum; 

#endif