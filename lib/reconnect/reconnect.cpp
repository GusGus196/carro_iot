#include "reconnect.h"

WiFiClient espClient;
PubSubClient client(espClient);

void reconnect() {
  static unsigned long ultimaReconexion = 0;
  if (!client.connected()) {
    unsigned long ahora = millis();

    if (ahora - ultimaReconexion > 5000) { 
      ultimaReconexion = ahora;
    
      if (client.connect("ESP32Client")) {
        client.subscribe("proyecto/carrito/control/joystick");
        client.subscribe("proyecto/carrito/control/claxon");
        client.subscribe("proyecto/carrito/control/modo");
      }
    }
  }
}