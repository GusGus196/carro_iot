#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>
#include "config.h"

class WiFiManager {
    public:
        WiFiManager(const char* ssid, const char* password);
        void conectar();

    private:
        const char* _ssid;
        const char* _password;
};

#endif