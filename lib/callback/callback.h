#ifndef CALLBACK_H
#define CALLBACK_H

#include <Arduino.h>

#include "config.h"
#include "buzzer.h"
#include "joystick.h"

void callback(char* topic, uint8_t* payload, unsigned int length);

#endif