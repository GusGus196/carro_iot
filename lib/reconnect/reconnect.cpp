#include "reconnect.h"

WiFiClient espClient;
PubSubClient client(espClient);

void reconnect() {
  static unsigned long ultimaReconexion = 0;
  
  if (!client.connected()) {
    unsigned long ahora = millis();

    if (ahora - ultimaReconexion > 5000) { 
      ultimaReconexion = ahora;

      String clientId = "smartcar-esp32-" + String((uint32_t)ESP.getEfuseMac(), HEX);

      if (client.connect(clientId.c_str())) {
        client.subscribe(topic_modo);
        client.subscribe(topic_joystick);
        client.subscribe(topic_claxon);
        client.subscribe(topic_seguidor);
        client.subscribe(topic_destino);
      }
    }
  }
}