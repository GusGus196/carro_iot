#include "config.h"

const char* ssid = "gusgus";
const char* password = "gusgus19++";
const char* mqtt_server = "broker.hivemq.com";

const int motorA1 = 18;
const int motorA2 = 19;
const int motorB1 = 21;
const int motorB2 = 22;

const int canalA1 = 0;
const int canalA2 = 1;
const int canalB1 = 2;
const int canalB2 = 3;
const int canalBuzzer = 4;

const int freq = 5000;
const int resolucion = 8;

const int pinBuzzer = 5;
const int freqBuzzer = 2000;

const int trig = 14;
const int echo = 23;

const int pinS1 = 32;
const int pinS2 = 33;
const int pinS3 = 25;
const int pinS4 = 26;
const int pinS5 = 27;

const int gpsRX = 16;
const int gpsTX = 17;

String modo = "indefinido";
unsigned long ultimaVezRecibido = 0;

float velocidadConstante = 0.00;