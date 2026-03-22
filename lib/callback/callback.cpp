#include "callback.h"

void callback(char* topic, uint8_t* payload, unsigned int length) {
  Serial.println(">> Mensaje recibido");

  char mensajeChar[length + 1]; 
  memcpy(mensajeChar, payload, length);
  mensajeChar[length] = '\0';

  Serial.print("Topic: "); Serial.print(topic);
  Serial.print(" Mensaje: "); Serial.println(mensajeChar);
  
  if (strcmp(topic, "proyecto/carrito/control/joystick") == 0) {
    joystick(mensajeChar); 
  }

  if(strcmp(topic, "proyecto/carrito/control/claxon") == 0) {
    digitalWrite(pinBuzzer, HIGH);             
    delay(200);
    digitalWrite(pinBuzzer, LOW);             
  }

  if(strcmp(topic, "proyecto/carrito/control/modo") == 0){
    modo = String(mensajeChar);

    Serial.print("Modo actualizado: ");
    Serial.println(modo);
  }

  if(strcmp(topic, "proyecto/carrito/control/sensor") == 0){
    mensajeChar[0] == '1' ? velocidadConstante = 0.4 : velocidadConstante = 0.00;
  }
}