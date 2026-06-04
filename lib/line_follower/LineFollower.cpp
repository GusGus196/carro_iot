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

    // Las TCRT5000 emiten LOW sobre blanco (reflectivo) y HIGH sobre negro; se invierte para que 1 = línea detectada
    int s1 = !digitalRead(pinS1);
    int s2 = !digitalRead(pinS2);
    int s3 = !digitalRead(pinS3);
    int s4 = !digitalRead(pinS4);
    int s5 = !digitalRead(pinS5);

    float sumaLecturas = s1 + s2 + s3 + s4 + s5;

    if (sumaLecturas > 0) {
        // Centroide ponderado: da una posición sub-sensor (resolución mayor a 5 puntos discretos)
        float error = (s1 * -1.0f + s2 * -0.45f + s4 * 0.45f + s5 * 1.0f) / sumaLecturas;

        float derivada = (error - _errorAnterior) / dt;

        // KD dinámico: cuando el error se está reduciendo (nos acercamos a la línea), aumentar el damping evita overshoot
        float kD_dinamico = kD;
        if (fabsf(error) < fabsf(_errorAnterior)) {
            kD_dinamico = kD * 1.5f;
        }

        // PD (sin I): en seguidor de línea el error estacionario es cero, por definición siempre corregimos hacia el centro
        float p = kP * error;
        float d = kD_dinamico * derivada * 10.0f;

        float correccion = p + d;

        // Filtro de momentum exponencial: si la línea se pierde (gap en la cinta), el auto mantiene la dirección inercialmente
        // en lugar de detenerse en seco. La constante de 120ms da una Decay natural de ~3 frames
        float factorDecay = expf(-dt / kTiempoDecay_ms);
        _momentum = _momentum * factorDecay + correccion * (1.0f - factorDecay);

        // Reduce velocidad proporcionalmente al error: curvas cerradas = más lento
        float reduccionVelocidad = 1.0f - (fabsf(error) * 0.45f);
        float velActual = velocidadConstante * reduccionVelocidad;

        _errorAnterior = error;

        correccion = constrain(correccion, -1.0f, 1.0f);
        _motor.conducir(correccion, velActual);
    } else {
        // Sin sensores en línea: usar momentum para seguir la dirección previa a media velocidad
        _motor.conducir(_momentum * 0.5f, velocidadConstante * 0.5f);
    }
}