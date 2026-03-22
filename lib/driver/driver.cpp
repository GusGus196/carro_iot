#include "driver.h"

void driver(float valorX, float valorY){
  // Mezcla diferencial
  float motorIzquierdo = valorY + valorX;
  float motorDerecho = valorY - valorX;

  float compensacionIzquierda = 1.20;
  float compensacionDerecha = 1.0;

  motorIzquierdo = constrain(motorIzquierdo * compensacionIzquierda, -1.0, 1.0);
  motorDerecho = constrain(motorDerecho * compensacionDerecha, -1.0, 1.0);

  int valorA1 = 0, valorA2 = 0, valorB1 = 0, valorB2 = 0;
  int velocidadA = 0, velocidadB = 0;

  // Arranque
  if (abs(motorIzquierdo) > 0.1) {
    velocidadA = 140 + (abs(motorIzquierdo) * (255 - 140));
  }
  
  if (abs(motorDerecho) > 0.1) {
    velocidadB = 140 + (abs(motorDerecho) * (255 - 140));
  }

  // Motor izquierdo (A)
  if (motorIzquierdo > 0.1) {
    valorA1 = 0;
    valorA2 = velocidadA;
  } else if (motorIzquierdo < -0.1) {
    valorA1 = velocidadA;
    valorA2 = 0;
  }

  // Motor derecho (B)
  if (motorDerecho > 0.1) {
    valorB1 = 0;
    valorB2 = velocidadB;
  } else if (motorDerecho < -0.1) {
    valorB1 = velocidadB;
    valorB2 = 0;
  }


  // Serial.print("IN: [X:"); Serial.print(valorX); Serial.print(" Y:"); Serial.print(valorY); Serial.print("]");
  // Serial.print(" -> PWM: [IZQ:"); Serial.print(velocidadA); Serial.print(" DER:"); Serial.print(velocidadB); Serial.println("]");
  

  ledcWrite(canalA1, valorA1);
  ledcWrite(canalA2, valorA2);
  ledcWrite(canalB1, valorB1);
  ledcWrite(canalB2, valorB2);
}