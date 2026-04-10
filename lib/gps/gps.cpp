#include "gps.h"

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

static unsigned long ultimaPublicacion = 0;
static unsigned long ultimoRumboCalculado = 0; // Controlar el calculo de rumbo cada 5 segundos

void iniciarGPS() {
    SerialGPS.begin(9600, SERIAL_8N1, gpsRX, gpsTX);
}

void enviarUbicacion() {
    while (SerialGPS.available() > 0) {
        if (gps.encode(SerialGPS.read())) {
            // Publicar la localización solo si ha pasado 1 segundo desde la última publicación y si es válida
            if (gps.location.isValid() && (millis() - ultimaPublicacion > 1000)) {
                
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
    if (!hayDestino) return;
    
    calcularMetricasGPS(); // Calcular distancia y rumbo

    // Radio de llegada: 4 metros
    if (destinoDistancia < 4.0) {
        procesarLlegada();
    } else {
        conducirHaciaDestino();
    }
}

void calcularMetricasGPS() {
    static unsigned long ultimoCalculo = 0;
    
    /*
        Calculamos la distancia en metros entre el smart car y el destino cada 1 segundo,
        devuelve un valor tipo double, Se usa la fórmula de Haversine para el cálculo
    */
    if (millis() - ultimoCalculo > 1000) {
        if (gps.location.isValid()) {
            destinoDistancia = gps.distanceBetween(gps.location.lat(), gps.location.lng(), destinoLat, destinoLon);
            destinoRumbo = gps.courseTo(gps.location.lat(), gps.location.lng(), destinoLat, destinoLon);

        }

        ultimoCalculo = millis();
    }
}

void procesarLlegada() {
    hayDestino = false; // Esperar por un nuevo destino
    driver(0, 0); // Parar el motor al estar en el radio de llegada
    client.publish(topic_llegada, "1"); // Publicar alerta de llegada al broker MQTT
    claxon(); // Sonido de llegada 
}

void conducirHaciaDestino() {
    // Cada 5 segundos obtenemos una nueva orientación
    if (millis() - ultimoRumboCalculado > 5000) {
        // Solo calculamos la orientación si hay datos nuevos
        if (gps.location.isUpdated()) {
            obtenerOrientacion();
            ultimoRumboCalculado = millis();
            
        } else {
            // Si no tenemos rumbo fiable, avanzamos recto para que el GPS se oriente
            driver(0.0, 0.4);
        }

    } else if (millis() - ultimoRumboCalculado < 1000) {
        /* 
        Durante el primer segundo del intervalo, 
        aplicamos el giro calculado para orientarnos al destino
        */
        corregirOrientacion(actualRumbo, destinoRumbo);

    } else {
        /* 
            Entre el segundo 1 y 5 forzamos el avance recto para que el 
            GPS pueda calcular el nuevo rumbo real de desplazamiento
        */
        driver(0.0, 0.4);
    }
}

void obtenerOrientacion() {
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
    corregirOrientacion(actualRumbo, destinoRumbo); // Manipular el driver para corregir la orientación
}

void corregirOrientacion(double actual, double destino) {
    double error = destino - actual; // Diferencia entre los dos rumbos
    /*
        Ej. Si el rumbo actual es 0 grados (Norte) y el rumbo entre el smart car y el destino
        es igual a 180 grados (Sur), al hacer la resta obtenemos +180, por lo que debemos a la derecha
        hasta que nuestro rumbo actual sea igual a 180 grados para poder avanzar recto hacia el destino
    */

    // Esto asegura que siempre se tome el giro más corto
    if (error > 180) error -= 360; // Si el error es mayor a 180, giramos a la izquierda (-)
    else if (error < -180) error += 360; // Si el error es menor a 180, giramos a la derecha (+)
    
    float giro = (abs(error) < 30) ? 0.0 : constrain(error / 90.0, -0.4, 0.4); // Si el error es pequeño, vamos en dirección al destino
    float velocidad = (abs(error) > 45) ? 0.2 : 0.3;
    
    driver(giro, velocidad);
}