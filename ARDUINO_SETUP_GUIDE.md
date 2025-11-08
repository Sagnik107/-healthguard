# Arduino ESP32 Sensor Setup - Field Mapping

## 📡 Your Hardware Configuration

### Sensors Connected:
- **DHT11**: Temperature & Humidity sensor (Pin 15)
- **MQ-135**: Air quality sensor (Pin 34)

### WiFi Configuration:
- **SSID**: R Mondal Hostel 3
- **ThingSpeak API Key**: R3I1JJW8QKNIAI86
- **Channel ID**: 3148652

---

## 📊 Field Mapping (Arduino → ThingSpeak → Dashboard)

| Field | Arduino Sends | Dashboard Shows | Unit |
|-------|--------------|-----------------|------|
| **Field 1** | Temperature | Temperature | °C |
| **Field 2** | Humidity | Humidity | % |
| **Field 3** | CO2 (calculated) | CO2 Level | ppm |
| **Field 4** | NH3 (calculated) | NH3 Level | ppm |
| **Field 5** | CO (calculated) | CO Level | ppm |
| **Field 6** | AQI Code (1-3) | Air Quality Index | AQI |

### AQI Code Conversion:
- **1** = Good (avg_ppm < 100) → Dashboard shows **50 AQI** 🟢
- **2** = Moderate (avg_ppm < 400) → Dashboard shows **100 AQI** 🟡
- **3** = Poor (avg_ppm ≥ 400) → Dashboard shows **150 AQI** 🔴

---

## 🔄 Data Flow

```
ESP32 Sensors → ThingSpeak (every 20s) → Dashboard (refreshes every 15s)
```

1. **ESP32 reads sensors** (DHT11 + MQ-135)
2. **Calculates gas concentrations** (CO2, NH3, CO)
3. **Sends to ThingSpeak** via HTTP GET
4. **Dashboard fetches** latest data every 15 seconds
5. **Charts update** with historical trends

---

## 🎯 Dashboard Display

Your dashboard now shows:

### Metric Cards (Top Row):
1. 🌡️ **Temperature** - From DHT11 sensor
2. 💧 **Humidity** - From DHT11 sensor  
3. 🌫️ **CO2 Level** - Calculated from MQ-135
4. 🟢 **NH3 Level** - Calculated from MQ-135
5. 🔴 **CO Level** - Calculated from MQ-135
6. 🌈 **Air Quality Index** - Based on average gas levels

### Charts (Bottom Section):
1. Temperature trend over time
2. Humidity trend over time
3. CO2 level trend
4. NH3 level trend
5. CO level trend
6. AQI trend

---

## 🛠️ Arduino Code Summary

### Gas Calculations (from MQ-135):
```cpp
float rs = (3.3 - vout) * RL / vout;
float ratio = rs / R0;

CO2 = 116.6020682 * pow(ratio, -2.769034857)
NH3 = 102.2 * pow(ratio, -2.473)
CO  = 605.18 * pow(ratio, -3.937)
```

### AQI Determination:
```cpp
avg_ppm = (CO2 + NH3 + CO) / 3.0

if (avg_ppm < 100)  → AQI Code = 1 (Good)
if (avg_ppm < 400)  → AQI Code = 2 (Moderate)  
if (avg_ppm >= 400) → AQI Code = 3 (Poor)
```

### Update Frequency:
- Arduino sends data every **20 seconds** (20000ms delay)
- ThingSpeak free tier minimum: **15 seconds**
- Dashboard auto-refresh: **15 seconds**

---

## 📱 How to Use

### 1. Upload Arduino Code:
```
1. Open Arduino IDE
2. Select Board: ESP32 Dev Module
3. Select correct COM port
4. Upload sketch
5. Open Serial Monitor (9600 baud)
```

### 2. Monitor Serial Output:
```
🌡️ Temp: 25.30 °C
💧 Humidity: 65.20 %
📟 ADC: 1234
🟢 CO2: 412.50 ppm
🟠 NH3: 98.30 ppm
🔴 CO: 75.40 ppm
🌫️ AQI: 195.40 → Moderate
✅ Data sent successfully to ThingSpeak!
```

### 3. View Dashboard:
```
http://localhost:5173/
```
Watch real-time updates every 15 seconds!

---

## 🔧 Troubleshooting

### WiFi Connection Issues:
```cpp
❌ WiFi Connection Failed!
```
**Solutions:**
- Check WiFi name/password in code
- Try mobile hotspot instead
- Move ESP32 closer to router
- Check if WiFi is 2.4GHz (ESP32 doesn't support 5GHz)

### Data Not Sending:
```cpp
❌ Error sending data. HTTP code: -11
```
**Solutions:**
- Connection refused - use mobile hotspot
- Check firewall settings
- Verify API key is correct
- Check ThingSpeak server status

### Sensor Reading Issues:
```cpp
Temperature: nan °C
```
**Solutions:**
- Check DHT11 wiring (VCC, GND, Data to Pin 15)
- Verify DHTesp library is installed
- Try different DHT11 sensor (may be faulty)

### MQ-135 Issues:
```cpp
ADC: 0 or 4095 (constant)
```
**Solutions:**
- Check MQ-135 wiring (VCC, GND, A0 to Pin 34)
- Preheat sensor for 24-48 hours for accurate readings
- Adjust R0 value based on calibration

---

## 🎨 Sensor Calibration

### MQ-135 R0 Calibration:
1. Place sensor in fresh air
2. Let it run for 24 hours
3. Read average RS value
4. Calculate: `R0 = RS / 3.6` (for clean air)
5. Update in code: `const float R0 = YOUR_VALUE;`

Current R0 in code: **7200**

---

## 📊 Expected Values

### Normal Indoor Conditions:
- **Temperature**: 20-30°C
- **Humidity**: 40-70%
- **CO2**: 400-1000 ppm (outdoor: ~400)
- **NH3**: 0-100 ppm
- **CO**: 0-50 ppm
- **AQI**: 1-2 (Good to Moderate)

### Poor Air Quality:
- **CO2**: > 1000 ppm
- **Average PPM**: > 400
- **AQI**: 3 (Poor)

---

## ✅ Status Indicators

### Serial Monitor Messages:
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning
- 🔁 = Reconnecting
- 📡 = Network info

### Dashboard Indicators:
- 🟢 Green = Good/Normal
- 🟡 Yellow = Moderate/Warning
- 🔴 Red = Poor/Danger

---

## 🚀 Quick Start Commands

### Arduino:
1. Verify code: `Ctrl + R`
2. Upload: `Ctrl + U`
3. Serial Monitor: `Ctrl + Shift + M`

### Dashboard:
```powershell
cd "c:\Users\SagnikLaptop\Desktop\healthguard\health guard 1.0"
npm run dev
```

Then open: http://localhost:5173/

---

**Your system is ready! Upload the Arduino code and watch real-time data appear on your dashboard!** 🎉
