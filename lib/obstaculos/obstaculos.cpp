#include "obstaculos.h"

/*
La función leerDistanciaFiltrada regresa un valor entre 0 y 400. Suele tener ruido asi que se debe ajustar, solamente tienes que hace una condicional en la que si leer 0 lo tome como 400. 

El carrito se debe de detener cuando detecte un objeto a 8cm de el, despúes de que se detiene, hace un giro hacia cualquier lado (ti elige) y continua el linea recta.

*/

void esquivarObstaculo(){
    driver(0,0); //! Aqui se detiene
    // El carro deberá de retroceder por lo menos hasta que la variable obstaculo tenga mas de 7cm para poder hacer el giro. También, si es que ya está, se podria mandar a llamar los leds de precausión.
}

void obstaculos(){
    driver(0,0.45); // Esto hace que vaya en linea recta

    float obstaculo = leerDistanciaFiltrada();

    if(obstaculo < 7 && obstaculo > 2){ // ! Este es el rango en el que carro detecta un obstaculo
        esquivarObstaculo();
    }
}
