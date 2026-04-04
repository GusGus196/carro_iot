#include "driver.h"
const float compensacionIzquierda = 1.20f;
const float compensacionDerecha = 1.00f;
const float zonaMuerta = 0.1f;
const int minPWM = 140;
const int maxPWM = 255;
const int rangoPWM = maxPWM - minPWM;

void driver(float valorX, float valorY){
  // Mezcla diferencial
  float motorIzquierdo = valorY + valorX;
  float motorDerecho = valorY - valorX;
  int velocidadIzq = 0, velocidadDer = 0;

  motorIzquierdo = compensacionMotor(compensacionIzquierda,motorIzquierdo);
  motorDerecho =  compensacionMotor(compensacionDerecha, motorDerecho);

  // Arranque
  velocidadIzq = calibracionmotor(motorIzquierdo);
  velocidadDer = calibracionmotor(motorDerecho);

  aplicarGiroYPotencia(motorIzquierdo, velocidadIzq, canalA1, canalA2);
  aplicarGiroYPotencia(motorDerecho, velocidadDer, canalB1, canalB2);

}

int calibracionmotor(float motor){
  motor = abs(motor);
  if (motor > zonaMuerta) 
  {
    return minPWM + (motor * rangoPWM); 
  }
  return 0;
}

// Función para calcular la dirección y encender el motor
void aplicarGiroYPotencia(float lecturaJoystick, int velocidad, int canal1, int canal2) {
  int valor1 = 0;
  int valor2 = 0;
  
  if (lecturaJoystick > zonaMuerta) {
    valor1 = 0;
    valor2 = velocidad; // Adelante
  } else if (lecturaJoystick < -zonaMuerta) {
    valor1 = velocidad; 
    valor2 = 0;         // Reversa
  }

  ledcWrite(canal1, valor1);
  ledcWrite(canal2, valor2);
}

float compensacionMotor(float compensacion, float motor){
  return constrain(motor * compensacion, -1.0, 1.0);
}