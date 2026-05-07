#include "feedback.h"

bool preventivasActivas = false;
bool direccionalDerActiva = false;
bool direccionalIzqActiva = false;
const int intervalo = 500;
PCF8574 pcf(0x20);

static bool toggleEstado = false;

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

void direccionales(const char* instruccion) {
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

    pcf.write(lucesConf.pinLedDer, estadoDer ? LOW : HIGH);
    pcf.write(lucesConf.pinLedIzq, estadoIzq ? LOW : HIGH);
}

void ledFreno(float velocidadY, float zonaMuerta) {   
    static float ultimaVelocidad = 0;
    static bool ultimoEstado = false;
    static unsigned long ultimaEscritura = 0;
    static unsigned long tiempoFreno = 0;

    bool frenando = abs(velocidadY) < abs(ultimaVelocidad) - 0.05f;
    bool enMovimiento = abs(ultimaVelocidad) > zonaMuerta;
    bool estadoFreno = frenando && enMovimiento;

    if (estadoFreno) {
        tiempoFreno = millis();
    }

    bool luzFreno = (millis() - tiempoFreno) < 1000;

    unsigned long ahora = millis();
    if (luzFreno != ultimoEstado && (ahora - ultimaEscritura) > 50) {
        pcf.write(lucesConf.pinFrenoDer, luzFreno ? LOW : HIGH);
        pcf.write(lucesConf.pinFrenoIzq, luzFreno ? LOW : HIGH);
        ultimoEstado = luzFreno;
        ultimaEscritura = ahora;
    }

    ultimaVelocidad = velocidadY;
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