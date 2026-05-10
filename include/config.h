#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

extern const char* ssid;
extern const char* password;
extern const char* mqtt_server;
extern const int port;

struct Topics {
    const char* manual;
    const char* seguidor;
    const char* obstaculos;
    const char* navegacion;

    const char* modo;
    const char* claxon;
    const char* luces;
    
    const char* ubicacion;
};

extern const Topics topics;

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

extern float velocidadConstante;
extern float momentum;

extern const int sensorVelDer;
extern const int sensorVelIzq;

extern const int gpsRX;
extern const int gpsTX;

extern double destinoLat;
extern double destinoLon;
extern bool estadoNav;

extern const char* accionNav;

extern double errorRumbo;

extern String modo;
extern unsigned long ultimaVezRecibido;

extern const char* tipo;

struct ConfigLuces { 
    int pinR;
    int pinG;
    int pinB;
    int pinLedDer;
    int pinLedIzq;
    int pinFrenoDer;
    int pinFrenoIzq;
   
    int colorManual[3];
    int colorSeguidor[3];
    int colorObstaculos[3];
    int colorNavegacion[3];
    int colorNull[3];
};

extern const ConfigLuces lucesConf;

extern unsigned long ultimaVezLuces;
extern const unsigned long timeoutLuces; 
#endif