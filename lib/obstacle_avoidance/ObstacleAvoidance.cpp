#include "ObstacleAvoidance.h"
#include "MotorDriver.h"
#include "UltrasonicSensor.h"

ObstacleAvoidance::ObstacleAvoidance(MotorDriver& motor, UltrasonicSensor& sonic)
    : _motor(motor), _sonic(sonic) {}

// Máquina de estados de 3 fases: avanzar, retroceder, girar y luego avanzar
// Es el mínimo necesario para esquivar obstáculos sin atascarse: retroceder evita rozar el objeto, girar cambia el rumbo, avanzar retoma la marcha
void ObstacleAvoidance::actualizar(float velocidadConstante) {
    // pulseIn timeout retorna 0 cuando no hay eco; se interpreta como "sin obstáculo" (400 cm está fuera del rango útil del HC-SR04)
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
            // Giro suave combinando avance lento + dirección para que el giro sea amplio y no pivote sobre el mismo punto
            _motor.conducir(0.20f, 0.25f);
            break;
    }
}