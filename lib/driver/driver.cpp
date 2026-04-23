#include "driver.h"
#include "sensor_velocidad.h"

// ---------------- CONFIG ----------------
const float zonaMuerta = 0.1f;
const int minPWM = 140;
const int maxPWM = 255;
const int rangoPWM = maxPWM - minPWM;

// Ajuste fino
const float Kp = 0.001;

// Bias para corregir desbalance físico
const float biasForward = 0.07;
const float biasReverse = 0.02;

int calcularPWM(float motor) {
  float valor = abs(motor);

  if (valor > zonaMuerta) {
    return minPWM + (valor * rangoPWM);
  }

  return 0;
}

void aplicarGiro(float valorJoystick, int velocidad, int canal1, int canal2) {
  int valor1 = 0;
  int valor2 = 0;
  
  if (valorJoystick > zonaMuerta) {
    valor1 = 0;
    valor2 = velocidad;

  } else if (valorJoystick < -zonaMuerta) {
    valor1 = velocidad; 
    valor2 = 0;
  }
  
  escribirPWM(canal1, valor1);
  escribirPWM(canal2, valor2);
}

void escribirPWM(int canal, int valor) {
  static int ultimoValor[16] = {-1};

  if (ultimoValor[canal] != valor) {
    ledcWrite(canal, valor);
    ultimoValor[canal] = valor;
  }
}

void driver(float valorX, float valorY) {

  // 1. Mezcla diferencial
  float motorIzquierdo = valorY + valorX;
  float motorDerecho  = valorY - valorX;

  // 2. Limitar rango
  motorIzquierdo = constrain(motorIzquierdo, -1.0, 1.0);
  motorDerecho  = constrain(motorDerecho, -1.0, 1.0);

  // 3. Leer velocidades de forma segura (evita conflictos con ISR)
  float velIzq, velDer;

  noInterrupts();
  velIzq = velocidadIzq;
  velDer = velocidadDer;
  interrupts();

  // 4. Autocorrección SOLO en línea recta
  if (abs(valorX) < 0.05 && abs(valorY) > zonaMuerta) {

    float error = velIzq - velDer;
    float correccion = error * Kp;

    motorIzquierdo -= correccion;
    motorDerecho  += correccion;

    // Bias mecánico (muy importante en la práctica)
    if (valorY > 0) {
  motorDerecho -= biasForward;
  } else if (valorY < 0) {
    motorDerecho += biasReverse;
  }

    // Re-limitar
    motorIzquierdo = constrain(motorIzquierdo, -1.0, 1.0);
    motorDerecho  = constrain(motorDerecho, -1.0, 1.0);
  }

  // 5. Convertir a PWM
  int velocidadIzqPWM = calcularPWM(motorIzquierdo);
  int velocidadDerPWM = calcularPWM(motorDerecho);

  // 6. Aplicar a motores
  aplicarGiro(motorIzquierdo, velocidadIzqPWM, canalA1, canalA2);
  aplicarGiro(motorDerecho, velocidadDerPWM, canalB1, canalB2);
  ledFreno(valorY, zonaMuerta);
}

