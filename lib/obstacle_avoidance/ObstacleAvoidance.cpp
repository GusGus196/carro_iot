#include "ObstacleAvoidance.h"
#include "MotorDriver.h"
#include "UltrasonicSensor.h"

ObstacleAvoidance::ObstacleAvoidance(MotorDriver& motor, UltrasonicSensor& sonic)
    : _motor(motor), _sonic(sonic) {}

void ObstacleAvoidance::actualizar(float velocidadConstante) {
    float obstaculo = _sonic.leerFiltrado();
    if (obstaculo == 0) obstaculo = 400;

    unsigned long ahora = millis();

    switch (_estado) {
        case AVANZAR:
            if (obstaculo < OBSTACULO_DISTANCIA && obstaculo > 2) {
                _estado = RETROCEDER;
                _tiempoEstado = ahora;
            }
            break;

        case RETROCEDER:
            if (ahora - _tiempoEstado > TIEMPO_RETROCEDER) {
                _estado = GIRAR;
                _tiempoEstado = ahora;
            }
            break;

        case GIRAR:
            if (ahora - _tiempoEstado > TIEMPO_GIRAR) {
                _estado = AVANZAR;
            }
            break;
    }

    switch (_estado) {
        case AVANZAR:
            _motor.conducir(0, velocidadConstante);
            break;

        case RETROCEDER:
            _motor.conducir(0, velocidadConstante * -1);
            break;

        case GIRAR:
            _motor.conducir(0.20f, 0.25f);
            break;
    }
}