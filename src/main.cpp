#include <Arduino.h> // Framework

// Librerías del proyecto
#include "config.h" // Variables globales

#include "buzzer.h" // Funciones para activar el buzzer pasivo
#include "callback.h" // Función de callback para manejar mensajes MQTT entrantes
#include "driver.h" // Función para configurar los valores PWM del driver ⁠DRV8833 a partir de la posición del joystick
#include "gps.h" // Funciones para utilizar el módulo GPS y establecer la ruta a un destino dado, publicar en TOPICS ubicación y llegada
#include "joystick.h" // Funciones para iniciar y leer la posición del joystick (posición x,y utilizada por el driver)
#include "reconnect.h" // Función para reconectar al broker MQTT y suscripciones a TOPICS
#include "seguidor_linea.h" // Funciones para configurar los pines del array de sensores reflectivos TCRT5000 y ejecutar el seguidor de línea
#include "setup_wifi.h" // Función para configurar la conexión WiFi
#include "ultrasonico.h" // Funciones del sensor ultrasónico HC-SR04 (inicializar, distancia y distancia filtrada)

void setup() {
  Serial.begin(115200);
  analogReadResolution(8);

  setup_wifi();
  WiFi.setTxPower(WIFI_POWER_19_5dBm);

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  iniciarBuzzer(); // Configuración del canal PWM del buzzer pasivo
  iniciarGPS(); // Iniciar la comunicación serial con el módulo GY-GPS6MV2
  iniciarJoystick(); // Iniciar los canales PWM de los motores del driver
  iniciarSeguidor(); // Configuración de los pines de los sensores reflectivos como input
  iniciarUltrasonico(); // Configuración de los pines del sensor ultrasónico como input (echo) y output (trig)
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  
  client.loop();
  
  // Ejecutar lógica según el modo
  if (modo == "control") {
    if (millis() - ultimaVezRecibido > 500) {
      driver(0, 0); // Detener el smart car si el tiempo del último mensaje recibido es mayor a 500ms por seguridad
    }
  } else if (modo == "linea") {
    ejecutarSeguidorLinea();
  } else if (modo == "gps") {

  }
}