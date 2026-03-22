#include "reconnect.h"

WiFiClient espClient;
PubSubClient client(espClient);

void reconnect() {
  static unsigned long ultimaReconexion = 0;
  if (!client.connected()) {
    unsigned long ahora = millis();

    if (ahora - ultimaReconexion > 5000) { 
      ultimaReconexion = ahora;

      String clientId = "ESP32Client_" + String((uint32_t)ESP.getEfuseMac(), HEX);

      if (client.connect(clientId.c_str())) {
        client.subscribe("proyecto/carrito/control/joystick");
        client.subscribe("proyecto/carrito/control/claxon");
        client.subscribe("proyecto/carrito/control/modo");
        client.subscribe("proyecto/carrito/estado/ubicacion");
        client.subscribe("proyecto/carrito/control/sensor");
      }
    }
  }
}