#include "buzzer.h"
const int tolerancia;
const int intervalo;
void iniciarBuzzer() {
    ledcSetup(canalBuzzer, freqBuzzer, resolucion);
    ledcAttachPin(pinBuzzer, canalBuzzer);
}

// 150ms
void claxon() {
    ledcWriteTone(canalBuzzer, 800);
    delay(50);
    ledcWriteTone(canalBuzzer, 1000);
    delay(50);
    ledcWriteTone(canalBuzzer, 1200);
    delay(50);
    ledcWriteTone(canalBuzzer, 0);
}

// 160ms
void sonarConfirmacion() {
    ledcWriteTone(canalBuzzer, 600);
    delay(80);
    ledcWriteTone(canalBuzzer, 900);
    delay(80);
    ledcWriteTone(canalBuzzer, 0);
}

// 180ms
void sonarError() {
    ledcWriteTone(canalBuzzer, 400);
    delay(180);
    ledcWriteTone(canalBuzzer, 0);
}
//funcion que da color al led
void ledRGB(int color[3])
{
    ledcWrite(pinR, color[0]);
    ledcWrite(pinG, color[1]);
    ledcWrite(pinB, color[2]);    
}

void controlLucesTraseras(int velocidadX, int velocidadY)
{   
    bool freno = ledFreno(velocidadY);
    
    if(freno == false)
    {
        direccionales(velocidadX);
    }
}


void direccionales(int velocidadX)
{
    if(abs(velocidadX) <= tolerancia) {
        digitalWrite(pinLedDer, LOW);
        digitalWrite(pinLedIzq, LOW);
        return;
    }
    int pinActivo   = (velocidadX > 0) ? pinLedDer : pinLedIzq;
    int pinInactivo = (velocidadX > 0) ? pinLedIzq : pinLedDer;

    digitalWrite(pinInactivo, LOW);
    parpadeo(pinActivo);
}

bool ledFreno(int velocidadY)
{   
    static int ultimaVelocidad = 0;
    static bool freno = false;
    if(abs(velocidadY) < abs(ultimaVelocidad))
    {
        ultimaVelocidad = velocidadY;
        digitalWrite(pinLedDer, HIGH);
        digitalWrite(pinLedIzq, HIGH); 
        return true;         
    }
    ultimaVelocidad = velocidadY;
    digitalWrite(pinLedDer, LOW);
    digitalWrite(pinLedIzq, LOW);
    return false;
}

void parpadeo(int pinLed)
{
    static unsigned long tiempoAnterior = 0; 

    if(millis() - tiempoAnterior >= intervalo) {

        tiempoAnterior = millis();   
        bool estadoActual = digitalRead(pinLed);
        digitalWrite(pinLed, !estadoActual); 
    }
}