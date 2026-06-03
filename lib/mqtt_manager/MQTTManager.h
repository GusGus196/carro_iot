#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include "config.h"
#include <WiFi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

class MQTTManager {
    public:
        using MessageCallback = void (*)(const char* topic, JsonDocument& doc);

        MQTTManager(const char* server, int port);

        void iniciar();
        void conectar();
        void procesar();
        void publicar(const char* topic, JsonDocument& doc);
        void asignarCallback(MessageCallback cb);
        bool estaConectado();

    private:
        WiFiClient _wifiClient;
        PubSubClient _client;
        MessageCallback _callback = nullptr;

        static MQTTManager* _instance;
        static void onMessage(char* topic, uint8_t* payload, unsigned int length);
};

#endif