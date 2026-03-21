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
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}