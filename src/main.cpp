#include <Arduino.h> // Framework

// Librerías del proyecto
#include "config.h" // Variables globales

#include "feedback.h" // Funciones para activar el buzzer pasivo
#include "callback.h" // Función de callback para manejar mensajes MQTT entrantes
#include "driver.h" // Función para configurar los valores PWM del driver
#include "gps.h" // Funciones para utilizar el modo navegacion
#include "reconnect.h" // Función para reconectar al broker MQTT y suscripciones a TOPICS
#include "seguidor_linea.h" // Funciones para configurar los pines del array de sensores reflectivos TCRT5000 y ejecutar el seguidor de línea
#include "setup_wifi.h" // Función para configurar la conexión WiFi
#include "ultrasonico.h" // Funciones del sensor ultrasónico HC-SR04 (inicializar, distancia y distancia filtrada)
#include "sensor_velocidad.h" // Funciones para los sensores de velocidad

void setup() {
  Serial.begin(115200);
  analogReadResolution(8);

  setup_wifi();
  WiFi.setTxPower(WIFI_POWER_19_5dBm);

  client.setServer(mqtt_server, port);
  client.setCallback(callback);
  Wire.begin(21, 22);
  Wire.setClock(400000);
  iniciarBuzzer(); // Configuración del canal PWM del buzzer pasivo
  iniciarGPS(); // Iniciar la comunicación serial con el módulo GY-GPS6MV2
  iniciarDriver(); // Iniciar los canales PWM de los motores del driver
  iniciarSeguidor(); // Configuración de los pines de los sensores reflectivos como input
  iniciarUltrasonico(); // Configuración de los pines del sensor ultrasónico como input (echo) y output (trig)
  iniciarSensoresVelocidad(); // Configuración de los pines de los sensores de velocidad.
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  
  client.loop();

  enviarUbicacion(); // Enviar ubicación al controlador web siempre
  medirVelocidad();
  
  // Ejecutar lógica según el modo
  if (modo == "manual") {
    if (millis() - ultimaVezRecibido > 500) {
      driver(0, 0); // Detener el smart car si el último mensaje fue recibido hace más de 500ms por seguridad
    }
    if (millis() - ultimaVezLuces > timeoutLuces) {
        direccionales("off");
    }
  } else if (modo == "seguidor") {
    if (velocidadConstante > 0.0) {
      ejecutarSeguidorLinea();
    } else {
      driver(0, 0);
    }

  } else if (modo == "obstaculos") {
    if (velocidadConstante > 0.0) {
      evitarObstaculos();
    } else {
      driver(0, 0);
    }

  } else if (modo == "navegacion") {
    if(gps.location.isValid()) {
      actualizarNavegacion();
    } else {
      driver(0, 0);
    }

  } else {
    driver(0, 0);
  }
}