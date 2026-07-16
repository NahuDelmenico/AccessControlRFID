# AccessControlRFID

Sistema de control de acceso con RFID: un ESP32 (simulado con Wokwi) lee una tarjeta, consulta a un backend Django si el UID está autorizado, y muestra el resultado en un LCD + LEDs + buzzer. Incluye un frontend web para ver empleados y registros de acceso.

## Cómo levantar todo para la demo

### 1. Prender MySQL (XAMPP)

Abrí **XAMPP Control Panel** (`D:\xampp\xampp-control.exe`) y arrancá **MySQL** (y **Apache** si vas a usar phpMyAdmin). Tienen que quedar en verde.

Si es la primera vez en esta PC, o la base `access_control` no existe:
1. Andá a `http://localhost/phpmyadmin` → pestaña **Nueva** → creá una base llamada `access_control`.
2. Desde `Backend/`, corré:
   ```
   python manage.py migrate
   ```
3. Cargá los datos de prueba: en phpMyAdmin, entrá a la base `access_control` → pestaña **Importar** → seleccioná `seed.sql` (en la raíz del repo) → Ejecutar.

### 2. Levantar Django

Desde `Backend/`:
```
python manage.py runserver 0.0.0.0:8000
```
Dejá esta terminal abierta. Probá que responda entrando a `http://localhost:8000/api/employees/` en el navegador (debería devolver JSON con los empleados).

> Si tira error de conexión a MySQL o de `.env`, revisar que exista el archivo `.env` en la raíz del repo (no se sube a git). Se arma copiando `.env.example` y completando `DB_PASSWORD` si tu MySQL tiene contraseña (XAMPP por defecto no tiene).

### 3. Simular el ESP32 con Wokwi

En VS Code (con la extensión **Wokwi for VS Code** instalada y con licencia activa):
1. Abrí la carpeta `ESP32Project/`.
2. `F1` → **Wokwi: Start Simulator**.
3. Hacé clic en la tarjeta RFID virtual para "pasarla" por el lector.

El sketch se conecta a la red virtual `Wokwi-GUEST` y llama a la API en `http://host.wokwi.internal:8000/api/rfid/` — ese hostname especial hace que la simulación vea el `localhost` de tu PC, por eso Django tiene que estar corriendo en `0.0.0.0:8000` (paso 2).

### 4. Tarjetas de prueba (de `seed.sql`)

| UID | Empleado | Resultado esperado |
|---|---|---|
| `11:22:33:44` | Juan Perez | ACCESO PERMITIDO |
| `AA:BB:CC:DD` | Maria Gomez | ACCESO PERMITIDO |
| `10:20:30:40` | Pedro Sanchez (inactivo) | ACCESO DENEGADO |
| `99:99:99:99` | (no existe) | ACCESO DENEGADO |

El lector virtual de Wokwi por defecto entrega el UID `11:22:33:44`, así que alcanza con hacer clic en la tarjeta sin configurar nada más.

### 5. Frontend (opcional para la demo)

Desde `Frontend/`:
```
npm run dev
```
Corre en `http://localhost:5173` y ya está habilitado en CORS del backend.

## Si hay que recompilar el sketch (`ESP32Project.ino`)

1. Abrir **Arduino IDE** → `File → Open` → seleccionar exactamente `ESP32Project/ESP32Project.ino` (el nombre del archivo tiene que coincidir con el de la carpeta, si no Arduino compila en una carpeta temporal y Wokwi no encuentra el binario).
2. Tools → Board → **ESP32 Dev Module**.
3. `Sketch → Export Compiled Binary`.
4. Confirmar que se haya generado `ESP32Project/build/esp32.esp32.esp32/ESP32Project.ino.bin` y `.elf` (son los que usa `wokwi.toml`, no se suben a git).

## Problemas ya resueltos (por si reaparecen)

- **Wokwi: firmware binary ... not found** → falta exportar el binario compilado (ver sección anterior), o se exportó en una carpeta temporal por el mismo motivo de nombre de archivo/carpeta.
- **`Platform 'esp32:esp32' not found`** en Arduino IDE → falta instalar el paquete de placas ESP32 (File → Preferences → Additional Board Manager URLs → `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json` → Boards Manager → instalar "esp32 by Espressif Systems").
- **`AttributeError: 'NoneType' object has no attribute 'startswith'`** al correr Django → falta el archivo `.env` en la raíz o le faltan variables (`DB_HOST`, etc.).
- **ACCESO DENEGADO siempre / redirección 301** → la URL de la API necesita la barra final antes de `?uid=` (`.../api/rfid/`, no `.../api/rfid`).
