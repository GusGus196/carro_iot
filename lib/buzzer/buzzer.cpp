#include "buzzer.h"

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