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

//Funcion que da color al led
void ledRGB(const int color[3])
{
    pcf.write(lucesConf.pinR, color[0]);
    pcf.write(lucesConf.pinG, color[1]);
    pcf.write(lucesConf.pinB, color[2]);    
}

//si solo tenemos un par de leds usar este 
void controlLucesTraseras(int velocidadY, char* instruccion, int zonaMuerta)
{   
    bool freno = ledFreno(velocidadY, zonaMuerta);
    
    if(freno == false)
    {
        direccionales(instruccion);
    }
}

void direccionales(const char* instruccion)
{

    if(instruccion == nullptr || strcmp(instruccion, "") == 0 || strcmp(instruccion, "off") == 0)
    { 
        digitalWrite(lucesConf.pinLedDer, LOW);
        digitalWrite(lucesConf.pinLedIzq, LOW);
    } 
    else if (strcmp(instruccion, "der") == 0)
    {
        pcf.write(lucesConf.pinLedIzq, LOW);
        parpadeoDirec(lucesConf.pinLedDer);
    }
    else if (strcmp(instruccion, "izq") == 0)
    {
        pcf.write(lucesConf.pinLedDer, LOW); 
        parpadeoDirec(lucesConf.pinLedIzq);
    }
    else if (strcmp(instruccion, "prev") == 0)
    {
        parpadeoInter(lucesConf.pinLedDer, lucesConf.pinLedIzq);
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
        pcf.write(lucesConf.pinLedDer, estadoFreno ? HIGH : LOW);
        pcf.write(lucesConf.pinLedIzq, estadoFreno ? HIGH : LOW);
        ultimoEstado = estadoFreno;
    }

    ultimaVelocidad = velocidadY;
    return estadoFreno;
}

void parpadeoDirec(int pinLed)
{
    static unsigned long tiempoAnterior = 0; 
    static bool estadoActual = false;
    if(millis() - tiempoAnterior >= intervalo) 
    {
        tiempoAnterior = millis();   
        estadoActual = digitalRead(pinLed);
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

void ledModo(const String &modo)
{
    if(modo == "manual")
    {
        ledRGB(lucesConf.colorManual);
    } else if(modo == "seguidor")
    {
        ledRGB(lucesConf.colorSeguidor);
    } else if(modo == "obstaculos")
    {
        ledRGB(lucesConf.colorObstaculos);
    } else if (modo == "navegacion")
    {
        ledRGB(lucesConf.colorNavegacion);
    } else {
        ledRGB(lucesConf.colorNull);
    }
}