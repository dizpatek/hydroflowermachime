#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <Wire.h>
#include <RTClib.h>

/**
 * ═══════════════════════════════════════════════════════════════════
 * HYDROFLOWER PRO AI - ESP32-C3 FIRMWARE
 * Otonom Hidroponik Kontrol Sistemi
 * ═══════════════════════════════════════════════════════════════════
 */

// ═══ CONFIGURATION ═══
// #define SIMULATION_MODE  // Uncomment this line to test without hardware

// ═══ WIFI CONFIGURATION ═══
const char* ssid = "Murphy";
const char* password = "sifreyok";
const char* websocket_server = "192.168.1.33"; // Auto-detected PC IP
const uint16_t websocket_port = 3001;

// Sensors
#define TDS_PIN 2          // ADC for TDS sensor
#define PH_PIN 3           // ADC for pH sensor
#define DS18B20_PIN 4      // OneWire for water temp
#define DHT_PIN 5          // DHT22 for air temp/humidity
#define SDA_PIN 6          // I2C SDA for RTC
#define SCL_PIN 7          // I2C SCL for RTC

// Actuators (Relays)
#define PUMP_MAIN 8        // Main circulation pump
#define PUMP_PH_UP 9       // pH Up dosing pump
#define PUMP_PH_DOWN 10    // pH Down dosing pump
#define PUMP_NUTRIENT 18   // Nutrient dosing pump
#define LIGHT_PIN 19       // Grow light (via SSR)
#define HUMIDIFIER_PIN 20  // Humidifier
#define FAN_PIN 21         // Fan (PWM capable)

// ═══ SENSOR OBJECTS ═══
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);
DHT dht(DHT_PIN, DHT22);
RTC_DS3231 rtc;
WebSocketsClient webSocket;

// ═══ CALIBRATION VALUES ═══
// TDS Calibration (adjust based on your sensor)
#define TDS_VREF 3.3
#define TDS_SCOUNT 30
int tdsAnalogBuffer[TDS_SCOUNT];
int tdsAnalogBufferIndex = 0;

// pH Calibration (two-point calibration)
float phCalibration_4 = 3.0;   // Voltage at pH 4.0
float phCalibration_7 = 2.5;   // Voltage at pH 7.0

// ═══ GLOBAL VARIABLES ═══
unsigned long lastSensorRead = 0;
unsigned long lastWebSocketSend = 0;
const unsigned long SENSOR_INTERVAL = 5000;  // Read sensors every 5s
const unsigned long WEBSOCKET_INTERVAL = 3000; // Send data every 3s

struct SensorData {
  float ph;
  int tds;
  float waterTemp;
  float airTemp;
  float humidity;
  float flowRate;
  String waterLevel;
  float orp;
} currentData;

// Function Prototypes
void readAllSensors();
float readPH();
int readTDS();
void printSensorData();
void controlPump(int pin, bool state, int duration = 0);
void controlFan(int speed);
void checkLightSchedule();
void sendSensorData();
void sendLog(String message, String level);
void handleWebSocketCommand(char* payload);
void connectWiFi();
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);
void runAutopilot();

// ═══════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n╔════════════════════════════════════════╗");
  Serial.println("║   HYDROFLOWER PRO AI - ESP32-C3        ║");
  Serial.println("║   Firmware v1.0                        ║");
  Serial.println("╚════════════════════════════════════════╝\n");

  // Initialize I2C for RTC
  Wire.begin(SDA_PIN, SCL_PIN);
  
