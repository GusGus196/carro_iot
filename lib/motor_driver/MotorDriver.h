#ifndef MOTOR_DRIVER_H
#define MOTOR_DRIVER_H

#include "config.h"

class SpeedSensor;

class MotorDriver {
    public:
        static constexpr float ZONA_MUERTA = 0.1f;

        MotorDriver();

        void iniciar();
        void conducir(float x, float y);
        void detener();

        void asignarSensorVelocidad(SpeedSensor* sensor);
        float obtenerUltimoY() const;

    private:
        SpeedSensor* _speedSensor = nullptr;

        static const int minPWM = 140;
        static const int maxPWM = 255;
        static const int rangoPWM = maxPWM - minPWM;

        static constexpr float Kp = 0.0008f;
        static constexpr float Ki = 0.0003f;
        static constexpr float integralMax = 0.3f;
        static constexpr float biasForward = 0.06f;
        static constexpr float biasReverse = 0.02f;
        static constexpr float MIN_RPM_CORRECCION = 23.0f;
        static constexpr float ERROR_DEADBAND_RPM = 20.0f;
        static constexpr float VELOCIDAD_PI_PLENO = 0.5f;

        float _integralError = 0.0f;
        unsigned long _ultimaCorreccion = 0;
        float _lastY = 0;

        static int _ultimoPWM[16];

        int calcularPWM(float motor);
        void aplicarGiro(float valor, int velocidad, int canal1, int canal2);
        void escribirPWM(int canal, int valor);
};

#endif