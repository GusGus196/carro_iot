#include "callback.h"


void callback(char* topic, uint8_t* payload, unsigned int length) {
  Serial.print("Mensaje recibido en topic: ");
  Serial.println(topic);
  Serial.print(" Mensaje: ");
    
  char mensajeChar[length + 1]; 
  memcpy(mensajeChar, payload, length);
  mensajeChar[length] = '\0';

  if (strcmp(topic, "proyecto/carrito/control/joystick") == 0) {
    joystick(mensajeChar);
  }

  if(strcmp(topic, "proyecto/carrito/control/claxon") == 0){
    digitalWrite(pinBuzzer, HIGH);            
    delay(1000);
    digitalWrite(pinBuzzer, LOW);            
  }

  Serial.println(mensajeChar);
}