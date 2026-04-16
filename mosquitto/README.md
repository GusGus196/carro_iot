```markdown
# Configuración MQTT: Smart Car & Web Interface

Guía técnica para la comunicación entre **Vite.js** (Web) y **ESP32** (Hardware) mediante **Mosquitto** en entorno Windows.

---

## 1. Servidor (Mosquitto Broker)
* **Software:** Eclipse Mosquitto (Servicio de Windows).
* **Gestión:** Reiniciar vía `services.msc` tras editar el archivo `.conf`.

### Configuración de `mosquitto.conf`
```conf
# Puerto MQTT Estándar (ESP32)
listener 1883
allow_anonymous true

# Puerto WebSockets (Interfaz Web)
listener 9001
protocol websockets
allow_anonymous true
```

---

## 2. Red y Seguridad (Windows)

### Infraestructura de Red
Se utiliza un **Hotspot móvil** para crear la subred local. 
> [!IMPORTANT]
> **IP Dinámica:** La IP del servidor (Laptop) es asignada por el teléfono y **cambia**. Verificar con `ipconfig` (ejemplo actual: `172.20.10.2`).

### Firewall de Windows (Configuración Avanzada)
Para que el ESP32 y otros dispositivos externos puedan comunicarse con la laptop, se deben abrir los puertos manualmente. 

**Comando rápido (PowerShell como Admin):**
```powershell
New-NetFirewallRule -DisplayName "SmartCar_MQTT_Hardware" -Direction Inbound -LocalPort 1883, 9001, 3000 -Protocol TCP -Action Allow
```
* **1883:** Tráfico MQTT puro (ESP32).
* **9001:** WebSockets (Interfaz Web).
* **3000:** Acceso a la web de Vite desde el celular.

---

## 3. Conectividad y Pruebas

### Cliente Web (JS)
Debido a restricciones de seguridad en navegadores móviles (contexto no seguro en HTTP), se debe evitar el uso de `crypto.randomUUID()` al generar el ID del cliente.

```javascript
// Configuración compatible con móviles y escritorio
const client = mqtt.connect('ws://172.20.10.2:9001', {
    clientId: 'web_control_' + Math.random().toString(16).substring(2, 10)
});
```

### Acceso desde el Móvil
Para ver la interfaz en el celular conectado al Hotspot:
1. Iniciar Vite con host: `npm run dev -- --host`
2. Acceder vía: `http://172.20.10.2:3000` (Asegurarse de usar **HTTP**, no HTTPS).

### Monitoreo por Terminal
```bash
# Verificar tráfico en tiempo real (todos los tópicos)
"C:\Program Files\Mosquitto\mosquitto_sub.exe" -h 172.20.10.2 -t "#" -v
mosquitto_sub -h 172.20.10.2 -t "#" -v
```

---

## 4. Flujo de Datos
1.  **Joystick (Web):** Captura coordenadas $(x, y)$.
2.  **Publicación:** Tópico `smartcar/control/joystick` vía **WebSockets (Puerto 9001)**.
3.  **Broker:** Mosquitto procesa y distribuye el mensaje.
4.  **ESP32:** Suscrito al tópico, recibe instrucciones vía **MQTT Estándar (Puerto 1883)**.

---

## 5. Mantenimiento
Para revertir las reglas del firewall al finalizar el proyecto:
```powershell
Remove-NetFirewallRule -DisplayName "SmartCar_MQTT_Hardware"
```