#ifndef GPS_NAVIGATION_H
#define GPS_NAVIGATION_H

#include "config.h"
#include <TinyGPS++.h>
#include <HardwareSerial.h>

class MotorDriver;
class MQTTManager;

class GPSNavigation {
    public:
        GPSNavigation(MotorDriver& motor, MQTTManager& mqtt, int rx, int tx);

        void iniciar();
        void actualizar();
        void navegar();

        void colocarDestino(double lat, double lon);
        void avanzar();
        void parar();
        void reanudar();
        double errorRumbo() const;
        
        bool isActive() const;
        bool hasValidLocation() const;

    private:
        MotorDriver& _motor;
        MQTTManager& _mqtt;
        HardwareSerial _serialGPS;
        TinyGPSPlus _gps;

        int _rxPin, _txPin;

        double _latDestino = 0.0;
        double _lonDestino = 0.0;
        bool _estadoNav = false;
        double _errorRumbo = 0.0;

        double _latActual = 0.0;
        double _lonActual = 0.0;
        int _satelites = 0;
        double _latAnterior = 0.0;
        double _lonAnterior = 0.0;
        double _distDestino = 0.0;
        double _rumboDestino = 0.0;
        double _rumboActual = 0.0;

        bool _primeraLecturaRealizada = false;
        bool _correccionAplicada = false;

        unsigned long _ultimaPublicacion = 0;
        unsigned long _ultimoRumboCalculado = 0;
        double _ultimoLatDestino = 0.0;
        double _ultimoLonDestino = 0.0;

        static constexpr float RADIO_LLEGADA = 2.5f;

        void calcularMetricas();
        void corregirOrientacion(double actual, double destino);
        void terminar();
};

#endif