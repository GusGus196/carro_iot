#include "config.h"

// Variables de configuración WIFI y MQTT
const char* ssid = "";
const char* password = "";
const char* mqtt_server = "broker.hivemq.com";
const int port = 1883;

const Topics topics = {
    .manual = "smartcar/modo/manual",
    .seguidor = "smartcar/modo/seguidor",
    .obstaculos = "smartcar/modo/obstaculos",
    .navegacion = "smartcar/modo/navegacion",

    .modo = "smartcar/accion/modo",
    .claxon = "smartcar/accion/claxon",
    .luces = "smartcar/accion/luces",

    .ubicacion = "smartcar/estado/ubicacion"
};

// Pines del driver DRV8833
const int motorA1 = 18; // Motor izquierdo
const int motorA2 = 19;

const int motorB1 = 21; // Motor derecho
const int motorB2 = 22;

// Canales PWM del ESP32
const int canalA1 = 0; 
const int canalA2 = 1;
const int canalB1 = 2;
const int canalB2 = 3;
const int canalBuzzer = 4;

const int freq = 5000;
const int resolucion = 8;

// Pin y frecuencia del buzzer pasivo
const int pinBuzzer = 5;
const int freqBuzzer = 2000;

// Pines del sensor ultrasónico HC-SR04
const int trig = 14;
const int echo = 23;

// Pines del array de 5 sensores reflectivos TCRT5000
const int pinS1 = 32;
const int pinS2 = 33;
const int pinS3 = 25;
const int pinS4 = 26;
const int pinS5 = 27;

// Sensores de velocidad
const int sensorVelDer = 34;
const int sensorVelIzq = 35;

// Pines del módulo GPS GY-GPS6MV2
const int gpsRX = 16;
const int gpsTX = 17;

// Variables del modo 'navegación GPS'
double destinoLat = 0.0;
double destinoLon = 0.0;
bool hayDestino = false;

const char* accionNavegacion = "";

double destinoDistancia = 0.0;
double destinoRumbo = 0.0;
double actualRumbo = 0.0;
double errorRumbo = 0.0;

float momentum = 0;

// Variables de estado
String modo = "indefinido"; // Modo seleccionado (control, linea o gps)
unsigned long ultimaVezRecibido = 0; // Última vez recibido un mensaje MQTT para joystick
float velocidadConstante = 0.00; // Velocidad constante para modo 'seguidor de línea'

const char* tipo = "";
//pines LEDS
const ConfigLuces lucesConf { 
    .pinR = 0,
    .pinG = 1,
    .pinB = 2,
    .pinLedDer = 4,
    .pinLedIzq = 3,
    .pinFrenoDer = 5,
    .pinFrenoIzq = 6,
    .colorManual = {0, 1, 0},
    .colorSeguidor = {0, 1, 0},
    .colorObstaculos = {1, 0, 1},
    .colorNavegacion = {1, 1, 1},
    .colorNull = {1,0,0}
};
