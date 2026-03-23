#include "seguidor_linea.h"

const int pinS1 = 32; // Extremo Izquierdo (-1.0)
const int pinS2 = 33; // Medio Izquierdo (-0.5)
const int pinS3 = 25; // Centro (0.0)
const int pinS4 = 26; // Medio Derecho (0.5)
const int pinS5 = 27; // Extremo Derecho (1.0)

void iniciarSeguidor() {
    pinMode(pinS1, INPUT);
    pinMode(pinS2, INPUT);
    pinMode(pinS3, INPUT);
    pinMode(pinS4, INPUT);
    pinMode(pinS5, INPUT);
}

void ejecutarSeguidorLinea() {
    int s1 = digitalRead(pinS1);
    int s2 = digitalRead(pinS2);
    int s3 = digitalRead(pinS3);
    int s4 = digitalRead(pinS4);
    int s5 = digitalRead(pinS5);

    float sumaLecturas = s1 + s2 + s3 + s4 + s5;
    //El peso de s3 es 0, por lo que no es necesario considerarlo en la suma superior
    if (sumaLecturas > 0) {
        float x = (s1 * -1.0 + s2 * -0.5 + s4 * 0.5 + s5 * 1.0) / sumaLecturas;
        driver(x, velocidadConstante); //
    } else {
        driver(0, 0); 
    }
}