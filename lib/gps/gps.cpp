#include "gps.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2); 

static unsigned long ultimaPublicacion = 0;

void iniciarGPS() {
    SerialGPS.begin(9600, SERIAL_8N1, gpsRX, gpsTX);
}

void enviarUbicacion() {
    if (SerialGPS.available() > 0) {
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
    // Solo si ya tenemos un destino definido en el callback
    if (hayDestino) {
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

        // Test: if(gps.location.isUpdated()) {Serial.print("Distancia: "); Serial.print(destinoDistancia); Serial.print(" | Rumbo: ") ;Serial.println(destinoRumbo);}
        
        // Radio de llegada: 3 metros
        if (destinoDistancia < 3.0) {
            hayDestino = false; // Esperar por un nuevo destino
            driver(0, 0); // Parar el motor al estar en el radio de llegada
            client.publish(topic_llegada, "1"); // Publicar alerta de llegada al broker MQTT
            claxon(); // Sonido de llegada
            // Test: Serial.println("¡Destino alcanzado!");

        } else {
            // Solo calculamos la orientación si hay datos nuevos del GPS
            if (gps.location.isUpdated() || gps.course.isUpdated()) {
                obtenerOrientacion();
                /*
                    Mientras no se alcance el destino:
                        - Calcular y corregir la orientación entre el smart car y el destino
                        - A partir de la orientación debemos controlar el driver
                */
            }
        }
    }
}

void obtenerOrientacion() {
    // El GPS deberá estar en movimiento a una velocidad mayor a 1km/h para 
    // poder calcular el rumbo de desplazamiento
    if (gps.speed.kmph() < 1.0) {
        driver(0.0, 0.4); // Avanzar recto mientras la velocidad sea menor a 1km/h
        // Test: Serial.println("Calibrando..");

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
        
        // Test: Serial.print("Rumbo actual: "); Serial.println(actualRumbo);
        actualRumbo = gps.course.deg();
        corregirOrientacion(actualRumbo, destinoRumbo); // Manipular el driver para corregir la orientación
    }
}

void corregirOrientacion(double actual, double destino) {
    double error = destino - actual; // Diferencia entre los dos rumbos
    // Test: Serial.print("Error: "); Serial.println(error);

    /*
        Ej. Si el rumbo actual es 0 grados (Norte) y el rumbo entre el smart car y el destino
        es igual a 180 grados (Sur), al hacer la resta obtenemos +180, por lo que debemos a la derecha
        hasta que nuestro rumbo actual sea igual a 180 grados para poder avanzar recto hacia el destino
    */

    // Esto asegura que siempre se tome el giro más corto
    if (error > 180)  error -= 360; // Si el error es mayor a 180, giramos a la izquierda (-)
    if (error < -180) error += 360; // Si el error es menor a 180, giramos a la derecha (+)

    /*
        Ej. Si el rumbo al destino es 270 grados (Oeste) y actual 10 grados, al restar obtenemos 270 - 10 = +280,
        por lo que deberiamos girar 280 grados a la derecha, pero usando las condicionales al ser el error mayor a 180
        le restamos 360 y obtenemos -80 (280 - 360). Ahora solo necesitamos girar 80 grados a la izquierda
    */

    float velocidad = 0.4;
    float giro = 0.0;

    if (abs(error) < 15) {
        giro = 0.0; // Si el error es menor a 15 grados, quiere decir que vamos en dirección al destino

    } else {
        giro = constrain(error / 90.0, -1.0, 1.0); // Normaliza los valores de error entre -1 y 1 (usados en el driver para girar en x)
        if (abs(error) > 45) velocidad = 0.3;
        // Si el error es mayor a 45 grados, bajamos la velocidad para poder corregirlo con el giro en cada loop
    }

    driver(giro, velocidad);
}