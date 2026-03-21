
#include "driver.h"

void driver(int valorX, int valorY){
    // Mezcla diferencial
    float motorIzquierdo = valorY + valorX;
    float motorDerecho = valorY - valorX;

    motorIzquierdo = constrain(motorIzquierdo, -1.0, 1.0);
    motorDerecho = constrain(motorDerecho, -1.0, 1.0);

    int valorA1 = 0, valorA2 = 0, valorB1 = 0, valorB2 = 0;
    int velocidadA = 0;
    int velocidadB = 0;

    // --- CALIBRACIÓN DE ARRANQUE (Aumentamos de 90 a 115) ---
    // Si con 115 sale muy disparado, baja a 100. Si sigue sin moverse, sube a 130.
    if (abs(motorIzquierdo) > 0.1) {
        velocidadA = map(abs(motorIzquierdo * 100), 10, 100, 115, 255); 
    }
  
    if (abs(motorDerecho) > 0.1) {
        velocidadB = map(abs(motorDerecho * 100), 10, 100, 115, 255);
    }

    // --- COMPENSACIÓN DE MOTORES ---
    // Si el motor Derecho (B) es más débil, le multiplicamos por un factor (ej: 1.15)
    // OJO: Ajusta este número hasta que el carro camine recto.
    float compensacionDerecha = 1.20; 
    velocidadB = constrain(velocidadB * compensacionDerecha, 0, 255);

    float compensacionIzquierda = 1.20; 
    velocidadA = constrain(velocidadA * compensacionIzquierda, 0, 255);
    
    // MOTOR IZQUIERDO (A)
    if (motorIzquierdo > 0.1) {
        valorA1 = 0;    valorA2 = velocidadA;
    } else if (motorIzquierdo < -0.1) {
        valorA1 = velocidadA; valorA2 = 0;
    }

    // MOTOR DERECHO (B)
    if (motorDerecho > 0.1) {
        valorB1 = 0;    valorB2 = velocidadB;
    } else if (motorDerecho < -0.1) {
        valorB1 = velocidadB; valorB2 = 0;
    }

    ledcWrite(canalA1, valorA1);
    ledcWrite(canalA2, valorA2);
    ledcWrite(canalB1, valorB1);
    ledcWrite(canalB2, valorB2);
}