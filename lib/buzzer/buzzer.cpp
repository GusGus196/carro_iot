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
    analogWrite(pinR, color[0]);
    analogWrite(pinG, color[1]);
    analogWrite(pinB, color[2]);    
}

void direccionales(int velocidadX)
{
    if(velocidadX > abs(tolerancia))
    velocidadX > 0 ? parpadeo(pinLedDer) : parpadeo(pinLedIzq);
}

void parpadeo(int pinLed)
{
    static int estado = LOW;
    digitalWrite(pinLedDer, HIGH);
    static int tiempo = 0;
    while(millis() - tiempo > intervalo){}

    tiempo = millis();
}