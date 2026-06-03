#include "FeedbackController.h"

FeedbackController::FeedbackController() {}

void FeedbackController::iniciar() {
    ledcSetup(_canalBuzzer, freqBuzzer, resolucion);
    ledcAttachPin(pinBuzzer, _canalBuzzer);
}

void FeedbackController::claxon() {
    ledcWriteTone(_canalBuzzer, 800);
    delay(50);
    ledcWriteTone(_canalBuzzer, 1000);
    delay(50);
    ledcWriteTone(_canalBuzzer, 1200);
    delay(50);
    ledcWriteTone(_canalBuzzer, 0);
}

void FeedbackController::claxonConfirmar() {
    ledcWriteTone(_canalBuzzer, 600);
    delay(80);
    ledcWriteTone(_canalBuzzer, 900);
    delay(80);
    ledcWriteTone(_canalBuzzer, 0);
}

void FeedbackController::ledRGB(const int color[3]) {
    _pcf.write(lucesConf.pinR, color[0]);
    _pcf.write(lucesConf.pinG, color[1]);
    _pcf.write(lucesConf.pinB, color[2]);
}

void FeedbackController::ledModo(const String& modo) {
    if (modo == "manual") {
        ledRGB(lucesConf.colorManual);
    } else if (modo == "seguidor") {
        ledRGB(lucesConf.colorSeguidor);
    } else if (modo == "obstaculos") {
        ledRGB(lucesConf.colorObstaculos);
    } else if (modo == "navegacion") {
        ledRGB(lucesConf.colorNavegacion);
    } else {
        ledRGB(lucesConf.colorNull);
    }
}

void FeedbackController::direccional(const char* instruccion) {
    static bool estadoDer = false;
    static bool estadoIzq = false;
    static char ultimaInstruccion[8] = "";

    if (strcmp(instruccion, ultimaInstruccion) != 0) {
        estadoDer = false;
        estadoIzq = false;
        strncpy(ultimaInstruccion, instruccion, sizeof(ultimaInstruccion) - 1);
    }

    if (strcmp(instruccion, "der") == 0) {
        estadoIzq = false;
        estadoDer = !estadoDer;
    } else if (strcmp(instruccion, "izq") == 0) {
        estadoDer = false;
        estadoIzq = !estadoIzq;
    } else if (strcmp(instruccion, "prev") == 0) {
        if (estadoDer != estadoIzq) {
            estadoDer = false;
            estadoIzq = false;
        }
        estadoDer = !estadoDer;
        estadoIzq = estadoDer;
    } else {
        estadoDer = false;
        estadoIzq = false;
    }

    _pcf.write(lucesConf.pinLedDer, estadoDer ? LOW : HIGH);
    _pcf.write(lucesConf.pinLedIzq, estadoIzq ? LOW : HIGH);
}

void FeedbackController::apagar() {
    _pcf.write(lucesConf.pinLedDer, HIGH);
    _pcf.write(lucesConf.pinLedIzq, HIGH);
}

void FeedbackController::preventiva(float velocidadY, float zonaMuerta) {
    static float ultimaVelocidad = 0;
    static bool ultimoEstado = false;
    static unsigned long ultimaEscritura = 0;
    static unsigned long tiempoFreno = 0;

    bool frenando = abs(velocidadY) < abs(ultimaVelocidad) - 0.05f || (ultimaVelocidad > 0 && velocidadY < 0);
    bool enMovimiento = abs(ultimaVelocidad) > zonaMuerta;
    bool estadoFreno = frenando && enMovimiento;

    if (estadoFreno) tiempoFreno = millis();
    bool luzFreno = (millis() - tiempoFreno) < 500;

    unsigned long ahora = millis();
    if (luzFreno != ultimoEstado && (ahora - ultimaEscritura) > 50) {
        _pcf.write(lucesConf.pinFrenoDer, luzFreno ? LOW : HIGH);
        _pcf.write(lucesConf.pinFrenoIzq, luzFreno ? LOW : HIGH);
        ultimoEstado = luzFreno;
        ultimaEscritura = ahora;
    }
    ultimaVelocidad = velocidadY;
}

void FeedbackController::actualizarTimeout(unsigned long ahora) {
    if (ahora - _ultimaVezLuces > timeoutLuces) {
        apagar();
    }
}