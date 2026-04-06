#include "callback.h"

void callback(char* topic, uint8_t* payload, unsigned int length) {
  char mensajeChar[length + 1];
  memcpy(mensajeChar, payload, length);
  mensajeChar[length] = '\0';

  // Test: Serial.print(topic); Serial.print(": "); Serial.println(mensajeChar);

  if (strcmp(topic, topic_modo) == 0) {
    modo = String(mensajeChar);
    velocidadConstante = 0.0; // Reiniciar la velocidad del modo 'seguidor de línea' a 0
    hayDestino = false; // Reiniciar el destino del modo 'navegación GPS'

    sonarConfirmacion();

  } else if (strcmp(topic, topic_joystick) == 0) {
    procesarJoystick(mensajeChar);

  } else if (strcmp(topic, topic_claxon) == 0) {
    claxon();
  
  } else if (strcmp(topic, topic_seguidor) == 0) {
    mensajeChar[0] == '1' ? velocidadConstante = 0.2 : velocidadConstante = 0.0;

  } else if (strcmp(topic, topic_destino) == 0) {
    String msg = String(mensajeChar);
    int coma = msg.indexOf(','); // posición de la coma, si no encuentra retorna -1

    if(coma != -1) {
      String stringLat = msg.substring(0, coma);
      String stringLon = msg.substring(coma + 1);

      destinoLat = stringLat.toDouble();
      destinoLon = stringLon.toDouble();
      hayDestino = true;

      sonarConfirmacion();
    }
  }
}