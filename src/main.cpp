#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include "joystick.h"

// Buzzer
#define pinBuzzer 5

// Datos de la red Wifi o Hotspot
const char* ssid = "gusgus";
const char* password = "gusgus19++";

// Host para Broker
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

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

void setup() {

  Serial.begin(115200);
  analogReadResolution(8);

  setup_wifi();
  WiFi.setTxPower(WIFI_POWER_19_5dBm);

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);


  pinMode(pinBuzzer, OUTPUT);

  // Llamamos a la configuración de los motores desde aquí
  iniciarJoystick();
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