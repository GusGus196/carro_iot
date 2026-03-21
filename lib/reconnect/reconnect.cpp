#include "reconnect.h"

WiFiClient espClient;
PubSubClient client(espClient);

void reconnect() {

  while (!client.connected()) {

    Serial.print("Conectando a MQTT...");

    if (client.connect("ESP32Client_Gus")) {
      Serial.println("conectado");
      client.subscribe("proyecto/carrito/control/joystick");
      client.subscribe("proyecto/carrito/control/claxon");
      client.subscribe("proyecto/carrito/control/modo");

    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" intentando otra vez en 5 segundos");

      delay(5000);
    }
  }
}