#include <Arduino.h>

// Librerías propias
#include "config.h"  // Variables globales de configuración
#include "reconnect.h"  // Función para reconectar al broker MQTT
#include "joystick.h" // Funciones para configurar y leer el joystick
#include "callback.h" // Función de callback para manejar mensajes MQTT entrantes
#include "setup_wifi.h" // Función para configurar la conexión WiFi

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

void loop() {
  // Intentar reconectar sin detener el programa
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Ejecutar lógica según el modo
  if (modo == "control"){
    if (millis() - ultimaVezRecibido > 500) {
      driver(0, 0);
    }
  } 
  else if (modo == "linea") {
     // Esta función leería sensores 
  } 
  else if (modo == "gps") {
    // Esta función leería el GPS 
  }
}