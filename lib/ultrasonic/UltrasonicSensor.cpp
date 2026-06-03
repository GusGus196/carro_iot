#include "UltrasonicSensor.h"

UltrasonicSensor::UltrasonicSensor(int trigPin, int echoPin)
    : _trig(trigPin), _echo(echoPin) {}

void UltrasonicSensor::iniciar() {
    pinMode(_trig, OUTPUT);
    pinMode(_echo, INPUT);
}

float UltrasonicSensor::leer() {
    digitalWrite(_trig, LOW);
    delayMicroseconds(2);
    digitalWrite(_trig, HIGH);
    delayMicroseconds(10);
    digitalWrite(_trig, LOW);

    long tiempo = pulseIn(_echo, HIGH, 25000);
    if (tiempo == 0) return 400.0;
    return (tiempo * 0.0343) / 2.0;
}

float UltrasonicSensor::leerFiltrado() {
    float suma = 0;
    for (int i = 0; i < 3; i++) {
        suma += leer();
        delay(5);
    }
    return suma / 3.0;
}