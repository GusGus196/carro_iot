#include "callback.h"

void callback(char* topic, uint8_t* payload, unsigned int length) {
  char mensajeChar[length + 1];
  memcpy(mensajeChar, payload, length);
  mensajeChar[length] = '\0';

  // Serial.print("Topic: "); Serial.print(topic); Serial.print(" Mensaje: "); Serial.println(mensajeChar);
  
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
    modo = String(mensajeChar);
    Serial.print("Modo actualizado: ");
    Serial.println(modo);

    sonarConfirmacion();
  } else if(comando == "sensor") 
  {
    velocidadConstante = mensajeSensor(mensajeChar[0], 0.1f);
  } else if(comando == "destino") {
    actualizarDestino(mensajeChar);
  }
}

/*          ==========================================
            ==========FUNCIONES AUXILIARES============
            ==========================================
*/


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
  
void actualizarDestino(char* mensaje)
{
  String msg = String(mensaje);
  int coma = msg.indexOf(','); // Busca la posición de la coma

  if (coma != -1) {
    // Si encuentra la coma, extrae y convierte las coordenadas
    destinoLatitud = msg.substring(0, coma).toFloat();
    destinoLongitud = msg.substring(coma + 1).toFloat();
    destino = true;
    
    Serial.print("Nuevo destino guardado -> Lat: ");
    Serial.print(destinoLatitud, 6); // Imprime con 6 decimales de precisión
    Serial.print(" Lon: ");
    Serial.println(destinoLongitud, 6);

    sonarConfirmacion();
}
}