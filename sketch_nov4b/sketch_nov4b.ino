#include <WiFi.h>
#include <HTTPClient.h>
#include "DHTesp.h"
#include <math.h>

// =======================
// WiFi & ThingSpeak Setup
// =======================
const char* ssid = "R Mondal Hostel 3";
const char* password = "9830583994";
const char* server = "http://api.thingspeak.com/update";
String apiKey = "R3I1JJW8QKNIAI86";   // ✅ Your API key

// =======================
// Sensor Pin Configuration
// =======================
const int DHT_PIN = 15;
const int MQ135_PIN = 34;

DHTesp dht;

const float RL = 10000;
const float R0 = 7200;

// =====================
// Setup Function
// =====================
void setup() {
  Serial.begin(9600);
  dht.setup(DHT_PIN, DHTesp::DHT11);

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 30) {
    delay(500);
    Serial.print(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed! Please check WiFi name/password or use hotspot.");
  }
}

// =====================
// Main Loop
// =====================
void loop() {
  // Reconnect WiFi if lost
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("🔁 Reconnecting WiFi...");
    WiFi.disconnect();
    WiFi.begin(ssid, password);
    delay(3000);
    return; // Skip sending data this cycle
  }

  TempAndHumidity data = dht.getTempAndHumidity();
  int adcValue = analogRead(MQ135_PIN);
  float vout = adcValue * (3.3 / 4095.0);
  float rs = (3.3 - vout) * RL / vout;
  float ratio = rs / R0;

  float co2_ppm = 116.6020682 * pow(ratio, -2.769034857);
  float nh3_ppm = 102.2 * pow(ratio, -2.473);
  float co_ppm  = 605.18 * pow(ratio, -3.937);

  float avg_ppm = (co2_ppm + nh3_ppm + co_ppm) / 3.0;

  int aqi_code;
  String airQuality;
  if (avg_ppm < 100) { aqi_code = 1; airQuality = "Good"; }
  else if (avg_ppm < 400) { aqi_code = 2; airQuality = "Moderate"; }
  else { aqi_code = 3; airQuality = "Poor"; }

  Serial.println("==============================");
  Serial.print("🌡️ Temp: "); Serial.print(data.temperature); Serial.println(" °C");
  Serial.print("💧 Humidity: "); Serial.print(data.humidity); Serial.println(" %");
  Serial.print("📟 ADC: "); Serial.println(adcValue);
  Serial.print("🟢 CO2: "); Serial.print(co2_ppm); Serial.println(" ppm");
  Serial.print("🟠 NH3: "); Serial.print(nh3_ppm); Serial.println(" ppm");
  Serial.print("🔴 CO: "); Serial.print(co_ppm); Serial.println(" ppm");
  Serial.print("🌫️ AQI: "); Serial.print(avg_ppm); Serial.print(" → "); Serial.println(airQuality);
  Serial.println("==============================");

  HTTPClient http;
  String url = String(server) + "?api_key=" + apiKey +
               "&field1=" + String(data.temperature, 2) +
               "&field2=" + String(data.humidity, 2) +
               "&field3=" + String(co2_ppm, 2) +
               "&field4=" + String(nh3_ppm, 2) +
               "&field5=" + String(co_ppm, 2) +
               "&field6=" + String(aqi_code);

  http.begin(url);
  int httpCode = http.GET();

  if (httpCode == 200) {
    Serial.println("✅ Data sent successfully to ThingSpeak!");
  } 
  else if (httpCode == -11) {
    Serial.println("⚠️ Connection refused! Try using mobile hotspot or check WiFi firewall.");
  } 
  else {
    Serial.print("❌ Error sending data. HTTP code: ");
    Serial.println(httpCode);
  }

  http.end();
  delay(20000);
}
