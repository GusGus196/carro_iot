#ifndef GPS_H
#define GPS_H

#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include "config.h"
#include "reconnect.h" // Para usar la variable 'client' de MQTT

void iniciarGPS();
void procesarGPS();

#endif