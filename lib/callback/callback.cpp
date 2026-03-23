#include "callback.h"

void callback(char* topic, uint8_t* payload, unsigned int length) {
  char mensajeChar[length + 1]; 
  memcpy(mensajeChar, payload, length);
  mensajeChar[length] = '\0';

  mensajeTopic(topic, mensajeChar);
  String comando = extraerComando(topic);
  if (comando == "joystick") 
  {
    joystick(mensajeChar); 
  } else if(comando == "claxon") 
  {
    claxon();             
  } else if(comando == "modo")
  {
    sonarConfirmacion();       
  } else if(comando == "sensor")
  {
    velocidadConstante = mensajeSensor(mensajeChar[0], 0.4f);
  }
  
  Serial.println(mensajeChar);

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

//ingresamos el valor que queremos en el mensaje en el if es
//mensajeChar[0], si es igual a '1' asignamos la velocidad deseada, sino 0.
float mensajeSensor(char mensaje, float velocidadDeseada) {
    return (mensaje == '1') ? velocidadDeseada : 0.00f;
  }

void mensajeTopic(char* topic, char* mensajeChar){
  Serial.print("Topic: "); 
  Serial.print(topic); 
  Serial.print(" Mensaje: "); 
  Serial.println(mensajeChar);
}
  