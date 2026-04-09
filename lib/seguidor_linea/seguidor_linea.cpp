#include "seguidor_linea.h"
const float kP = 0.8;  // más alto = más agresivo
const float kD = 0.6;  // más alto = más suavizado

const float kMomentum   = 0.4;   // Qué tanto se hereda el giro anterior (0.0 - 1.0)
const float kDecaimiento = 0.7;  // Qué tan rápido se "olvida" el giro (0.0 = olvido inmediato, 1.0 = nunca olvida)

float errorAnterior = 0;
float momentum = 0;  // Acumulador de dirección de giro reciente

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
        float error = (s1 * -0.5 + s2 * -0.25 + s4 * 0.25 + s5 * 0.5) / sumaLecturas;

        float derivada = error - errorAnterior;
        errorAnterior = error;

        float correccion;

        if (s3 && !s2 && !s4) {
            // Solo el sensor del medio detecta: aplicar corrección inversa proporcional al momentum
            correccion = -(momentum * kMomentum);
        } else {
            // Sensores laterales activos: calcular corrección normal
            correccion = (kP * error) + (kD * derivada);
            // Acumular momentum con la corrección actual
            momentum = (momentum * kDecaimiento) + (correccion * (1.0 - kDecaimiento));
        }

        correccion = constrain(correccion, -1.0, 1.0);
        driver(correccion, velocidadConstante);
    } else {
        // Sin línea detectada: mantener momentum para intentar recuperarla
        driver(-(momentum * 0.5), velocidadConstante * 0.5);
    }
}

/*
Momenum es el que guarda cuánto y en qué dirección giró el carrito recientemente. Es un número entre -1 a 1.
kMomentum controla qué tan fuerte es la corrección inversa cuando el sensor del medio detecta la línea.
KDecaimiento controla qué tan rápido se olvida el momentum entre ciclo y ciclo. Un valor cercano a 1 significa memoria larga y un valor cercano a 0.0 significa que casi no recuerda nada del ciclo anteriro.
*/