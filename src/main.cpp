// Framework
#include <Arduino.h>

// Librerías del proyecto
#include "config.h"  // Variables globales de configuración

#include "callback.h" // Función de callback para manejar mensajes MQTT entrantes
#include "driver.h" // Función para configurar los valores PWM del driver a partir de los valores del joystick
#include "joystick.h" // Funciones para configurar y leer el joystick
#include "reconnect.h"  // Función para reconectar al broker MQTT
#include "setup_wifi.h" // Función para configurar la conexión WiFi
#include "seguidor_linea.h" // Funciones para configurar y ejecutar el seguidor de línea

void setup() {
  Serial.begin(115200);
  analogReadResolution(8);

  setup_wifi();
  WiFi.setTxPower(WIFI_POWER_19_5dBm);

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  pinMode(pinBuzzer, OUTPUT);

  iniciarJoystick(); // Configuración de los motores
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  
  client.loop();

  // Ejecutar lógica según el modo
  if (modo == "control") {
    if (millis() - ultimaVezRecibido > 500) {
      driver(0, 0);
    }
  } 
  else if (modo == "linea") {
    ejecutarSeguidorLinea();
  } 
  else if (modo == "gps") {
    // Esta función leería el GPS 
  };
}