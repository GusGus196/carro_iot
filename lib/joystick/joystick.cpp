#include "joystick.h"

// Valores de motores desde el joystick
float valorX = 0;
float valorY = 0;

void iniciarJoystick() {
    ledcSetup(canalA1, freq, resolucion);
    ledcSetup(canalA2, freq, resolucion);
    ledcSetup(canalB1, freq, resolucion);
    ledcSetup(canalB2, freq, resolucion);

    ledcAttachPin(motorA1, canalA1);
    ledcAttachPin(motorA2, canalA2);
    ledcAttachPin(motorB1, canalB1);
    ledcAttachPin(motorB2, canalB2);
}

void joystick(char* mensaje){ 
    char* ptr = strtok(mensaje, ",");

    if (ptr != NULL) {
        valorX = atof(ptr); 
        ptr = strtok(NULL, ",");
        if (ptr != NULL) valorY = atof(ptr);
    }
    
    driver(valorX, valorY);
}