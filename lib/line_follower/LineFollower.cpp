#include "LineFollower.h"
#include "MotorDriver.h"

LineFollower::LineFollower(MotorDriver& motor) : _motor(motor) {}

void LineFollower::iniciar() {
    pinMode(pinS1, INPUT);
    pinMode(pinS2, INPUT);
    pinMode(pinS3, INPUT);
    pinMode(pinS4, INPUT);
    pinMode(pinS5, INPUT);
    _tAnterior = millis();
}

void LineFollower::reiniciarMomentum() {
    _momentum = 0;
}

void LineFollower::ejecutar(float velocidadConstante) {
    unsigned long tAhora = millis();
    float dt = (float)(tAhora - _tAnterior);
    _tAnterior = tAhora;

    if (dt < 0.1f || dt > 500.0f) return;

    int s1 = !digitalRead(pinS1);
    int s2 = !digitalRead(pinS2);
    int s3 = !digitalRead(pinS3);
    int s4 = !digitalRead(pinS4);
    int s5 = !digitalRead(pinS5);

    float sumaLecturas = s1 + s2 + s3 + s4 + s5;

    if (sumaLecturas > 0) {
        float error = (s1 * -1.0f + s2 * -0.45f + s4 * 0.45f + s5 * 1.0f) / sumaLecturas;

        float derivada = (error - _errorAnterior) / dt;

        float kD_dinamico = kD;
        if (fabsf(error) < fabsf(_errorAnterior)) {
            kD_dinamico = kD * 1.5f;
        }

        float p = kP * error;
        float d = kD_dinamico * derivada * 10.0f;

        float correccion = p + d;

        float factorDecay = expf(-dt / kTiempoDecay_ms);
        _momentum = _momentum * factorDecay + correccion * (1.0f - factorDecay);

        float reduccionVelocidad = 1.0f - (fabsf(error) * 0.45f);
        float velActual = velocidadConstante * reduccionVelocidad;

        _errorAnterior = error;

        correccion = constrain(correccion, -1.0f, 1.0f);
        _motor.conducir(correccion, velActual);
    } else {
        _motor.conducir(_momentum * 0.5f, velocidadConstante * 0.5f);
    }
}