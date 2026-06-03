#include "SpeedSensor.h"

volatile uint32_t SpeedSensor::_pulsosDer = 0;
volatile uint32_t SpeedSensor::_pulsosIzq = 0;

SpeedSensor::SpeedSensor(int pinLeft, int pinRight)
    : _pinLeft(pinLeft), _pinRight(pinRight) {}

void SpeedSensor::iniciar() {
    pinMode(_pinLeft, INPUT);
    pinMode(_pinRight, INPUT);
    attachInterrupt(digitalPinToInterrupt(_pinRight), contarDer, RISING);
    attachInterrupt(digitalPinToInterrupt(_pinLeft), contarIzq, RISING);
}

void IRAM_ATTR SpeedSensor::contarDer() {
    _pulsosDer++;
}

void IRAM_ATTR SpeedSensor::contarIzq() {
    _pulsosIzq++;
}

void SpeedSensor::medir() {
    unsigned long ahora = millis();
    unsigned long delta = ahora - _ultimoTiempo;
    if (delta >= 120) {
        uint32_t pulsosD = _pulsosDer;
        uint32_t pulsosI = _pulsosIzq;
        _pulsosDer = 0;
        _pulsosIzq = 0;
        float minutos = delta / 60000.0f;
        _velocidadDer = (pulsosD / (float)PULSOS_POR_VUELTA) / minutos;
        _velocidadIzq = (pulsosI / (float)PULSOS_POR_VUELTA) / minutos;
        _ultimoTiempo = ahora;
    }
}

void SpeedSensor::reiniciar() {
    _pulsosDer = 0;
    _pulsosIzq = 0;
    _velocidadDer = 0;
    _velocidadIzq = 0;
}

float SpeedSensor::obtenerVelocidadIzq() const { return _velocidadIzq; }
float SpeedSensor::obtenerVelocidadDer() const { return _velocidadDer; }