# Configuración de Eclipse Mosquitto

Esta documentación proporciona las instrucciones necesarias para instalar, configurar y administrar el broker MQTT **Eclipse Mosquitto** en entornos de desarrollo Windows, Linux y MacOS.

Documentación oficial: [https://mosquitto.org/](https://mosquitto.org/)

## Arquitectura de comunicación

Haciendo uso de este broker local, la configuración permite que dos clientes se comuniquen entre sí:

- **Control Web (JavaScript):** se conecta mediante WebSockets (Puerto 9001). Los navegadores no pueden usar el protocolo MQTT estándar directamente.
- **Smart Car (ESP32):** se conecta mediante MQTT sobre TCP (Puerto 1883). Adecuado para microcontroladores.

## Entorno de Red (LAN)

Si utilizas este broker local en lugar de uno público, para que el sistema funcione, **todos los dispositivos** deben coexistir en la misma subred local. El Broker actúa como el nodo central, y los clientes (Web y ESP32) deben poder alcanzar su dirección IP.

**Opciones de conexión:**

- **Hotspot móvil:** crea un punto de acceso desde tu smartphone o laptop. Conecta tanto el ESP32 como los dispositivos que usarán la interfaz web a esta red. Es la opción más estable para evitar firewalls corporativos o de universidades.
- **Router local:** conecta todos los dispositivos al mismo router WiFi.

> [!CAUTION]
> Aislamiento de AP: algunos routers públicos (escuelas, cafeterías, hoteles) tienen una función llamada "Aislamiento de punto de acceso" que impide que los dispositivos conectados se vean entre sí. Si este es el caso, el sistema no funcionará. Por eso, el uso de un Hotspot personal es más recomendable.

## Instalación

### Windows

1. Descargar el instalador ejecutable desde el sitio oficial: [https://mosquitto.org/download/](https://mosquitto.org/download/).
2. Ejecutar el archivo `.exe` y completar la instalación.

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
```

### MacOS (Homebrew)

```bash
brew install mosquitto
```

### Variables de entorno (Solo Windows)

Para ejecutar comandos de Mosquitto desde cualquier terminal sin navegar a la carpeta de instalación, debe añadir la ruta al `PATH`.

1. Presiona `Win` y busca **"Editar variables de entorno del sistema"**, presiona `Enter`.
2. Ve a **Variables de entorno** > **Path** (en variables del sistema) y haz clic en `Editar`.
3. Debes añadir la ruta: `C:\Program Files\mosquitto`.
4. Reinicie o cierra tu terminal para aplicar los cambios.

### Configuración del servicio (`mosquitto.conf`)

El archivo de configuración de Eclipse Mosquitto define los puertos y protocolos utilizados. En este directorio se incluye un archivo preconfigurado [mosquitto.conf](./mosquitto.conf).

**Instrucción:** reemplace el archivo original de Mosquitto por el archivo que se encuentra en este directorio. Este archivo ya tiene habilitado el puerto `1883` para Hardware y el `9001` para WebSockets.

> [!WARNING]
> Ambos protocolos permiten conexiones anónimas sin cifrado. Por ello, este broker debe utilizarse únicamente en redes locales controladas.

**Las rutas donde se encuentra el archivo a remplazar según el sistema:**

* **Windows:** `C:\Program Files\mosquitto\mosquitto.conf`
* **Linux:** `/etc/mosquitto/mosquitto.conf`
* **MacOS:** `/opt/homebrew/etc/mosquitto/mosquitto.conf`

### Gestión del servicio

Cada vez que modifique el archivo `.conf`, debe reiniciar el broker para aplicar los cambios.

**Windows:**

- Presione `Win + R`, escriba `services.msc` y presione Enter.
- Busque el servicio llamado **Mosquitto Broker**.
- Clic derecho y selecciona **Reiniciar**.

O mediante **PowerShell** como administrador:

```powershell
Restart-Service -Name mosquitto
```

**Linux:**
```bash
sudo systemctl restart mosquitto
```

**MacOS:**
```bash
brew services restart mosquitto
```

## Configuración de seguridad (Firewall)

### Windows

Para permitir que dispositivos externos (como una ESP32) se conecten al broker, debemos abrir los puertos y dar permisos a la aplicación.

#### 1. Abrir puertos vía PowerShell

Abre PowerShell como **administrador** y utiliza el siguiente comando para crear una regla de tráfico entrante:

```powershell
New-NetFirewallRule -DisplayName "SmartCar_MQTT" -Direction Inbound -LocalPort 1883, 9001, 3000 -Protocol TCP -Action Allow -Profile Any
```

El comando crea una regla de firewall llamada "SmartCar_MQTT" que permite el tráfico entrante a través de los puertos 1883, 9001 y 3000, utilizados respectivamente para MQTT, WebSockets y servicios web. La regla aplica únicamente al protocolo TCP, autoriza explícitamente las conexiones y se activa en cualquier tipo de red, ya sea pública o privada.

#### 2. Permitir aplicación a través de Windows Defender

Además de abrir los puertos, es necesario autorizar la aplicación para comunicarse:

1. Presiona la tecla `Win` y busca **"Permitir una aplicación a través de Windows Firewall"**.
2. Haz clic en **Cambiar la configuración** (requiere permisos de administrador).
3. Busca **Mosquitto Broker** o `mosquitto.exe` y asegúrate de que **Privada y Pública** estén marcadas.
4. Si no aparece, haz clic en **"Permitir otra aplicación"** y busca `C:\Program Files\mosquitto\mosquitto.exe`.

### Linux

```bash
sudo ufw allow 1883/tcp
sudo ufw allow 9001/tcp
sudo ufw allow 3000/tcp
```

### MacOS

Debido a que Mosquitto es un servicio de sistema y no una aplicación convencional, configurarlo en el Firewall requiere un paso adicional para localizar el archivo:

1. Ve a **Ajustes del sistema** > **Red** > **Firewall**.
2. Haz clic en **Opciones**.
3. Haz clic en el símbolo **(+)**.
4. Presiona la combinación de teclas `Command + Shift + G`.
5. Pega una de las siguientes rutas:
    - **Apple Silicon**: `/opt/homebrew/sbin/mosquitto`
    - **Intel**: `/usr/local/sbin/mosquitto`
6. Selecciona el archivo `mosquitto` y haz clic en **Abrir**.
7. Asegúrate de que aparezca en la lista como **Permitir conexiones entrantes** y haz clic en **Aceptar**.

> [!TIP]
> Si después de esto el ESP32 sigue sin conectar, intenta desactivar el Firewall momentáneamente para descartar. Si funciona desactivado, es que el binario que agregamos no es el que `brew` está ejecutando realmente.

## Uso

La variable `<IP_LOCAL>` deberá ser sustituida por la IPv4 de la máquina donde se ejecuta el broker.

### Modo monitor

En la terminal, ejecuta el siguiente comando para crear un monitor que escuche todos los tópicos.

```bash
mosquitto_sub -h <IP_LOCAL> -t "#" -v
```

> [!WARNING]
> Si Mosquitto no es parte del `PATH` de tu sistema, los comandos darán error. En ese caso, deberás agregar la variable de entorno o ejecutar la ruta completa (ej. para Windows: `C:\Program Files\mosquitto\mosquitto_sub.exe`).

### Modo publicador

Enviar mensajes a un tópico específico. Esto es útil para simular acciones del control web o comandos hacia el Smart Car.

> [!NOTE]
> Se recomienda ejecutarlo en una terminal aparte para observar simultáneamente cómo el Modo monitor recibe el mensaje.

```bash
mosquitto_pub -h <IP_LOCAL> -t "smartcar/control/joystick" -m "0.0,0.2"
```

## Diagnóstico

Si los dispositivos no logran conectarse al broker, sigue estos pasos en orden:

### 1. Verificación de puertos activos

Asegúrate de que Mosquitto realmente esté escuchando en los puertos correctos:

**Windows:**

```powershell
netstat -an | findstr "1883 9001"
```

**Linux/MacOS:**

```bash
sudo lsof -i -P | grep -E "1883|9001"
```

Verifica que las líneas terminen en **LISTENING**. Si no aparece nada, el servicio no ha cargado correctamente tu archivo `mosquitto.conf`.

### 2. Prueba de Loopback

Prueba si el broker responde dentro de la misma PC usando `localhost`. Si esto funciona pero la IP real no, el problema es el **Firewall**.

```bash
mosquitto_pub -h localhost -t "test" -m "hola"
```

### 3. Verificación de IP

Asegúrate de que tu IP no haya cambiado al reconectar el Hotspot. En Windows utiliza `ipconfig` y en Linux `hostname -I`.

## Desinstalación

### Windows

1. Desinstalar desde **Configuración** > **Aplicaciones** o **Panel de control**.
2. **Eliminar la regla del Firewall y permisos:**
    * Abre **PowerShell** como administrador y ejecuta:
        ```powershell
        Remove-NetFirewallRule -DisplayName "SmartCar_MQTT"
        ```
    * En el menú de "Permitir aplicaciones a través de Windows Firewall", busca **Mosquitto Broker**, selecciona **Quitar** y confirma.

### Linux

```bash
sudo apt purge mosquitto*
sudo ufw delete allow 1883/tcp
sudo ufw delete allow 9001/tcp
sudo ufw delete allow 3000/tcp
```

### MacOS
```bash
brew uninstall mosquitto
brew cleanup
```