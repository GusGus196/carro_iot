#ifndef SEGUIDOR_LINEA_H
#define SEGUIDOR_LINEA_H

#include <Arduino.h>

#include "config.h"
#include "driver.h"

extern const float kP;  // más alto = más agresivo
extern const float kD;  // más alto = más suavizado

extern float errorAnterior;
extern const float kMomentum;   // Qué tanto se hereda el giro anterior (0.0 - 1.0)
extern const float kDecaimiento;  // Qué tan rápido se "olvida" el giro (0.0 = olvido inmediato, 1.0 = nunca olvida)
extern float momentum;

void iniciarSeguidor();
void ejecutarSeguidorLinea();

#endif