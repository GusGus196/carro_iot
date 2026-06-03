#include "MotorDriver.h"
#include "SpeedSensor.h"

int MotorDriver::_ultimoPWM[16] = {-1};

MotorDriver::MotorDriver() {}

void MotorDriver::iniciar() {
    ledcSetup(canalA1, freq, resolucion);
    ledcSetup(canalA2, freq, resolucion);
    ledcSetup(canalB1, freq, resolucion);
    ledcSetup(canalB2, freq, resolucion);

    ledcAttachPin(motorA1, canalA1);
    ledcAttachPin(motorA2, canalA2);
    ledcAttachPin(motorB1, canalB1);
    ledcAttachPin(motorB2, canalB2);
}

void MotorDriver::asignarSensorVelocidad(SpeedSensor* sensor) {
    _speedSensor = sensor;
}

float MotorDriver::obtenerUltimoY() const {
    return _lastY;
}

int MotorDriver::calcularPWM(float motor) {
    float valor = abs(motor);
    if (valor > ZONA_MUERTA) {
        return minPWM + (int)(valor * rangoPWM);
    }
    return 0;
}

void MotorDriver::aplicarGiro(float valorJoystick, int velocidad, int canal1, int canal2) {
    int valor1 = 0;
    int valor2 = 0;

    if (valorJoystick > ZONA_MUERTA) {
        valor1 = 0;
        valor2 = velocidad;
    } else if (valorJoystick < -ZONA_MUERTA) {
        valor1 = velocidad;
        valor2 = 0;
    }

    escribirPWM(canal1, valor1);
    escribirPWM(canal2, valor2);
}

void MotorDriver::escribirPWM(int canal, int valor) {
    if (_ultimoPWM[canal] != valor) {
        ledcWrite(canal, valor);
        _ultimoPWM[canal] = valor;
    }
}

void MotorDriver::conducir(float valorX, float valorY) {
    _lastY = valorY;

    float motorIzquierdo = valorY + valorX;
    float motorDerecho   = valorY - valorX;

    motorIzquierdo = constrain(motorIzquierdo, -1.0f, 1.0f);
    motorDerecho   = constrain(motorDerecho, -1.0f, 1.0f);

    if (_speedSensor != nullptr) {
        float velIzq = _speedSensor->obtenerVelocidadIzq();
        float velDer = _speedSensor->obtenerVelocidadDer();
        float velPromedio = (velIzq + velDer) / 2.0f;

        bool enLineaRecta  = (abs(valorX) < 0.05f) && (abs(valorY) > ZONA_MUERTA);
        bool hayMovimiento = (velIzq > MIN_RPM_CORRECCION && velDer > MIN_RPM_CORRECCION);

        if (enLineaRecta && hayMovimiento) {
            unsigned long ahora = millis();
            float dt = constrain((ahora - _ultimaCorreccion) / 1000.0f, 0.0f, 0.2f);
            _ultimaCorreccion = ahora;

            float error = velIzq - velDer;
            if (abs(error) < ERROR_DEADBAND_RPM) {
                error = 0.0f;
            }

            float factorVelocidad = constrain(velPromedio / (MIN_RPM_CORRECCION * 4.0f), 0.0f, 1.0f);
            float KiEfectivo = Ki * factorVelocidad;

            _integralError += error * dt;
            _integralError  = constrain(_integralError, -integralMax / Ki, integralMax / Ki);

            float correccion = (Kp * error) + (KiEfectivo * _integralError);

            motorIzquierdo -= correccion;
            motorDerecho   += correccion;

            float factorJoystick = abs(valorY);
            if (valorY > 0) {
                motorDerecho -= biasForward * factorJoystick;
            } else if (valorY < 0) {
                motorDerecho += biasReverse * factorJoystick;
            }

            motorIzquierdo = constrain(motorIzquierdo, -1.0f, 1.0f);
            motorDerecho   = constrain(motorDerecho, -1.0f, 1.0f);
        } else {
            _integralError    = 0.0f;
            _ultimaCorreccion = millis();
        }
    }

    int velocidadIzqPWM = calcularPWM(motorIzquierdo);
    int velocidadDerPWM = calcularPWM(motorDerecho);

    aplicarGiro(motorIzquierdo, velocidadIzqPWM, canalA1, canalA2);
    aplicarGiro(motorDerecho, velocidadDerPWM, canalB1, canalB2);
}

void MotorDriver::detener() {
    _lastY = 0;
    conducir(0, 0);
}