#ifndef LINE_FOLLOWER_H
#define LINE_FOLLOWER_H

#include "config.h"

class MotorDriver;

class LineFollower {
    public:
        LineFollower(MotorDriver& motor);

        void iniciar();
        void ejecutar(float velocidadConstante);
        void reiniciarMomentum();

    private:
        MotorDriver& _motor;

        static constexpr float kP = 1.00f;
        static constexpr float kD = 0.55f;
        static constexpr float kTiempoDecay_ms = 120.0f;
        static constexpr float kMomentum = 0.4f;
        static constexpr float kUmbralRecto = 0.15f;

        float _errorAnterior = 0.0f;
        float _momentum = 0;
        unsigned long _tAnterior = 0;
};

#endif