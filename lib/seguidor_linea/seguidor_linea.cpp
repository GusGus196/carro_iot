#include "seguidor_linea.h"

float Kp = 0.8f; // Proporcional: Qué tan brusco da el volantazo hacia la línea.
float Kd = 0.4f; // Derivativo: El "amortiguador" que frena el giro para evitar el zigzag.

void iniciarSeguidor() {
    pinMode(pinS1, INPUT); // Extremo Izquierdo (-1.0)
    pinMode(pinS2, INPUT); // Medio Izquierdo (-0.5)
    pinMode(pinS3, INPUT); // Centro (0.0)
    pinMode(pinS4, INPUT); // Medio Derecho (0.5)
    pinMode(pinS5, INPUT); // Extremo Derecho (1.0)
}

void ejecutarSeguidorLinea() {
    float error = leerPosicionLinea();
    
    static float errorAnterior = 0.0f;

    float P = error;                            // Proporcional: Posición actual
    float D = error - errorAnterior;            // Derivativo: Velocidad a la que cambia el error

    float correccion = (P * Kp) + (D * Kd);

    errorAnterior = error;
    
    driver(correccion, velocidadConstante);
}

float leerPosicionLinea() {
    int s1 = !digitalRead(pinS1);
    int s2 = !digitalRead(pinS2);
    int s3 = !digitalRead(pinS3);
    int s4 = !digitalRead(pinS4);
    int s5 = !digitalRead(pinS5);

    float sumaLecturas = s1 + s2 + s3 + s4 + s5;
    static float ultimaPosicion = 0.0f; // Memoria para no perder la línea

    if (sumaLecturas > 0) {
        ultimaPosicion = (s1 * -1.0f + s2 * -0.5f + s4 * 0.5f + s5 * 1.0f) / sumaLecturas;
    } 

    return ultimaPosicion;
}