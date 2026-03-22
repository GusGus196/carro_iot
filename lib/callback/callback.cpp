#include "callback.h"

String modo; // Valor por defecto

void callback(char* topic, uint8_t* payload, unsigned int length) {
  mensajeTopic(topic);
  
  char mensajeChar[length + 1]; 
  memcpy(mensajeChar, payload, length);
  mensajeChar[length] = '\0';

  if (strcmp(topic, "proyecto/carrito/control/joystick") == 0) {
    joystick(mensajeChar);
  }

  if(strcmp(topic, "proyecto/carrito/control/claxon") == 0){
        digitalWrite(pinBuzzer, HIGH);
        claxonActivo = true;
        tiempoClaxon = millis();
    }

  if(strcmp(topic, "proyecto/carrito/control/modo") == 0){
    mensajeModo(mensajeChar);       
  }

  Serial.println(mensajeChar);
}

void mensajeTopic(char* topic){
  Serial.print("Mensaje recibido en topic: ");
  Serial.println(topic);
  Serial.print(" Mensaje: ");
}

void mensajeModo(char* mensaje) 
{
    modo = String(mensaje);
    Serial.print("Modo cambiado a: ");
    Serial.println(modo);  
}