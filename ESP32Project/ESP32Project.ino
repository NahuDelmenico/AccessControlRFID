#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Red virtual del simulador Wokwi (no requiere contraseña)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// host.wokwi.internal apunta al localhost de la PC que corre la simulación
// (funciona con la extensión de Wokwi para VS Code). Django debe correr con
// runserver 0.0.0.0:8000 y la URL necesita la barra final antes de "?uid=".
const char* API_URL = "http://host.wokwi.internal:8000/api/rfid/";

LiquidCrystal_I2C lcd(0x27, 16, 2);

#define SS_PIN 5
#define RST_PIN 22

#define BUZZER 2

#define LED_VERDE 14
#define LED_ROJO 13

MFRC522 rfid(SS_PIN, RST_PIN);

byte uidPermitido[4] = {
  0x11,
  0x22,
  0x33,
  0X44,

};

void setup() {

  //SETEO DE SERIAL
  Serial.begin(115200);
  delay(1000);

  //EJECUTAMOS LA CONECCION A WIFI 
  conectarWiFi();

  //SETEO DE LEDS 
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);

  SPI.begin();

  //INICIO RFID
  rfid.PCD_Init();

  Serial.println("Sistema RFID iniciado");
  Serial.println("Esperando tarjeta...");


  //SETEO DE LCD 
  Wire.begin(32, 33);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Sistema RFID");

  lcd.setCursor(0, 1);
  lcd.print("Esperando...");

  //SETEO DE BUZZER
  pinMode(BUZZER, OUTPUT);
  digitalWrite(BUZZER, LOW);

}

void loop() {

  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid = obtenerUID();

  String nombre = "";

  bool autorizado = consultarAcceso(
    uid,
    nombre
  );

  Serial.print("UID: ");

  for (byte i = 0; i < rfid.uid.size; i++) {
    Serial.print(rfid.uid.uidByte[i], HEX);
    Serial.print(" ");
  }

  Serial.println();

  if (autorizado) {

    Serial.println("ACCESO PERMITIDO");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("ACCESO");

    lcd.setCursor(0, 1);
    lcd.print("PERMITIDO");

    digitalWrite(LED_VERDE, HIGH);
    digitalWrite(LED_ROJO, LOW);

    beepPermitido();

    delay(2000);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Esperando");

    lcd.setCursor(0, 1);
    lcd.print("Tarjeta...");

    digitalWrite(LED_VERDE, LOW);

  } else {

    Serial.println("ACCESO DENEGADO");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("ACCESO");

    lcd.setCursor(0, 1);
    lcd.print("DENEGADO");

    digitalWrite(LED_ROJO, HIGH);
    digitalWrite(LED_VERDE, LOW);

    beepDenegado();

    delay(2000);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Esperando");

    lcd.setCursor(0, 1);
    lcd.print("Tarjeta...");

    digitalWrite(LED_ROJO, LOW);
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

void beepPermitido() {
  digitalWrite(BUZZER, HIGH);
  delay(100);
  digitalWrite(BUZZER, LOW);
}

void beepDenegado() {
  for(int i = 0; i < 2; i++) {
    digitalWrite(BUZZER, HIGH);
    delay(200);
    digitalWrite(BUZZER, LOW);
    delay(100);
  }
}

void conectarWiFi() {
  Serial.println("Conectando a WiFi...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int intentos = 0;

  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nError al conectar WiFi");
  }
}

String obtenerUID() {

  String uid = "";

  for (byte i = 0; i < rfid.uid.size; i++) {

    if (rfid.uid.uidByte[i] < 0x10)
      uid += "0";

    uid += String(rfid.uid.uidByte[i], HEX);

    if (i < rfid.uid.size - 1)
      uid += ":";
  }

  uid.toUpperCase();

  return uid;
}

bool consultarAcceso(String uid, String &nombre) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado");
    return false;
  }

  HTTPClient http;

  String url = String(API_URL) + "?uid=" + uid;

  Serial.println(url);

  http.begin(url);

  int httpCode = http.GET();

  if (httpCode <= 0) {

    Serial.println("Error HTTP");

    http.end();

    return false;
  }

  String response = http.getString();

  Serial.println(response);

  DynamicJsonDocument doc(512);

  deserializeJson(doc, response);

  bool autorizado = doc["authorized"];

  if (autorizado) {
    nombre = doc["name"].as<String>();
  }

  http.end();

  return autorizado;
}