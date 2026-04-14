#include "driver.h"

const float compensacionIzquierda = 1.0;
const float compensacionDerecha = 0.83;
const float zonaMuerta = 0.1f;
const int minPWM = 140;
const int maxPWM = 255;
const int rangoPWM = maxPWM - minPWM;

void driver(float valorX, float valorY) {
  // Diferenciales
  float motorIzquierdo = valorY + valorX;
  float motorDerecho = valorY - valorX;
  int velocidadIzq = 0, velocidadDer = 0;

  motorIzquierdo = compensarMotor(compensacionIzquierda,motorIzquierdo);
  motorDerecho =  compensarMotor(compensacionDerecha, motorDerecho);

  // Arranque
  velocidadIzq = calibrarMotor(motorIzquierdo);
  velocidadDer = calibrarMotor(motorDerecho);

  aplicarGiro(motorIzquierdo, velocidadIzq, canalA1, canalA2);
  aplicarGiro(motorDerecho, velocidadDer, canalB1, canalB2);
}

int calibrarMotor(float motor){
  motor = abs(motor);
  if (motor > zonaMuerta) {
    return minPWM + (motor * rangoPWM); 
  }

  return 0;
}

float compensarMotor(float compensacion, float motor){
  return constrain(motor * compensacion, -1.0, 1.0);
}

// Función para calcular la dirección y encender el motor
void aplicarGiro(float valorJoystick, int velocidad, int canal1, int canal2) {
  int valor1 = 0;
  int valor2 = 0;
  
  if (valorJoystick > zonaMuerta) {
    valor1 = 0;
    valor2 = velocidad; // Adelante

  } else if (valorJoystick < -zonaMuerta) {
    valor1 = velocidad; 
    valor2 = 0; // Reversa
  }
  
  escribirPWM(canal1,valor1);
  escribirPWM(canal2,valor2);
}

/*
  Función auxiliar para aplicarGiro(), verifica si hay cambio de velocidad
  para evitar reescribir innecesariamente el valor si sigue siendo constante
*/
void escribirPWM(int canal, int valor) {
  static int ultimoValor[16] = {-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1};

  if (ultimoValor[canal] != valor) {
    ledcWrite(canal, valor);
    ultimoValor[canal] = valor;
  }
}