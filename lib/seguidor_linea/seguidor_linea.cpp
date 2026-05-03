#include "seguidor_linea.h"

const float kP = 0.9f;
const float kD = 0.55f;

const float kTiempoDecay_ms   = 120.0f;

const float kResetCentrado    = 0.2f;

const float kMomentum         = 0.4f;
const float kUmbralRecto      = 0.15f;

float errorAnterior  = 0.0f;
unsigned long tAnterior = 0;

void iniciarSeguidor() {
    pinMode(pinS1, INPUT); // Extremo Izquierdo
    pinMode(pinS2, INPUT); // Medio Izquierdo
    pinMode(pinS3, INPUT); // Centro
    pinMode(pinS4, INPUT); // Medio Derecho
    pinMode(pinS5, INPUT); // Extremo Derecho
    tAnterior = millis();
}

void ejecutarSeguidorLinea() {
    unsigned long tAhora = millis();
    float dt = (float)(tAhora - tAnterior); 
    tAnterior = tAhora;

    if (dt < 0.1f || dt > 500.0f) return;

    int s1 = !digitalRead(pinS1);
    int s2 = !digitalRead(pinS2);
    int s3 = !digitalRead(pinS3);
    int s4 = !digitalRead(pinS4);
    int s5 = !digitalRead(pinS5);

    float sumaLecturas = s1 + s2 + s3 + s4 + s5;

    if (sumaLecturas > 0) {
        float error = (s1 * -1.0f + s2 * -0.45f + s4 * 0.45f + s5 * 1.0f) / sumaLecturas;

        float derivada = (error - errorAnterior) / dt;
        
        float kD_dinamico = kD;
        
        if (fabsf(error) < fabsf(errorAnterior)) {
            kD_dinamico = kD * 1.5f; // "freno" al volver al centro
        }

        float p = kP * error;
        float d = kD_dinamico * derivada * 10.0f; // multiplicador
        
        float correccion = p + d;

        float factorDecay = expf(-dt / kTiempoDecay_ms);
        momentum = momentum * factorDecay + correccion * (1.0f - factorDecay);

        // Velocidad variable: Reducir velocidad si el giro es brusco
        float reduccionVelocidad = 1.0f - (fabsf(error) * 0.43f); // Reduce hasta un 40%
        float velActual = velocidadConstante * reduccionVelocidad;

        errorAnterior = error;
        
        correccion = constrain(correccion, -1.0f, 1.0f);
        driver(correccion, velActual);

    } else {
        driver(momentum * 0.5f, velocidadConstante * 0.5f);
    }
}

/*
  * Si el carro se sale en las curvas: Sube kP o baja la velocidad en curvas.
  * Si el carro zigzaguea en las rectas tras una curva: Sube kD o aumenta el multiplicador de la derivada cuando el error disminuye.
*/