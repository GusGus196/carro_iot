#include "driver.h"
#include "sensor_velocidad.h"

// ---------------- CONFIG ----------------
const float zonaMuerta = 0.1f;
const int minPWM = 140;
const int maxPWM = 255;
const int rangoPWM = maxPWM - minPWM;

// --- Controlador PI ---
const float Kp = 0.0008f;
const float Ki = 0.0003f;
const float integralMax = 0.3f;

// Bias proporcional a la velocidad pedida
const float biasForward = 0.06f;
const float biasReverse = 0.02f;

// Umbral mínimo de RPM para aplicar corrección
// A velocidades bajas los encoders dan 0-1 pulsos por ventana → puro ruido
const float MIN_RPM_CORRECCION = 23.0f; // Subido de 5 a 30: ignora lecturas ruidosas

// Zona muerta del error: diferencias menores a esto se tratan como "igual"
// Evita que 1 pulso de diferencia se interprete como error real
const float ERROR_DEADBAND_RPM = 20.0f;

// A partir de qué valorY el PI actúa con potencia completa
// Por debajo, Ki se escala a cero gradualmente
const float VELOCIDAD_PI_PLENO = 0.5f;

// --- Estado del integrador ---
static float integralError = 0.0f;
static unsigned long ultimaCorreccion = 0;

// ----------------------------------------

void iniciarDriver() {
  ledcSetup(canalA1, freq, resolucion);
  ledcSetup(canalA2, freq, resolucion);
  ledcSetup(canalB1, freq, resolucion);
  ledcSetup(canalB2, freq, resolucion);

  ledcAttachPin(motorA1, canalA1);
  ledcAttachPin(motorA2, canalA2);
  ledcAttachPin(motorB1, canalB1);
  ledcAttachPin(motorB2, canalB2);
}

int calcularPWM(float motor) {
  float valor = abs(motor);
  if (valor > zonaMuerta) {
    return minPWM + (int)(valor * rangoPWM);
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
  float motorDerecho   = valorY - valorX;

  // 2. Limitar rango
  motorIzquierdo = constrain(motorIzquierdo, -1.0f, 1.0f);
  motorDerecho   = constrain(motorDerecho,   -1.0f, 1.0f);

  // 3. Leer velocidades de forma segura
  float velIzq, velDer;
  noInterrupts();
  velIzq = velocidadIzq;
  velDer = velocidadDer;
  interrupts();

  // Velocidad promedio real como referencia de "qué tan rápido va"
  float velPromedio = (velIzq + velDer) / 2.0f;

  // 4. Corrección PI
  bool enLineaRecta  = (abs(valorX) < 0.05f) && (abs(valorY) > zonaMuerta);

  // Requiere que AMBOS encoders reporten movimiento real, no solo uno
  // Si solo uno reporta > umbral, probablemente es ruido del otro en 0
  bool hayMovimiento = (velIzq > MIN_RPM_CORRECCION && velDer > MIN_RPM_CORRECCION);

  if (enLineaRecta && hayMovimiento) {

    unsigned long ahora = millis();
    float dt = constrain((ahora - ultimaCorreccion) / 1000.0f, 0.0f, 0.2f);
    ultimaCorreccion = ahora;

    float error = velIzq - velDer;

    // Zona muerta del error: diferencias pequeñas = ruido de encoder, no error real
    if (abs(error) < ERROR_DEADBAND_RPM) {
      error = 0.0f;
    }

    // Ki escalado con la velocidad real:
    // - A velocidad baja (< 30 RPM promedio): Ki ≈ 0 → el integrador casi no actúa
    // - A velocidad plena (>= RPM equivalente a 0.5 joystick): Ki completo
    // Esto evita que ruido de encoder a baja velocidad se acumule en la integral
    float factorVelocidad = constrain(velPromedio / (MIN_RPM_CORRECCION * 4.0f), 0.0f, 1.0f);
    float KiEfectivo = Ki * factorVelocidad;

    // Acumular integral con anti-windup
    integralError += error * dt;
    integralError  = constrain(integralError, -integralMax / Ki, integralMax / Ki);

    // Corrección PI con Ki escalado
    float correccion = (Kp * error) + (KiEfectivo * integralError);

    motorIzquierdo -= correccion;
    motorDerecho   += correccion;

    // Bias mecánico proporcional a la velocidad pedida
    float factorJoystick = abs(valorY);
    if (valorY > 0) {
      motorDerecho -= biasForward * factorJoystick;
    } else if (valorY < 0) {
      motorDerecho += biasReverse * factorJoystick;
    }

    motorIzquierdo = constrain(motorIzquierdo, -1.0f, 1.0f);
    motorDerecho   = constrain(motorDerecho,   -1.0f, 1.0f);

  } else {
    // Reset integral al detenerse, girar, o cuando los encoders no son confiables
    integralError    = 0.0f;
    ultimaCorreccion = millis();
  }

  // 5. Convertir a PWM
  int velocidadIzqPWM = calcularPWM(motorIzquierdo);
  int velocidadDerPWM = calcularPWM(motorDerecho);

  // 6. Aplicar a motores
  aplicarGiro(motorIzquierdo, velocidadIzqPWM, canalA1, canalA2);
  aplicarGiro(motorDerecho,   velocidadDerPWM, canalB1, canalB2);
}