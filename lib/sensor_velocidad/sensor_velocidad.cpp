#include "sensor_velocidad.h"

volatile uint32_t pulsosDer = 0;
volatile uint32_t pulsosIzq = 0;

portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;

unsigned long ultimoTiempo = 0;
float velocidadDer = 0;
float velocidadIzq = 0;

const int PULSOS_POR_VUELTA = 20;

void iniciarSensoresVelocidad() {
    pinMode(sensorVelDer, INPUT);
    pinMode(sensorVelIzq, INPUT);

    attachInterrupt(digitalPinToInterrupt(sensorVelDer), contarDer, RISING);
    attachInterrupt(digitalPinToInterrupt(sensorVelIzq), contarIzq, RISING);
}

// Usar portMUX dentro de la ISR para ESP32 (correcto para multicore)
void IRAM_ATTR contarDer() {
    portENTER_CRITICAL_ISR(&mux);
    pulsosDer++;
    portEXIT_CRITICAL_ISR(&mux);
}

void IRAM_ATTR contarIzq() {
    portENTER_CRITICAL_ISR(&mux);
    pulsosIzq++;
    portEXIT_CRITICAL_ISR(&mux);
}

void medirVelocidad() {
    unsigned long ahora = millis();
    unsigned long delta = ahora - ultimoTiempo;

    if (delta >= 120) {

        uint32_t pulsosD, pulsosI;

        portENTER_CRITICAL(&mux);
        pulsosD = pulsosDer;
        pulsosI = pulsosIzq;
        pulsosDer = 0;
        pulsosIzq = 0;
        portEXIT_CRITICAL(&mux);

        // Calcular RPM usando el delta real en lugar de asumir exactamente 50ms
        // RPM = (pulsos / pulsos_por_vuelta) / (delta_ms / 60000)
        float minutos = delta / 60000.0f;
        velocidadDer = (pulsosD / (float)PULSOS_POR_VUELTA) / minutos;
        velocidadIzq = (pulsosI / (float)PULSOS_POR_VUELTA) / minutos;

        ultimoTiempo = ahora;
    }
}

// Llamar cuando el carrito se detiene para limpiar pulsos acumulados
// Evita que la primera corrección al arrancar use datos de la parada anterior
void resetearVelocidades() {
    portENTER_CRITICAL(&mux);
    pulsosDer = 0;
    pulsosIzq = 0;
    portEXIT_CRITICAL(&mux);
    velocidadDer = 0;
    velocidadIzq = 0;
}