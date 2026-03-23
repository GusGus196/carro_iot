#include "ultrasonico.h";

void iniciarUltrasonico() {
    pinMode(trig, OUTPUT);
    pinMode(echo, INPUT);
}

float leerDistancia() {
    digitalWrite(trig, LOW);
    delayMicroseconds(2);

    digitalWrite(trig, HIGH); // 40 kHz
    delayMicroseconds(10);

    digitalWrite(trig, LOW);

    long tiempo = pulseIn(echo, HIGH, 25000); // 25000 microsegundos max = 400cm

    // Fuera de rango
    if (tiempo == 0) {
        return 400.0;
    }

    float distancia = (tiempo * 0.0343) / 2.0; // Fórmula de la distancia: (tiempo (microsegundos) * velocidad del sonido (cm/ms)) / 2

    return distancia;
}