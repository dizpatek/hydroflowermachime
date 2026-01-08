#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

/**
 * HYDRO FLOWER MACHINE - Otonom Hidroponik Kontrol Yazılımı
 * --------------------------------------------------------
 * Bu yazılım ESP32 tabanlı otonom bir hidroponik sistem için tasarlanmıştır.
 */

// --- YAPILANDIRMA ---
const char* ssid = "WiFi_Sizin_SSID";
const char* password = "WiFi_Sizin_Sifreniz";
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

// --- PİN TANIMLAMALARI (ESP32) ---
#define PUMP_CIRC_PIN 12
#define PUMP_PH_UP_PIN 13
#define PUMP_PH_DOWN_PIN 14
#define PUMP_NUTE_A_PIN 27
#define PUMP_NUTE_B_PIN 26

#define SENSOR_PH_PIN 34
#define SENSOR_TDS_PIN 35
#define SENSOR_TEMP_PIN 32

// --- DEĞİŞKENLER ---
float phValue = 7.0;
int tdsValue = 500;
float waterTemp = 22.5;
unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Baglaniyor: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi baglandi");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) message += (char)payload[i];
  
  if (String(topic) == "hydro/cmd/circ") {
    digitalWrite(PUMP_CIRC_PIN, message == "1" ? HIGH : LOW);
    Serial.println("Sirkulasyon: " + message);
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("MQTT Baglantisi kuruluyor...");
    if (client.connect("HydroMasterESP32")) {
      Serial.println("baglandi");
      client.subscribe("hydro/cmd/#");
    } else {
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_CIRC_PIN, OUTPUT);
  pinMode(PUMP_PH_UP_PIN, OUTPUT);
  pinMode(PUMP_PH_DOWN_PIN, OUTPUT);
  pinMode(PUMP_NUTE_A_PIN, OUTPUT);
  pinMode(PUMP_NUTE_B_PIN, OUTPUT);
  
  // WiFi ve MQTT su an kapali (User config gerekli)
  // setup_wifi();
  // client.setServer(mqtt_server, 1883);
  // client.setCallback(callback);
}

void loop() {
  // if (!client.connected()) reconnect();
  // client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 5000) {
    lastMsg = now;
    
    // Sensor okumalari (Simulasyon)
    phValue = 6.0 + (random(0, 100) / 100.0);
    tdsValue = 800 + random(-50, 50);
    
    Serial.print("{\"ph\":");
    Serial.print(phValue);
    Serial.print(", \"tds\":");
    Serial.print(tdsValue);
    Serial.print(", \"temp\":");
    Serial.print(waterTemp);
    Serial.println("}");
  }
}