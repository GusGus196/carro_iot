#include "buzzer.h"
bool preventivasActivas = false;
bool direccionalDerActiva = false;
bool direccionalIzqActiva = false;
const int intervalo = 500;
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






//si solo tenemos un par de leds usar este 
void controlLucesTraseras(int velocidadY, String instruccion)
{   
    bool freno = ledFreno(velocidadY);
    
    if(freno == false)
    {
        direccionales(instruccion);
    }
}

void direccionales(String instruccion)
{

    if(instruccion == "" || instruccion == "Apagado") 
    { 
        digitalWrite(pinLedDer, LOW);
        digitalWrite(pinLedIzq, LOW);
    } 
    else if (instruccion == "Derecha")
    {
        digitalWrite(pinLedIzq, LOW);
        parpadeoDirec(pinLedDer);
    }
    else if (instruccion == "Izquierda")
    {
        digitalWrite(pinLedDer, LOW); 
        parpadeoDirec(pinLedIzq);
    }
    else if (instruccion == "Preventivas")
    {
        parpadeoInter(pinLedDer, pinLedIzq);
    }
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

void parpadeoDirec(int pinLed)
{
    static unsigned long tiempoAnterior = 0; 
    if(millis() - tiempoAnterior >= intervalo) 
    {
        tiempoAnterior = millis();   
        bool estadoActual = digitalRead(pinLed);
        digitalWrite(pinLed, !estadoActual); 
    }
}

void parpadeoInter(int pin1, int pin2)
{
    static unsigned long tiempoAnterior = 0; 
    if(millis() - tiempoAnterior >= intervalo) 
    {
        tiempoAnterior = millis();   
        bool estadoActual = digitalRead(pin1);
        digitalWrite(pin1, !estadoActual); 
        digitalWrite(pin2, !estadoActual); 
    }
}