// Framework
#include <Arduino.h>

// Librerías del proyecto
#include "config.h"  // Variables globales de configuración

#include "buzzer.h" // Funciones para activar el buzzer (claxon y cambio de modo)
#include "callback.h" // Función de callback para manejar mensajes MQTT entrantes
#include "driver.h" // Función para configurar los valores PWM del driver a partir de los valores del joystick
#include "gps.h" // Funciones para utilizar el módulo GPS y establecer la ruta a un destino dado
#include "joystick.h" // Funciones para configurar y leer el joystick
#include "reconnect.h"  // Función para reconectar al broker MQTT
#include "seguidor_linea.h" // Funciones para configurar y ejecutar el seguidor de línea
#include "setup_wifi.h" // Función para configurar la conexión WiFi
#include "ultrasonico.h" // Funciones del sensor ultrasónico (distancia)

void setup() {
  Serial.begin(115200);
  analogReadResolution(8);

  setup_wifi();
  WiFi.setTxPower(WIFI_POWER_19_5dBm);

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  iniciarJoystick(); // Configuración de los motores
  iniciarSeguidor(); // Configuración de los sensores de línea
  iniciarUltrasonico(); // Configuración del sensor ultrasonico
  iniciarGPS(); // Iniciar la comunicación serial con el módulo GY-GPS6MV2
  iniciarBuzzer(); // Configuración del buzzer
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  
  client.loop();
  
  procesarGPS(); // Enviar posición del carro cada 2 segundos

  // Ejecutar lógica según el modo
  if (modo == "control") {
    if (millis() - ultimaVezRecibido > 500) {
      driver(0, 0);
    }
  } else if (modo == "linea") {
    ejecutarSeguidorLinea();
  } else if (modo == "gps") {
    actualizarNavegacion();
  };
}