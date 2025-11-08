# HealthGuard Dashboard - Quick Reference

## 🎯 Key Features

### Dashboard Overview
- **Real-time Monitoring**: Data refreshes every 15 seconds
- **6 Metric Cards**: Live display of health and environmental data
- **6 Trend Charts**: Historical data visualization
- **Connection Status**: Real-time ThingSpeak channel status
- **Manual Refresh**: Force update button

---

## 📊 Metrics Displayed

| Metric | Description | Unit | Color Code |
|--------|-------------|------|------------|
| **AQI** | Air Quality Index | AQI | Green (0-50), Yellow (51-100), Red (100+) |
| **PM2.5** | Particulate Matter 2.5 | μg/m³ | Standard |
| **CO2** | Carbon Dioxide Level | ppm | Standard |
| **Temperature** | Ambient Temperature | °C | Standard |
| **Humidity** | Relative Humidity | % | Standard |
| **Stress** | Stress Level | % | Green (0-30), Yellow (31-70), Red (70+) |

---

## 🔗 API Endpoints

### Read Operations
```
Channel Feed:    GET /channels/3148652/feeds.json?results=50
Specific Field:  GET /channels/3148652/fields/1.json?results=20
Channel Status:  GET /channels/3148652/status.json
```

### Write Operations
```
Update Data:     GET /update?api_key=R3I1JJW8QKNIAI86&field1=val&field2=val...
```

---

## 💻 Code Examples

### Reading Data (Automatic)
```typescript
// The dashboard automatically fetches data using the custom hook
const { metrics, trendData, loading, error, refresh } = useThingSpeakData(15000);
```

### Writing Data (Manual)
```typescript
import { writeToThingSpeak } from './services/thingspeakService';

await writeToThingSpeak({
  field1: 85,   // AQI
  field2: 25,   // PM2.5
  field3: 450,  // CO2
  field4: 22,   // Temperature
  field5: 60,   // Humidity
  field6: 35    // Stress
});
```

### Testing Connection
```typescript
import { testThingSpeakConnection } from './utils/testThingSpeak';
testThingSpeakConnection();
```

### Sending Sample Data
```typescript
import { sendSampleData } from './utils/writeThingSpeak';
sendSampleData();
```

---

## 🎨 Color Codes

### Air Quality Index (AQI)
- **0-50** (Good): 🟢 Green
- **51-100** (Moderate): 🟡 Yellow
- **101-150** (Unhealthy for Sensitive): 🟠 Orange
- **151+** (Unhealthy): 🔴 Red

### Stress Level
- **0-30%** (Low): 🟢 Green
- **31-70%** (Moderate): 🟡 Yellow
- **71-100%** (High): 🔴 Red

### Pathogen Risk
- **0-3** (Low): 🟢 Green
- **4-7** (Moderate): 🟡 Yellow
- **8-10** (High): 🔴 Red

---

## ⚡ Quick Commands

### Development
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### Testing
```javascript
// In browser console
import { testThingSpeakConnection } from './utils/testThingSpeak';
testThingSpeakConnection();
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
VITE_THINGSPEAK_CHANNEL_ID=3148652
VITE_THINGSPEAK_API_KEY=R3I1JJW8QKNIAI86
```

### Refresh Interval
Edit `src/components/Dashboard.tsx`:
```typescript
const { metrics, trendData } = useThingSpeakData(15000); // milliseconds
```

### Chart Data Points
Edit `src/hooks/useThingSpeakData.ts`:
```typescript
fetchAllTrends(50); // number of data points
```

---

## 📱 Mobile Responsiveness

The dashboard is fully responsive with breakpoints:
- **Mobile**: Single column layout
- **Tablet**: 2 columns for metrics, 1 for charts
- **Desktop**: 3 columns for metrics, 2 for charts

---

## 🚨 Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | Network issue | Check internet connection |
| "No data available" | Empty channel | Send data to ThingSpeak first |
| "Rate limit exceeded" | Too many requests | Wait 15 seconds between updates |
| "Invalid API key" | Wrong key in .env | Verify API key is correct |

---

## 📈 Performance Tips

1. **Optimize Refresh Rate**: Don't go below 15 seconds
2. **Limit Data Points**: Keep chart data to 50-100 points
3. **Use Lazy Loading**: Components load progressively
4. **Error Boundaries**: Graceful error handling implemented

---

## 🎯 Best Practices

### Data Collection
- Update ThingSpeak every 15-20 seconds (minimum)
- Validate sensor data before sending
- Handle sensor disconnections gracefully

### Dashboard Usage
- Monitor connection status indicator
- Use manual refresh if needed
- Check browser console for detailed errors

### Arduino/ESP Integration
```cpp
// Update interval
const int UPDATE_INTERVAL = 15000; // 15 seconds minimum

// Error handling
if (httpCode == 200) {
  Serial.println("Data sent successfully");
} else {
  Serial.println("Error: " + String(httpCode));
}
```

---

## 📚 File Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard
│   ├── MetricCard.tsx         # Metric display cards
│   ├── ChartCard.tsx          # Chart components
│   ├── ThingSpeakStatus.tsx   # Channel status
│   └── Navbar.tsx             # Navigation
├── services/
│   └── thingspeakService.ts   # API integration
├── hooks/
│   └── useThingSpeakData.ts   # Data fetching hook
├── utils/
│   ├── testThingSpeak.ts      # Connection testing
│   └── writeThingSpeak.ts     # Data writing
└── types.ts                   # TypeScript definitions
```

---

## 🔐 Security Notes

- API keys are in `.env` (not committed to git)
- Read operations don't require authentication
- Write API key should be kept secure
- Consider using read API key for production

---

## 📞 Support Resources

- **ThingSpeak Docs**: https://www.mathworks.com/help/thingspeak/
- **API Reference**: https://www.mathworks.com/help/thingspeak/rest-api.html
- **Community**: https://www.mathworks.com/matlabcentral/

---

## ✅ Checklist for Going Live

- [ ] Verify all sensors are connected
- [ ] Test data writing to ThingSpeak
- [ ] Confirm dashboard displays correct data
- [ ] Set appropriate refresh intervals
- [ ] Configure error alerts
- [ ] Document field mappings
- [ ] Set up monitoring and logging
- [ ] Create backup of configuration

---

**Last Updated**: November 7, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready
