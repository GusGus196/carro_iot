#include "seguidor_linea.h"

void iniciarSeguidor() {
    pinMode(pinS1, INPUT); // Extremo Izquierdo (-1.0) 33
    pinMode(pinS2, INPUT); // Medio Izquierdo (-0.5)
    pinMode(pinS3, INPUT); // Centro (0.0)
    pinMode(pinS4, INPUT); // Medio Derecho (0.5)
    pinMode(pinS5, INPUT); // Extremo Derecho (1.0)
}

void ejecutarSeguidorLinea() {
    int s1 = !digitalRead(pinS1);
    int s2 = !digitalRead(pinS2);
    int s3 = !digitalRead(pinS3);
    int s4 = !digitalRead(pinS4);
    int s5 = !digitalRead(pinS5);

    float sumaLecturas = s1 + s2 + s3 + s4 + s5;

    if (sumaLecturas > 0) {
        float x = (s1 * -1.0 + s2 * -0.5 + s4 * 0.5 + s5 * 1.0) / sumaLecturas;
        driver(x, velocidadConstante);
    } else {
        driver(0, 0);
    }
}