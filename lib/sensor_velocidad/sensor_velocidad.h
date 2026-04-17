#ifndef SENSOR_VELOCIDAD_H
#define SENSOR_VELOCIDAD_H

#include "config.h"

extern unsigned long ultimoTiempo;
extern float velocidadDer;
extern float velocidadIzq;

// Ajusta esto según tu encoder (ej: 20 ranuras)
extern const int PULSOS_POR_VUELTA;

extern void iniciarSensoresVelocidad();
extern void IRAM_ATTR contarDer();
extern void IRAM_ATTR contarIzq();
extern void medirVelocidad();

extern volatile uint32_t pulsosDer;
extern volatile uint32_t pulsosIzq;

#endif // MACRO
