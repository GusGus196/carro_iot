#include "obstaculos.h"

#include "ultrasonico.h"
#include "driver.h"
#include "config.h"

enum {AVANZAR, RETROCEDER, GIRAR};

static int estado = AVANZAR;
static unsigned long tiempoEstado = 0;

static const unsigned long TIEMPO_RETROCEDER = 600;
static const unsigned long TIEMPO_GIRAR = 1000;
static const float OBSTACULO_DISTANCIA = 20.0;

void evitarObstaculos() {
    float obstaculo = leerDistanciaFiltrada();

    if (obstaculo == 0) obstaculo = 400;

    unsigned long ahora = millis();

    switch (estado) {
        case AVANZAR:
            if (obstaculo < OBSTACULO_DISTANCIA && obstaculo > 2) {
                estado = RETROCEDER;
                tiempoEstado = ahora;
            }
            break;

        case RETROCEDER:
            if (ahora - tiempoEstado > TIEMPO_RETROCEDER) {
                estado = GIRAR;
                tiempoEstado = ahora;
            }
            break;

        case GIRAR:
            if (ahora - tiempoEstado > TIEMPO_GIRAR) {
                estado = AVANZAR;
            }
            break;
    }

    switch (estado) {
        case AVANZAR:
            driver(0, velocidadConstante);
            break;

        case RETROCEDER:
            driver(0, velocidadConstante * -1);
            break;

        case GIRAR:
            driver(0.20, 0.25);
            break;
    }
}