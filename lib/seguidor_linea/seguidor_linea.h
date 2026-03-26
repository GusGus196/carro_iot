#ifndef SEGUIDOR_LINEA_H
#define SEGUIDOR_LINEA_H

#include <Arduino.h>

#include "config.h"
#include "driver.h"

extern const float kP;  // más alto = más agresivo
extern const float kD;  // más alto = más suavizado

extern float errorAnterior;

void iniciarSeguidor();
void ejecutarSeguidorLinea();


#endif
