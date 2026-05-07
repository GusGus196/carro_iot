#ifndef CALLBACK_H
#define CALLBACK_H

#include <Arduino.h>
#include <ArduinoJson.h>

#include "config.h"
#include "feedback.h"
#include "driver.h"
#include "obstaculos.h"

void callback(char* topic, uint8_t* payload, unsigned int length);

#endif