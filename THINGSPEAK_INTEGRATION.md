# ThingSpeak Integration Guide

## Overview
This application integrates with ThingSpeak IoT platform to display real-time health and environmental monitoring data.

## ThingSpeak Channel Configuration

**Channel ID:** 3148652
**Write API Key:** R3I1JJW8QKNIAI86

### Field Mapping

The dashboard is configured to display data from the following ThingSpeak fields:

- **Field 1:** Air Quality Index (AQI)
- **Field 2:** PM2.5 Particles (μg/m³)
- **Field 3:** CO2 Level (ppm)
- **Field 4:** Temperature (°C)
- **Field 5:** Humidity (%)
- **Field 6:** Stress Level (%)
- **Field 7:** Pathogen Risk Score (optional)
- **Field 8:** Reserved for future use

## API Endpoints

### Write Data
```
GET https://api.thingspeak.com/update?api_key=R3I1JJW8QKNIAI86&field1=0
```

### Read Channel Feed
```
GET https://api.thingspeak.com/channels/3148652/feeds.json?results=2
```

### Read Specific Field
```
GET https://api.thingspeak.com/channels/3148652/fields/1.json?results=2
```

### Read Channel Status
```
GET https://api.thingspeak.com/channels/3148652/status.json
```

## Features

### Real-time Data Display
- Automatic data refresh every 15 seconds
- Live metric cards showing current values
- 6 interactive trend charts with historical data

### Dashboard Components

1. **Metric Cards**
   - Air Quality Index with color-coded risk levels
   - PM2.5 particle concentration
   - CO2 levels
   - Temperature
   - Humidity
   - Stress levels

2. **Trend Charts**
   - Real-time line charts for each metric
   - Shows last 50 data points
   - Color-coded for easy identification
   - Interactive tooltips

3. **System Status**
   - Connection status indicator
   - Last update timestamp
   - Manual refresh button
   - Error handling and display

## Usage

### Reading Data
The application automatically fetches data from ThingSpeak using the custom hook `useThingSpeakData`:

```typescript
const { metrics, trendData, loading, error, lastUpdate, refresh } = useThingSpeakData(15000);
```

### Writing Data
To send data to ThingSpeak from your sensors:

```typescript
import { writeToThingSpeak } from './services/thingspeakService';

// Send multiple fields at once
await writeToThingSpeak({
  field1: 85,  // AQI
  field2: 25,  // PM2.5
  field3: 450, // CO2
  field4: 22,  // Temperature
  field5: 60,  // Humidity
  field6: 35   // Stress
});
```

### Arduino/ESP Integration

Use the provided Arduino sketch in `sketch_nov4b/` to send sensor data:

```cpp
// Example: Send data to ThingSpeak
String url = "/update?api_key=R3I1JJW8QKNIAI86";
url += "&field1=" + String(aqi);
url += "&field2=" + String(pm25);
url += "&field3=" + String(co2);
url += "&field4=" + String(temperature);
url += "&field5=" + String(humidity);
url += "&field6=" + String(stressLevel);
```

## Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
VITE_THINGSPEAK_CHANNEL_ID=3148652
VITE_THINGSPEAK_API_KEY=R3I1JJW8QKNIAI86
```

### Refresh Interval
Change the data refresh rate by modifying the parameter in Dashboard.tsx:

```typescript
const { metrics, trendData } = useThingSpeakData(15000); // 15 seconds
```

### Number of Data Points
Adjust the number of historical data points shown in charts:

```typescript
fetchAllTrends(50); // Shows last 50 readings
```

## Data Flow

1. **Sensors** → Send data to ThingSpeak via HTTP/MQTT
2. **ThingSpeak** → Stores data in channel fields
3. **Dashboard** → Fetches data every 15 seconds
4. **React Hook** → Processes and formats data
5. **Components** → Display metrics and charts

## Troubleshooting

### No Data Appearing
- Check if ThingSpeak channel has recent data
- Verify API key is correct in `.env`
- Check browser console for errors
- Ensure CORS is properly configured

### Charts Not Updating
- Check refresh interval setting
- Verify internet connection
- Look for API rate limiting (ThingSpeak free tier limits)

### Error Messages
The dashboard will display error messages if:
- API requests fail
- Network issues occur
- Invalid data is received

## API Rate Limits

ThingSpeak free tier limits:
- **Update interval:** Minimum 15 seconds between writes
- **Read requests:** No strict limit for public channels
- **Data retention:** Standard plan stores data indefinitely

## Future Enhancements

- [ ] Add WebSocket support for real-time updates
- [ ] Implement data export functionality
- [ ] Add historical data analysis
- [ ] Create custom alerts and notifications
- [ ] Support for multiple ThingSpeak channels
- [ ] Advanced data visualization options

## Support

For issues or questions:
- ThingSpeak Documentation: https://www.mathworks.com/help/thingspeak/
- ThingSpeak Community: https://www.mathworks.com/matlabcentral/

## License

This integration is part of the HealthGuard monitoring system.
