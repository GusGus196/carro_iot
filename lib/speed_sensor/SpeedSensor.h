#ifndef SPEED_SENSOR_H
#define SPEED_SENSOR_H

#include "config.h"

class SpeedSensor {
    public:
        SpeedSensor(int pinLeft, int pinRight);

        void iniciar();
        void medir();
        void reiniciar();

        float obtenerVelocidadIzq() const;
        float obtenerVelocidadDer() const;

    private:
        int _pinLeft, _pinRight;

        static const int PULSOS_POR_VUELTA = 20;

        static volatile uint32_t _pulsosDer;
        static volatile uint32_t _pulsosIzq;

        float _velocidadDer = 0;
        float _velocidadIzq = 0;
        unsigned long _ultimoTiempo = 0;

        static void IRAM_ATTR contarDer();
        static void IRAM_ATTR contarIzq();
};

#endif