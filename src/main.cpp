#include <Arduino.h>

// Librerías propias
#include "config.h"  
#include "reconnect.h"  
#include "joystick.h"
#include "callback.h"
#include "setup_wifi.h"

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