#ifndef SIMULATION_MODE
  // Initialize Real Sensors
  if (!rtc.begin()) {
    Serial.println("❌ RTC bulunamadı!");
  } else {
    Serial.println("✅ RTC başlatıldı");
    if (rtc.lostPower()) {
      Serial.println("⚠️  RTC zamanı sıfırlandı, ayarlanıyor...");
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
  }

  ds18b20.begin();
  dht.begin();
  Serial.println("✅ Sensörler başlatıldı");
#else
  Serial.println("⚠️  SİMÜLASYON MODU AKTİF - Sensörler devre dışı");
#endif

  // Initialize actuator pins
  pinMode(PUMP_MAIN, OUTPUT);
  pinMode(PUMP_PH_UP, OUTPUT);
  pinMode(PUMP_PH_DOWN, OUTPUT);
  pinMode(PUMP_NUTRIENT, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(HUMIDIFIER_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);

  // Turn off all actuators initially
  digitalWrite(PUMP_MAIN, LOW);
  digitalWrite(PUMP_PH_UP, LOW);
  digitalWrite(PUMP_PH_DOWN, LOW);
  digitalWrite(PUMP_NUTRIENT, LOW);
  digitalWrite(LIGHT_PIN, LOW);
  digitalWrite(HUMIDIFIER_PIN, LOW);
  analogWrite(FAN_PIN, 0);
  Serial.println("✅ Aktüatörler başlatıldı");

  // Connect to WiFi
  connectWiFi();

  // Setup WebSocket
  webSocket.begin(websocket_server, websocket_port, "/socket.io/?EIO=4&transport=websocket");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  Serial.println("✅ WebSocket yapılandırıldı");
}

// ═══ AUTOPILOT CONFIGURATION ═══
struct SystemConfig {
  bool autopilotEnabled = false;
  float targetPH = 6.0;
  float phTolerance = 0.2;
  int targetTDS = 1000;
  int tdsTolerance = 100;
  int dosingInterval = 900000; // 15 mins (safety delay between doses)
} sysConfig;

unsigned long lastDoseTime = 0;

// ═══════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════
void loop() {
  webSocket.loop();

  unsigned long now = millis();

  // Read sensors periodically
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readAllSensors();
    printSensorData();
    
    // Run Autopilot Logic if enabled
    if (sysConfig.autopilotEnabled) {
      runAutopilot();
    }
  }

  // Send data to server periodically
  if (now - lastWebSocketSend >= WEBSOCKET_INTERVAL) {
    lastWebSocketSend = now;
    sendSensorData();
  }

  // Check light schedule (RTC-based)
  checkLightSchedule();
}

// ═══════════════════════════════════════════════════════════════════
// AUTOPILOT LOGIC
// ═══════════════════════════════════════════════════════════════════

void runAutopilot() {
  unsigned long now = millis();
  
  // Safety: Enforce waiting period after any dosing
  if (now - lastDoseTime < sysConfig.dosingInterval) {
    return;
  }

  // 1. pH Control
  // Too Acidic (Low pH) -> Add pH Up (Base)
  if (currentData.ph < (sysConfig.targetPH - sysConfig.phTolerance)) {
    String msg = "AI: pH Low (" + String(currentData.ph) + ") - Dosing pH Up";
    Serial.println(msg);
    sendLog(msg, "AI_DECISION");
    controlPump(PUMP_PH_UP, true, 2000); // 2 second dose
    lastDoseTime = now;
    return; // Dose one thing at a time
  }
  
  // Too Alkaline (High pH) -> Add pH Down (Acid)
  else if (currentData.ph > (sysConfig.targetPH + sysConfig.phTolerance)) {
    String msg = "AI: pH High (" + String(currentData.ph) + ") - Dosing pH Down";
    Serial.println(msg);
    sendLog(msg, "AI_DECISION");
    controlPump(PUMP_PH_DOWN, true, 2000); // 2 second dose
    lastDoseTime = now;
    return;
  }

  // 2. Nutrient (TDS) Control
  // TDS too low -> Add Nutrients
  // Note: We rarely remove nutrients automatically (requires water change)
  if (currentData.tds < (sysConfig.targetTDS - sysConfig.tdsTolerance)) {
    String msg = "AI: Nutrients Low (" + String(currentData.tds) + ") - Dosing Nutrients";
    Serial.println(msg);
    sendLog(msg, "AI_DECISION");
    controlPump(PUMP_NUTRIENT, true, 3000); // 3 second dose
    lastDoseTime = now;
    return;
  }
  
  // 3. Environment Control
  // Humidity too low -> Toggle Humidifier
  if (currentData.humidity < 50.0) {
    digitalWrite(HUMIDIFIER_PIN, HIGH);
  } else if (currentData.humidity > 70.0) {
    digitalWrite(HUMIDIFIER_PIN, LOW);
  }
  
  // Temperature too high -> Turn on Fan
  if (currentData.airTemp > 26.0) {
    controlFan(255); // Max speed
  } else if (currentData.airTemp < 24.0) {
    controlFan(0); // Stop fan
  }
}

