#include "config.h"

// Variables de configuración WIFI y MQTT
const char* ssid = "";
const char* password = "";
const char* mqtt_server = "broker.hivemq.com";

// TOPICS MQTT de entrada (subscribe)
const char* topic_modo = "smartcar/control/modo";
const char* topic_joystick = "smartcar/control/joystick";
const char* topic_claxon = "smartcar/control/claxon";
const char* topic_seguidor = "smartcar/control/seguidor";
const char* topic_destino = "smartcar/control/destino";

// TOPICS MQTT de salida (publish)
const char* topic_ubicacion = "smartcar/estado/ubicacion";
const char* topic_llegada = "smartcar/estado/llegada";

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

// Pines del módulo GPS GY-GPS6MV2
const int gpsRX = 16;
const int gpsTX = 17;

// Variables del modo 'navegación GPS'
double destinoLat = 0.0;
double destinoLon = 0.0;
bool hayDestino = false;

double destinoDistancia = 0.0;
double destinoRumbo = 0.0;
double actualRumbo = 0.0;

// Variables para punto A (anterior)
double latAnterior = 0.0;
double lonAnterior = 0.0;

bool primeraLecturaRealizada = false; // Bandera para omitir la primer lectura
bool comandoEnviado = false; // Enviar una sola instrucción al driver
unsigned long ultimoRumboCalculado = 0;

// Variables de estado
String modo = "indefinido"; // Modo seleccionado (control, linea o gps)
unsigned long ultimaVezRecibido = 0; // Última vez recibido un mensaje MQTT para joystick
float velocidadConstante = 0.00; // Velocidad constante para modo 'seguidor de línea'