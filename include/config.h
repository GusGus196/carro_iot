#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// WiFi
extern const char* ssid;
extern const char* password;

// MQTT
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

// DRV8833 motor
extern const int motorA1;
extern const int motorA2;
extern const int motorB1;
extern const int motorB2;

// LEDC channels
extern const int canalA1;
extern const int canalA2;
extern const int canalB1;
extern const int canalB2;
extern const int canalBuzzer;
extern const int freq;
extern const int resolucion;

// Buzzer
extern const int pinBuzzer;
extern const int freqBuzzer;

// HC-SR04
extern const int trig;
extern const int echo;

// TCRT5000 array
extern const int pinS1;
extern const int pinS2;
extern const int pinS3;
extern const int pinS4;
extern const int pinS5;

// FC-03 encoders
extern const int sensorVelDer;
extern const int sensorVelIzq;

// Neo-6M GPS
extern const int gpsRX;
extern const int gpsTX;

// LED config
struct ConfigLuces {
    int pinR, pinG, pinB;
    int pinLedDer, pinLedIzq;
    int pinFrenoDer, pinFrenoIzq;
    int colorManual[3];
    int colorSeguidor[3];
    int colorObstaculos[3];
    int colorNavegacion[3];
    int colorNull[3];
};
extern const ConfigLuces lucesConf;
extern const unsigned long timeoutLuces;

#endif