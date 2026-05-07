#include "callback.h"

void callback(char* topic, uint8_t* payload, unsigned int length) {
  // Crear el documento JSON
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  // Ignoramos el mensaje si hay un error
  if (error) {
    Serial.print(F("Error JSON: "));
    Serial.println(error.f_str());
    return;
  }

  // Filtrar por topic

  if (strcmp(topic, topics.manual) == 0) {
    ultimaVezRecibido = millis();

    float valorX = doc["x"] | 0.0f;
    float valorY = doc["y"] | 0.0f;

    driver(valorX, valorY);

  } else if (strcmp(topic, topics.modo) == 0) {
    const char* nuevoModo = doc["modo"];
    
    if (nuevoModo) {
      modo = String(nuevoModo);
      velocidadConstante = 0.0;
      hayDestino = false;
      accionNavegacion = "";
      errorRumbo = 0.0;
      sonarConfirmacion();
      ledModo(nuevoModo);
      tipo = "off";
    }
}
   else if (strcmp(topic, topics.seguidor) == 0 || strcmp(topic, topics.obstaculos) == 0) {
    bool activo = (doc["accion"] == "activar");
    
    if (strcmp(topic, topics.seguidor) == 0) {
        velocidadConstante = activo ? 0.42 : 0.0;
        momentum = 0;
    } else {
      obstaculos();
    }
  } else if (strcmp(topic, topics.navegacion) == 0) {
    const char* accion = doc["accion"];
    
    if (accion) {
      accionNavegacion = accion;

      if (strcmp(accion, "iniciar") == 0) {
        destinoLat = doc["lat"] | 0.0;
        destinoLon = doc["lon"] | 0.0;
        hayDestino = (destinoLat != 0.0 || destinoLon != 0.0);

      } else if (strcmp(accion, "detener") == 0) {
        hayDestino = false;
        driver(0, 0);

      } else if (strcmp(accion, "reanudar") == 0) {
        hayDestino = true;
      }
    }
  } else if (strcmp(topic, topics.luces) == 0) {
    tipo = doc["tipo"] | "off";
    ultimaVezLuces = millis();
    direccionales(tipo);
    
  } else if (strcmp(topic, topics.claxon) == 0) {
    claxon();
  }
}