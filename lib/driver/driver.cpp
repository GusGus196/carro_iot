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
  //Emiliano
  int velocidadA = 0;
  int velocidadB = 0;
  float compensacionDerecha = 1.20; 
  float compensacionIzquierda = 1.20;

  // --- CALIBRACIÓN DE ARRANQUE (Aumentamos de 90 a 115) ---
  // Si con 115 sale muy disparado, baja a 100. Si sigue sin moverse, sube a 130.
  velocidadA = calibracionmotor(motorIzquierdo);
  velocidadB = calibracionmotor(motorDerecho);

  // --- COMPENSACIÓN DE MOTORES ---
  // Si el motor Derecho (B) es más débil, le multiplicamos por un factor (ej: 1.15)
  // OJO: Ajusta este número hasta que el carro camine recto.

  velocidadB = compensacionMotor(compensacionDerecha, velocidadB);
  velocidadA = compensacionMotor(compensacionIzquierda, velocidadA);

  // MOTOR IZQUIERDO (A)
  aplicarGiroYPotencia(motorIzquierdo, velocidadA, canalA1, canalA2);

  // MOTOR DERECHO (B)
  aplicarGiroYPotencia(motorDerecho, velocidadB, canalB1, canalB2);


  // Serial.print("IN: [X:"); Serial.print(valorX); Serial.print(" Y:"); Serial.print(valorY); Serial.print("]");
  // Serial.print(" -> PWM: [IZQ:"); Serial.print(velocidadA); Serial.print(" DER:"); Serial.print(velocidadB); Serial.println("]");

}


int calibracionmotor(float motor){
  motor = abs(motor);
  int velocidad = 0;
  if (motor > 0.1) {
    velocidad = 140 + (abs(motor) * (255 - 140)); 
  }
  return velocidad;
}

int compensacionMotor(float compensacion, int velocidad){
  return constrain(velocidad * compensacion, 0, 255);
}

// Función para calcular la dirección y encender el motor
void aplicarGiroYPotencia(float lecturaJoystick, int velocidad, int canal1, int canal2) {
  int valor1 = 0;
  int valor2 = 0;
  if (lecturaJoystick > 0.1) {
    valor1 = 0;
    valor2 = velocidad; // Adelante
  } else if (lecturaJoystick < -0.1) {
    valor1 = velocidad; 
    valor2 = 0;         // Reversa
  }

  ledcWrite(canal1, valor1);
  ledcWrite(canal2, valor2);
}