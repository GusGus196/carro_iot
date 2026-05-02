#include "reconnect.h"

WiFiClient espClient;
PubSubClient client(espClient);

void reconnect() {
  static unsigned long ultimaReconexion = 0;
  
  if (!client.connected()) {
    unsigned long ahora = millis();

    if (ahora - ultimaReconexion > 5000) { 
      ultimaReconexion = ahora;

      String clientId = "smartcar-" + String((uint32_t)ESP.getEfuseMac(), HEX);

      if (client.connect(clientId.c_str())) {
        client.subscribe(topics.manual);
        client.subscribe(topics.seguidor);
        client.subscribe(topics.obstaculos);
        client.subscribe(topics.navegacion);
        client.subscribe(topics.modo);
        client.subscribe(topics.claxon);
        client.subscribe(topics.luces);
      }
    }
  }
}