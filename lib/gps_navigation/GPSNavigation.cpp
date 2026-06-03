#include "GPSNavigation.h"
#include "MotorDriver.h"
#include "MQTTManager.h"

GPSNavigation::GPSNavigation(MotorDriver& motor, MQTTManager& mqtt, int rx, int tx)
    : _motor(motor), _mqtt(mqtt), _serialGPS(2), _rxPin(rx), _txPin(tx) {}

void GPSNavigation::iniciar() {
    _serialGPS.begin(9600, SERIAL_8N1, _rxPin, _txPin);
}

void GPSNavigation::actualizar() {
    while (_serialGPS.available() > 0) {
        if (_gps.encode(_serialGPS.read())) {
            if (_gps.location.isValid()) {
                _latActual = _gps.location.lat();
                _lonActual = _gps.location.lng();
                _satelites = _gps.satellites.isValid() ? _gps.satellites.value() : 0;

                if (millis() - _ultimaPublicacion > 1000) {
                    JsonDocument doc;
                    doc["lat"] = _latActual;
                    doc["lon"] = _lonActual;
                    doc["error"] = _errorRumbo;
                    doc["sat"] = _satelites;
                    doc["destino"] = false;
                    _mqtt.publicar(topics.ubicacion, doc);
                    _ultimaPublicacion = millis();
                }
            }
        }
    }
}

void GPSNavigation::navegar() {
    if (_latDestino != _ultimoLatDestino || _lonDestino != _ultimoLonDestino) {
        _ultimoRumboCalculado = 0;
        _correccionAplicada = false;
        _ultimoLatDestino = _latDestino;
        _ultimoLonDestino = _lonDestino;

        if (_gps.location.isValid()) {
            _distDestino = _gps.distanceBetween(_latActual, _lonActual, _latDestino, _lonDestino);
            _rumboDestino = _gps.courseTo(_latActual, _lonActual, _latDestino, _lonDestino);
        }
    }

    calcularMetricas();

    if (_distDestino > RADIO_LLEGADA) {
        unsigned long tiempoTranscurrido = millis() - _ultimoRumboCalculado;

        if (tiempoTranscurrido > 6000) {
            if (_gps.location.isValid()) {
                if (_primeraLecturaRealizada) {
                    double desplazamiento = _gps.distanceBetween(_latAnterior, _lonAnterior, _latActual, _lonActual);

                    if (desplazamiento > 0.5) {
                        _rumboActual = _gps.courseTo(_latAnterior, _lonAnterior, _latActual, _lonActual);
                        _ultimoRumboCalculado = millis();
                        _correccionAplicada = false;
                    }
                }
                _latAnterior = _latActual;
                _lonAnterior = _lonActual;
                _primeraLecturaRealizada = true;
            } else {
                _motor.conducir(0.0, 0.45);
            }
        }

        if (tiempoTranscurrido < 1000 && _primeraLecturaRealizada) {
            if (!_correccionAplicada) {
                corregirOrientacion(_rumboActual, _rumboDestino);
                _correccionAplicada = true;
            }
        } else {
            _motor.conducir(0.0, 0.45);
        }
    } else {
        terminar();
    }
}

void GPSNavigation::calcularMetricas() {
    static unsigned long ultimoCalculo = 0;

    if (millis() - ultimoCalculo > 1000) {
        if (_gps.location.isValid()) {
            _distDestino = _gps.distanceBetween(_latActual, _lonActual, _latDestino, _lonDestino);
            _rumboDestino = _gps.courseTo(_latActual, _lonActual, _latDestino, _lonDestino);
        }
        ultimoCalculo = millis();
    }
}

void GPSNavigation::corregirOrientacion(double actual, double destino) {
    _errorRumbo = destino - actual;

    if (_errorRumbo > 180) _errorRumbo -= 360;
    else if (_errorRumbo < -180) _errorRumbo += 360;

    float giro = (abs(_errorRumbo) < 30) ? 0.0 : constrain(_errorRumbo / 90.0, -0.20, 0.20);
    float velocidad = (abs(_errorRumbo) > 45) ? 0.25 : 0.45;

    _motor.conducir(giro, velocidad);
}

void GPSNavigation::terminar() {
    _estadoNav = false;
    _errorRumbo = 0.0;

    _motor.conducir(0, 0);

    if (_mqtt.estaConectado()) {
        JsonDocument doc;
        doc["lat"] = _latActual;
        doc["lon"] = _lonActual;
        doc["error"] = _errorRumbo;
        doc["sat"] = _satelites;
        doc["destino"] = true;
        _mqtt.publicar(topics.ubicacion, doc);
    }
}

void GPSNavigation::colocarDestino(double lat, double lon) {
    _latDestino = lat;
    _lonDestino = lon;
    _estadoNav = (_latDestino != 0.0 || _lonDestino != 0.0);
}

void GPSNavigation::avanzar() {
    _estadoNav = true;
}

void GPSNavigation::parar() {
    _estadoNav = false;
    _motor.conducir(0, 0);
}

void GPSNavigation::reanudar() {
    _estadoNav = true;
}

bool GPSNavigation::isActive() const {
    return _estadoNav;
}

double GPSNavigation::errorRumbo() const {
    return _errorRumbo;
}

bool GPSNavigation::hasValidLocation() const {
    return _gps.location.isValid();
}