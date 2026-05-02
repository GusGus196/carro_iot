#ifndef SENSOR_VELOCIDAD_H
#define SENSOR_VELOCIDAD_H

#include "config.h"

extern portMUX_TYPE mux;

extern unsigned long ultimoTiempo;
extern float velocidadDer;
extern float velocidadIzq;

extern const int PULSOS_POR_VUELTA;

extern void iniciarSensoresVelocidad();
extern void IRAM_ATTR contarDer();
extern void IRAM_ATTR contarIzq();
extern void medirVelocidad();
extern void resetearVelocidades();

extern volatile uint32_t pulsosDer;
extern volatile uint32_t pulsosIzq;

#endif // MACRO
