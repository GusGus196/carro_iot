#ifndef ULTRASONIC_SENSOR_H
#define ULTRASONIC_SENSOR_H

#include "config.h"

class UltrasonicSensor {
    public:
        UltrasonicSensor(int trigPin, int echoPin);

        void iniciar();
        float leer();
        float leerFiltrado();

    private:
        int _trig, _echo;
};

#endif