// ═══════════════════════════════════════════════════════════════════
// SENSOR READING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

void readAllSensors() {
#ifdef SIMULATION_MODE
  // Generate random realistic data
  currentData.ph = 5.8 + ((random(0, 100) / 100.0) * 0.8); // 5.8 - 6.6
  currentData.tds = 900 + random(-50, 50);
  currentData.waterTemp = 20.0 + ((random(0, 100) / 100.0) * 2.0);
  currentData.airTemp = 24.0 + ((random(0, 100) / 100.0) * 2.0);
  currentData.humidity = 55.0 + random(-5, 5);
  currentData.flowRate = 3.5;
  currentData.waterLevel = "OK";
  currentData.orp = 350.0 + random(-10, 10);
  return;
#endif

  // Read pH
  currentData.ph = readPH();

  // Read TDS
  currentData.tds = readTDS();

  // Read water temperature (DS18B20)
  ds18b20.requestTemperatures();
  currentData.waterTemp = ds18b20.getTempCByIndex(0);

  // Read air temperature and humidity (DHT22)
  currentData.airTemp = dht.readTemperature();
  currentData.humidity = dht.readHumidity();

  // Simulated values (add real sensors if available)
  currentData.flowRate = 3.5;
  currentData.waterLevel = "OK";
  currentData.orp = 350.0;
}

float readPH() {
  int analogValue = analogRead(PH_PIN);
  float voltage = analogValue * (TDS_VREF / 4095.0);
  
  // Two-point calibration
  float slope = (7.0 - 4.0) / (phCalibration_7 - phCalibration_4);
  float ph = 7.0 + slope * (voltage - phCalibration_7);
  
  return constrain(ph, 0.0, 14.0);
}

int readTDS() {
  // Median filtering for stable readings
  tdsAnalogBuffer[tdsAnalogBufferIndex++] = analogRead(TDS_PIN);
  if (tdsAnalogBufferIndex >= TDS_SCOUNT) tdsAnalogBufferIndex = 0;

  int sortedBuffer[TDS_SCOUNT];
  for (int i = 0; i < TDS_SCOUNT; i++) {
    sortedBuffer[i] = tdsAnalogBuffer[i];
  }
  
  // Simple bubble sort
  for (int i = 0; i < TDS_SCOUNT - 1; i++) {
    for (int j = 0; j < TDS_SCOUNT - i - 1; j++) {
      if (sortedBuffer[j] > sortedBuffer[j + 1]) {
        int temp = sortedBuffer[j];
        sortedBuffer[j] = sortedBuffer[j + 1];
        sortedBuffer[j + 1] = temp;
      }
    }
  }

  int medianValue = sortedBuffer[TDS_SCOUNT / 2];
  float voltage = medianValue * (TDS_VREF / 4095.0);
  
  // Temperature compensation
  float compensationCoefficient = 1.0 + 0.02 * (currentData.waterTemp - 25.0);
  float compensationVoltage = voltage / compensationCoefficient;
  
  // TDS calculation (adjust factor based on your sensor)
  int tdsValue = (int)((133.42 * compensationVoltage * compensationVoltage * compensationVoltage 
                        - 255.86 * compensationVoltage * compensationVoltage 
                        + 857.39 * compensationVoltage) * 0.5);
  
  return constrain(tdsValue, 0, 2000);
}

void printSensorData() {
  DateTime now = rtc.now();
  
  Serial.println("\n┌─────────────────────────────────────┐");
  Serial.printf("│ Zaman: %02d:%02d:%02d                  │\n", now.hour(), now.minute(), now.second());
  Serial.println("├─────────────────────────────────────┤");
  Serial.printf("│ pH:        %.2f                     │\n", currentData.ph);
  Serial.printf("│ TDS:       %d ppm                  │\n", currentData.tds);
  Serial.printf("│ Su Sıc:    %.1f°C                  │\n", currentData.waterTemp);
  Serial.printf("│ Hava Sıc:  %.1f°C                  │\n", currentData.airTemp);
  Serial.printf("│ Nem:       %.1f%%                   │\n", currentData.humidity);
  Serial.println("└─────────────────────────────────────┘");
}

