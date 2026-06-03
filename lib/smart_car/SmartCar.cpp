#include "SmartCar.h"

SmartCar* SmartCar::_instance = nullptr;

SmartCar::SmartCar()
    : _wifi(ssid, password)
    , _mqtt(mqtt_server, port)
    , _speedSensor(sensorVelIzq, sensorVelDer)
    , _motor()
    , _ultrasonic(trig, echo)
    , _feedback()
    , _lineFollower(_motor)
    , _obstacleAvoidance(_motor, _ultrasonic)
    , _gpsNavigation(_motor, _mqtt, gpsRX, gpsTX)
{
    _instance = this;
    _motor.asignarSensorVelocidad(&_speedSensor);
}

void SmartCar::setup() {
    Serial.begin(115200);
    analogReadResolution(8);

    _wifi.conectar();
    WiFi.setTxPower(WIFI_POWER_19_5dBm);

    _mqtt.iniciar();
    _mqtt.asignarCallback(onMessage);

    Wire.begin(21, 22);
    Wire.setClock(400000);

    _feedback.iniciar();
    _gpsNavigation.iniciar();
    _motor.iniciar();
    _lineFollower.iniciar();
    _ultrasonic.iniciar();
    _speedSensor.iniciar();
}

void SmartCar::loop() {
    if (!_mqtt.estaConectado()) {
        _mqtt.conectar();
    }
    
    _mqtt.procesar();

    _gpsNavigation.actualizar();
    _speedSensor.medir();

    if (_modo == "manual") {
        if (millis() - _ultimaVezRecibido > 500) {
            _motor.conducir(0, 0);
        }
        if (millis() - _ultimaVezLuces > timeoutLuces) {
            _feedback.apagar();
        }
    } else if (_modo == "seguidor") {
        if (_velocidadConstante > 0.0) {
            _lineFollower.ejecutar(_velocidadConstante);
        } else {
            _motor.conducir(0, 0);
        }
    } else if (_modo == "obstaculos") {
        if (_velocidadConstante > 0.0) {
            _obstacleAvoidance.actualizar(_velocidadConstante);
        } else {
            _motor.conducir(0, 0);
        }
    } else if (_modo == "navegacion") {
        if (_gpsNavigation.hasValidLocation() && _gpsNavigation.isActive()) {
            _gpsNavigation.navegar();
        } else {
            _motor.conducir(0, 0);
        }
    } else {
        _motor.conducir(0, 0);
    }
}

void SmartCar::onMessage(const char* topic, JsonDocument& doc) {
    if (_instance) {
        _instance->handleMessage(topic, doc);
    }
}

void SmartCar::handleMessage(const char* topic, JsonDocument& doc) {
    if (strcmp(topic, topics.manual) == 0) {
        _ultimaVezRecibido = millis();
        float valorX = doc["x"] | 0.0f;
        float valorY = doc["y"] | 0.0f;
        _motor.conducir(valorX, valorY);
        _feedback.preventiva(valorY, MotorDriver::ZONA_MUERTA);

    } else if (strcmp(topic, topics.modo) == 0) {
        const char* nuevoModo = doc["modo"];
        if (nuevoModo) {
            _modo = String(nuevoModo);
            _velocidadConstante = 0.0;
            _gpsNavigation.parar();
            _feedback.claxonConfirmar();
            _feedback.ledModo(nuevoModo);
            _tipo = "off";
        }
    } else if (strcmp(topic, topics.seguidor) == 0) {
        bool activo = (strcmp(doc["accion"], "activar") == 0);
        _velocidadConstante = activo ? 0.42 : 0.0;
        _lineFollower.reiniciarMomentum();

    } else if (strcmp(topic, topics.obstaculos) == 0) {
        bool activo = (strcmp(doc["accion"], "activar") == 0);
        _velocidadConstante = activo ? 0.45 : 0.0;

    } else if (strcmp(topic, topics.navegacion) == 0) {
        const char* accion = doc["accion"];
        if (accion) {
            if (strcmp(accion, "iniciar") == 0) {
                double lat = doc["lat"] | 0.0;
                double lon = doc["lon"] | 0.0;
                _gpsNavigation.colocarDestino(lat, lon);
                _gpsNavigation.avanzar();
            } else if (strcmp(accion, "detener") == 0) {
                _gpsNavigation.parar();
            } else if (strcmp(accion, "reanudar") == 0) {
                _gpsNavigation.reanudar();
            }
        }
    } else if (strcmp(topic, topics.luces) == 0) {
        _tipo = doc["tipo"] | "off";
        _ultimaVezLuces = millis();
        _feedback.direccional(_tipo);

    } else if (strcmp(topic, topics.claxon) == 0) {
        _feedback.claxon();
    }
}