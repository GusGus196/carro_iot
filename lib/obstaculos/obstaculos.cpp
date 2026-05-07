#include "obstaculos.h"
#include "ultrasonico.h" 
#include "driver.h"      
#include "config.h"

void esquivarObstaculo() {
    driver(0, 0); //Aqui se detiene

    float obstaculo = leerDistanciaFiltrada();
    if (obstaculo == 0) obstaculo = 400; // Ajuste de ruido sugerido

    // Retroceso hasta que la distancia sea mayor a 8
    while (obstaculo < 8 && obstaculo > 0) {
        driver(0, -0.5); // Retroceder
        obstaculo = leerDistanciaFiltrada();
        if (obstaculo == 0) obstaculo = 400;
        delay(10);
    }

    driver(0.8, 0); // Giro a la derecha
    delay(500);     
}

void obstaculos() {
    driver(0, 0.45);

    float obstaculo = leerDistanciaFiltrada();
    
    // Si lee 0 lo toma como 400
    if (obstaculo == 0) {
        obstaculo = 400;
    }

    if (obstaculo < 8 && obstaculo > 2) { // ! Este es el rango en el que carro detecta un obstaculo (ajustado a 8cm)
        esquivarObstaculo();
    }
}