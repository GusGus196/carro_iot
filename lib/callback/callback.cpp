#include "callback.h"

void callback(char* topic, uint8_t* payload, unsigned int length) {
  mensajeTopic(topic);
  
  Serial.println(">> Mensaje recibido");

  char mensajeChar[length + 1]; 
  memcpy(mensajeChar, payload, length);
  mensajeChar[length] = '\0';

  Serial.print("Topic: "); Serial.print(topic);
  Serial.print(" Mensaje: "); Serial.println(mensajeChar);
  String comando = extraerComando(topic);
  if (comando == "joystick") 
  {
    joystick(mensajeChar); 
  } else if(comando == "claxon") 
  {
    digitalWrite(pinBuzzer, HIGH);             
    delay(200);
    digitalWrite(pinBuzzer, LOW);             
  } else if(comando == "modo")
  {
    mensajeModo(mensajeChar);       
  } else if(comando == "sensor")
  {
    mensajeChar[0] == '1' ? velocidadConstante = 0.4 : velocidadConstante = 0.00;
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
    Serial.print("Modo actualizado: ");
    Serial.println(modo);
}

// Esta función recibe el topic completo y devuelve solo el final
String extraerComando(const char* topicCompleto) {
  String tema = String(topicCompleto);
  int ultimaDiagonal = tema.lastIndexOf('/');
  
  // Corta y devuelve todo lo que está después de la última '/'
  return tema.substring(ultimaDiagonal + 1);
}