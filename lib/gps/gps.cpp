#include "gps.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2); 

static unsigned long ultimaPublicacion = 0;

void iniciarGPS() {
    SerialGPS.begin(9600, SERIAL_8N1, gpsRX, gpsTX);
}

void enviarUbicacion() {
    while (SerialGPS.available() > 0) {
        if (gps.encode(SerialGPS.read())) {
            // Publicar la localización solo si han pasado 2 segundos desde la última publicación y si es válida
            if (gps.location.isValid() && (millis() - ultimaPublicacion > 2000)) {
                
                /*
                    Declaramos un arreglo de 40 caracteres llamado posición,
                    y con snprintf almacenamos la latitud y longitud actual
                */
                char posicion[40];
                snprintf(posicion, sizeof(posicion), "%.6f,%.6f", gps.location.lat(), gps.location.lng());

                client.publish(topic_ubicacion, posicion); // Publicar la posición en el TOPIC ubicación
                ultimaPublicacion = millis();
                
                // Test: Serial.print("Ubicación enviada: "); Serial.println(posicion);
            }
        }
    }
}

void actualizarNavegacion() {
    // Solo si la ubicación es válida y ya tenemos un destino definido en el callback
    if (gps.location.isValid() && hayDestino) {
        /*
            Calculamos la distancia en metros, entre el smart car y el destino,
            devuelve un valor tipo double, Se usa la fórmula de Haversine para el cálculo
        */
        destinoDistancia = gps.distanceBetween(gps.location.lat(), gps.location.lng(), destinoLat, destinoLon);
        
        /*
            courseTo() calcula el bearing o rumbo. Es decir, el ángulo que existe entre la posición actual del smart car y el destino,
            tomando como referencia el norte. El valor del ángulo que devuelve es absoluto, no tiene en consideración hacia donde apunta
            el smart car, para eso utilizamos la función obtenerOrientacion()
        */
        destinoRumbo = gps.courseTo(gps.location.lat(), gps.location.lng(), destinoLat, destinoLon);

        // Radio de llegada: 3 metros
        if (destinoDistancia < 3.0) {
            hayDestino = false; // Esperar por un nuevo destino
            driver(0, 0); // Parar el motor al estar en el radio de llegada
            client.publish(topic_llegada, "1"); // Publicar alerta de llegada al broker MQTT
            claxon(); // Sonar claxon
            // Test: Serial.println("¡Destino alcanzado!");
        } else {
            obtenerOrientacion();
            /*
                Mientras no se alcance el destino:
                    - Calcular y corregir la orientación entre el smart car y el destino
                    - A partir de la orientación debemos controlar el driver
            */
        }
    }
}

void obtenerOrientacion() {
    // El GPS deberá estar en movimiento a una velocidad mayor a 1km/h para 
    // poder calcular el rumbo de desplazamiento
    if (gps.speed.kmph() < 1.0) {
        driver(0.0, 0.4); // Avanzar recto mientras la velocidad sea menor a 1km/h
        // Test: Serial.println("Calibrando rumbo..");
    } else {
        /*
            El smart car no cuenta con una brújula incluida, por lo que debemos hacerlo que avance 
            para que el GPS pueda orientarse. Al avanzar, el objeto .course de la librería TinyGPS++ procesa 
            los datos de desplazamiento, comparando la posición anterior con la nueva para trazar una línea de trayectoria. 
            
            Mediante el método .deg(), se extrae este ángulo en grados decimales (0 a 360), 
            tomando el Norte como 0 y aumentando en sentido horario (Este 90, Sur 180, Oeste 270), 
            lo que permite al coche conocer su rumbo actual en grados (hacia donde se dirige) 
            y como ya sabemos el rumbo hacia el destino, podemos calcular la diferencia de grados (error) y
            hacer que el smart car gire en dirección al destino
        */
        actualRumbo = gps.course.deg();
        // corregirOrientacion(actualRumbo, destinoRumbo); // Diferencia entre los dos rumbos y manipular el driver para corregir la orientación
    }
}