// ═══════════════════════════════════════════════════════════════════
// ACTUATOR CONTROL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

void controlPump(int pin, bool state, int duration = 0) {
  digitalWrite(pin, state ? HIGH : LOW);
  
  if (state && duration > 0) {
    delay(duration);
    digitalWrite(pin, LOW);
  }
}

void controlFan(int speed) {
  // PWM control (0-255)
  analogWrite(FAN_PIN, constrain(speed, 0, 255));
}

void checkLightSchedule() {
  DateTime now = rtc.now();
  int hour = now.hour();
  
  // Light schedule: ON from 6:00 to 22:00 (16 hours)
  if (hour >= 6 && hour < 22) {
    digitalWrite(LIGHT_PIN, HIGH);
  } else {
    digitalWrite(LIGHT_PIN, LOW);
  }
}

// ═══════════════════════════════════════════════════════════════════
// WEBSOCKET FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

void sendSensorData() {
  if (!webSocket.isConnected()) return;

  StaticJsonDocument<512> doc;
  doc["timestamp"] = millis();
  doc["ph"] = currentData.ph;
  doc["tds"] = currentData.tds;
  doc["waterTemp"] = currentData.waterTemp;
  doc["airTemp"] = currentData.airTemp;
  doc["humidity"] = currentData.humidity;
  doc["flowRate"] = currentData.flowRate;
  doc["waterLevel"] = currentData.waterLevel;
  doc["orp"] = currentData.orp;

  String jsonString;
  serializeJson(doc, jsonString);
  
  webSocket.sendTXT("42[\"esp32:data\"," + jsonString + "]");
}

void sendLog(String message, String level) {
  if (!webSocket.isConnected()) return;

  StaticJsonDocument<256> doc;
  doc["message"] = message;
  doc["level"] = level;
  doc["source"] = "esp32";

  String jsonString;
  serializeJson(doc, jsonString);
  
  webSocket.sendTXT("42[\"esp32:log\"," + jsonString + "]");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("❌ WebSocket bağlantısı kesildi");
      break;
      
    case WStype_CONNECTED:
      Serial.println("✅ WebSocket bağlandı");
      break;
      
    case WStype_TEXT:
      Serial.printf("📨 Mesaj alındı: %s\n", payload);
      handleWebSocketCommand((char*)payload);
      break;
  }
}

void handleWebSocketCommand(char* payload) {
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) return;

  // Handle Settings Update
  if (doc.containsKey("settings")) {
    JsonObject settings = doc["settings"];
    sysConfig.autopilotEnabled = settings["autopilot"];
    sysConfig.targetPH = settings["targetPH"] | 6.0;
    sysConfig.targetTDS = settings["targetTDS"] | 1000;
    
    Serial.println("⚙️ Ayarlar güncellendi!");
    return;
  }

  // Handle Manual Actuator Control
  String pump = doc["pump"];
  bool state = doc["state"];
  int duration = doc["duration"] | 0;

  if (pump == "circ") controlPump(PUMP_MAIN, state);
  else if (pump == "phUp") controlPump(PUMP_PH_UP, state, duration);
  else if (pump == "phDown") controlPump(PUMP_PH_DOWN, state, duration);
  else if (pump == "nutrient") controlPump(PUMP_NUTRIENT, state, duration);
  else if (pump == "humidifier") digitalWrite(HUMIDIFIER_PIN, state ? HIGH : LOW);
  else if (pump == "fan") controlFan(doc["speed"] | 128);
}

// ═══════════════════════════════════════════════════════════════════
// WIFI CONNECTION
// ═══════════════════════════════════════════════════════════════════

void connectWiFi() {
  Serial.print("📡 WiFi'ye bağlanıyor");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi bağlandı!");
    Serial.print("IP Adresi: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi bağlantısı başarısız!");
  }
}