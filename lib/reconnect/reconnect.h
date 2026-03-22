#ifndef RECONNECT_H
#define RECONNECT_H

#include <WiFi.h>
#include <PubSubClient.h>

#include "config.h"

extern PubSubClient client;

void reconnect();

#endif