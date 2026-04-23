#include "buzzer.h"
bool preventivasActivas = false;
bool direccionalDerActiva = false;
bool direccionalIzqActiva = false;
const int intervalo = 500;
PCF8574 pcf(0x20);

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
    pcf.write(pinR, color[0]);
    pcf.write(pinG, color[1]);
    pcf.write(pinB, color[2]);    
}

//si solo tenemos un par de leds usar este 
void controlLucesTraseras(int velocidadY, String instruccion, int zonaMuerta)
{   
    bool freno = ledFreno(velocidadY, zonaMuerta);
    
    if(freno == false)
    {
        direccionales(instruccion);
    }
}

void direccionales(String instruccion)
{

    if(instruccion == "" || instruccion == "off") 
    { 
        digitalWrite(pinLedDer, LOW);
        digitalWrite(pinLedIzq, LOW);
    } 
    else if (instruccion == "der")
    {
        pcf.write(pinLedIzq, LOW);
        parpadeoDirec(pinLedDer);
    }
    else if (instruccion == "izq")
    {
        pcf.write(pinLedDer, LOW); 
        parpadeoDirec(pinLedIzq);
    }
    else if (instruccion == "prev")
    {
        parpadeoInter(pinLedDer, pinLedIzq);
    }
}

bool ledFreno(float velocidadY, int zonaMuerta) {   
    static float ultimaVelocidad = 0;
    bool estadoFreno = false;

    if ((abs(velocidadY) < abs(ultimaVelocidad) - 0.05) || (abs(velocidadY) < zonaMuerta)) {
        estadoFreno = true;
    }

    static bool ultimoEstado = false;
    if (estadoFreno != ultimoEstado) {
        pcf.write(pinLedDer, estadoFreno ? HIGH : LOW);
        pcf.write(pinLedIzq, estadoFreno ? HIGH : LOW);
        ultimoEstado = estadoFreno;
    }

    ultimaVelocidad = velocidadY;
    return estadoFreno;
}

void parpadeoDirec(int pinLed)
{
    static unsigned long tiempoAnterior = 0; 
    if(millis() - tiempoAnterior >= intervalo) 
    {
        tiempoAnterior = millis();   
        bool estadoActual = digitalRead(pinLed);
        pcf.write(pinLed, !estadoActual); 
    }
}

void parpadeoInter(int pin1, int pin2)
{
    static unsigned long tiempoAnterior = 0; 
    if(millis() - tiempoAnterior >= intervalo) 
    {
        tiempoAnterior = millis();   
        bool estadoActual = digitalRead(pin1);
        pcf.write(pin1, !estadoActual); 
        pcf.write(pin2, !estadoActual); 
    }
}