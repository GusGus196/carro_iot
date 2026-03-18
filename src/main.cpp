#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

// Pines de motores DRV8833
#define motorA1 18
#define motorA2 19
#define motorB1 21
#define motorB2 22

// Buzzer
#define pinBuzzer 5

const int freq = 5000; 
const int resolucion = 8;

// Valores de motores desde el joystick
float valorX = 0;
float valorY = 0;

// Datos de la red Wifi o Hotspot
const char* ssid = "gusgus";
const char* password = "gusgus19++";

// Host para Broker
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {

  Serial.begin(115200);
  analogReadResolution(8);

  setup_wifi();
  WiFi.setTxPower(WIFI_POWER_19_5dBm);

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  ledcAttach(motorA1, freq, resolucion);
  ledcAttach(motorA2, freq, resolucion);
  ledcAttach(motorB1, freq, resolucion);
  ledcAttach(motorB2, freq, resolucion);

  pinMode(pinBuzzer, OUTPUT);

}

void joystick(char* mensaje){ 
  char* ptr = strtok(mensaje, ",");

  if (ptr != NULL) {
    valorX = atof(ptr); 
    ptr = strtok(NULL, ",");
    if (ptr != NULL) valorY = atof(ptr);
  }

  // Mezcla diferencial
  float motorIzquierdo = valorY + valorX;
  float motorDerecho = valorY - valorX;

  motorIzquierdo = constrain(motorIzquierdo, -1.0, 1.0);
  motorDerecho = constrain(motorDerecho, -1.0, 1.0);

  int valorA1 = 0, valorA2 = 0, valorB1 = 0, valorB2 = 0;
  int velocidadA = 0;
  int velocidadB = 0;

  // --- CALIBRACIÓN DE ARRANQUE (Aumentamos de 90 a 115) ---
  // Si con 115 sale muy disparado, baja a 100. Si sigue sin moverse, sube a 130.
  if (abs(motorIzquierdo) > 0.1) {
    velocidadA = map(abs(motorIzquierdo * 100), 10, 100, 115, 255); 
  }
  
  if (abs(motorDerecho) > 0.1) {
    velocidadB = map(abs(motorDerecho * 100), 10, 100, 115, 255);
  }

  // --- COMPENSACIÓN DE MOTORES ---
  // Si el motor Derecho (B) es más débil, le multiplicamos por un factor (ej: 1.15)
  // OJO: Ajusta este número hasta que el carro camine recto.
  float compensacionDerecha = 1.20; 
  velocidadB = constrain(velocidadB * compensacionDerecha, 0, 255);

  // MOTOR IZQUIERDO (A)
  if (motorIzquierdo > 0.1) {
    valorA1 = 0;    valorA2 = velocidadA;
  } else if (motorIzquierdo < -0.1) {
    valorA1 = velocidadA; valorA2 = 0;
  }

  // MOTOR DERECHO (B)
  if (motorDerecho > 0.1) {
    valorB1 = 0;    valorB2 = velocidadB;
  } else if (motorDerecho < -0.1) {
    valorB1 = velocidadB; valorB2 = 0;
  }

  ledcWrite(motorA1, valorA1);
  ledcWrite(motorA2, valorA2);
  ledcWrite(motorB1, valorB1);
  ledcWrite(motorB2, valorB2);
}

void setup_wifi() {

  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {

  Serial.print("Mensaje recibido en topic: ");
  Serial.println(topic);
  Serial.print(" Mensaje: ");
  
  char mensajeChar[length + 1]; 
  memcpy(mensajeChar, payload, length);
  mensajeChar[length] = '\0';

  if (strcmp(topic, "proyecto/carrito/control/joystick") == 0) {
    joystick(mensajeChar);
  }

  if(strcmp(topic, "proyecto/carrito/control/claxon") == 0){
    digitalWrite(pinBuzzer, HIGH);            
    delay(1000);
    digitalWrite(pinBuzzer, LOW);            
  }

  Serial.println(mensajeChar);
}

void reconnect() {

  while (!client.connected()) {

    Serial.print("Conectando a MQTT...");

    if (client.connect("ESP32Client_Gus")) {
      Serial.println("conectado");
      client.subscribe("proyecto/carrito/control/joystick");
      client.subscribe("proyecto/carrito/control/claxon");

    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" intentando otra vez en 5 segundos");

      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}