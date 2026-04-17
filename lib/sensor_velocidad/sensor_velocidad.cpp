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

void IRAM_ATTR contarDer() {
    pulsosDer++;
}

void IRAM_ATTR contarIzq() {
    pulsosIzq++;
}

void medirVelocidad() {
    unsigned long ahora = millis();

    if (ahora - ultimoTiempo >= 50) {

        uint32_t pulsosD, pulsosI;

        portENTER_CRITICAL(&mux);
        pulsosD = pulsosDer;
        pulsosI = pulsosIzq;
        pulsosDer = 0;
        pulsosIzq = 0;
        portEXIT_CRITICAL(&mux);

        velocidadDer = (pulsosD / (float)PULSOS_POR_VUELTA) * 600.0;
        velocidadIzq = (pulsosI / (float)PULSOS_POR_VUELTA) * 600.0;

        ultimoTiempo = ahora;
    }
}