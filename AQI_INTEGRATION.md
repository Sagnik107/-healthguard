# AQI.in Integration Guide

## Overview
This integration brings the best features from [aqi.in](https://www.aqi.in/in/dashboard/india/west-bengal/kolkata) to your Health Guard dashboard, providing comprehensive air quality monitoring for Kolkata with live data and interactive visualizations.

## Features Implemented

### 1. Live AQI Widget (`LiveAQIWidget.tsx`)
A comprehensive real-time air quality display featuring:

- **Live AQI Display**: Large, color-coded AQI number with status label
- **Location Tracking**: Shows Kolkata, West Bengal with live update timestamp
- **Major Pollutants Panel**:
  - PM2.5 (Particulate Matter 2.5μm)
  - PM10 (Particulate Matter 10μm)
  - NO2 (Nitrogen Dioxide)
  - O3 (Ozone)
  - SO2 (Sulfur Dioxide)
  - CO (Carbon Monoxide)
- **Cigarette Equivalent Calculator**: Shows daily cigarette exposure based on PM2.5 levels
- **Health Recommendations**:
  - General population advice
  - Sensitive groups warnings
  - Athletic individuals guidance
- **AQI Scale Visualization**: 6-tier color-coded scale (Good to Hazardous)

#### Color Coding
```
0-50    : Green (Good)
51-100  : Yellow (Moderate)
101-150 : Orange (Unhealthy for Sensitive)
151-200 : Red (Unhealthy)
201-300 : Purple (Very Unhealthy)
300+    : Dark Red (Hazardous)
```

### 2. AQI Trends Chart (`AQITrendsChart.tsx`)
Interactive historical data visualization with:

- **Multiple Time Ranges**:
  - 24 Hours (hourly data points)
  - 7 Days (daily data points)
  - 30 Days (daily data points)
- **Chart Types**:
  - Area Chart (default)
  - Line Chart
  - Bar Chart
- **Multiple Data Series**:
  - AQI (purple)
  - PM2.5 (red)
  - PM10 (orange)
- **Summary Statistics**:
  - Average AQI
  - Peak AQI
  - Average PM2.5
  - Average PM10

### 3. AQI Service (`aqiService.ts`)
Backend service layer providing:

- `fetchKolkataAQI()`: Fetches live AQI data (currently uses mock data)
- `getAQIColor()`: Returns color scheme based on AQI value
- `calculateCigaretteEquivalent()`: Converts PM2.5 to cigarette equivalent

## API Integration

### Current Implementation (Mock Data)
The system currently uses mock data to demonstrate functionality. The mock data includes:
- AQI: 171 (Unhealthy)
- PM2.5: 84 µg/m³
- PM10: 105 µg/m³
- Other pollutants with realistic values

### Real API Integration (Coming Soon)
To integrate with real AQI.in API:

1. **Get API Access**: Contact AQI.in for API credentials
2. **Update Service**: Modify `fetchKolkataAQI()` in `src/services/aqiService.ts`
3. **Environment Variables**: Add API key to `.env`:
   ```
   VITE_AQI_API_KEY=your_api_key_here
   ```

### Alternative API Options
If AQI.in API is not available, consider:
- **IQAir API**: https://www.iqair.com/air-pollution-data-api
- **OpenWeatherMap Air Pollution API**: https://openweathermap.org/api/air-pollution
- **AQICN API**: https://aqicn.org/api/

## Usage

### Dashboard Integration
Both components are integrated into the main Dashboard:

```tsx
import LiveAQIWidget from './LiveAQIWidget';
import AQITrendsChart from './AQITrendsChart';

// In Dashboard component:
<LiveAQIWidget />
<AQITrendsChart />
```

### Auto-Refresh
- **Live AQI Widget**: Updates every 5 minutes (300,000ms)
- **ThingSpeak Data**: Updates every 15 seconds (from your ESP32 sensors)

## Customization

### Changing Location
To monitor a different city, update in `aqiService.ts`:

```typescript
export async function fetchCityAQI(cityName: string): Promise<AQIResponse> {
  // Update API endpoint with city parameter
  // Update display location in LiveAQIWidget.tsx
}
```

### Adjusting Refresh Rate
In `LiveAQIWidget.tsx`:
```typescript
const interval = setInterval(fetchData, 300000); // Change to desired ms
```

### Modifying Chart Time Ranges
In `AQITrendsChart.tsx`:
```typescript
const [view, setView] = useState<'24h' | '7d' | '30d' | 'custom'>('24h');
```

## Health Recommendations Logic

Based on AQI levels:

| AQI Range | Category | Recommendations |
|-----------|----------|----------------|
| 0-50 | Good | Enjoy outdoor activities |
| 51-100 | Moderate | Unusually sensitive people should limit prolonged outdoor exertion |
| 101-150 | Unhealthy for Sensitive | Children, elderly, people with heart/lung disease should reduce prolonged outdoor exertion |
| 151-200 | Unhealthy | Everyone should avoid prolonged outdoor exertion. Sensitive groups should avoid all outdoor exertion |
| 201-300 | Very Unhealthy | Everyone should avoid all outdoor exertion |
| 300+ | Hazardous | Everyone should remain indoors and keep windows closed |

## Cigarette Equivalent Formula

Based on Berkeley Earth research:
```
Cigarettes per day = PM2.5 (µg/m³) / 22
```

Example: PM2.5 of 84 µg/m³ = 3.8 cigarettes/day

## Data Flow

```
AQI.in API → aqiService.ts → LiveAQIWidget.tsx → Dashboard.tsx
                           → AQITrendsChart.tsx → Dashboard.tsx

ESP32 Sensors → ThingSpeak API → useThingSpeakData.ts → Dashboard.tsx
```

## Performance Optimization

- **Lazy Loading**: Components use React.lazy() for code splitting
- **Memoization**: Chart data is memoized to prevent unnecessary re-renders
- **Debouncing**: API calls are debounced to prevent rate limiting
- **Caching**: Response data is cached for 5 minutes

## Troubleshooting

### Widget Not Showing Data
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check network tab for API responses

### Charts Not Rendering
1. Ensure Recharts is installed: `npm install recharts`
2. Check browser compatibility (requires modern browser)
3. Verify data format matches expected interface

### Styling Issues
1. Ensure Tailwind CSS is properly configured
2. Check for conflicting CSS classes
3. Verify dark theme variables are defined

## Future Enhancements

- [ ] Real-time API integration with AQI.in
- [ ] Multi-city support
- [ ] Weather data integration
- [ ] Air quality forecasting
- [ ] Historical data export (CSV/PDF)
- [ ] Push notifications for unhealthy AQI levels
- [ ] Comparison with WHO standards
- [ ] Pollen count integration
- [ ] UV index display

## Resources

- [AQI.in Website](https://www.aqi.in)
- [US EPA AQI Guide](https://www.airnow.gov/aqi/aqi-basics/)
- [WHO Air Quality Guidelines](https://www.who.int/news-room/feature-stories/detail/what-are-the-who-air-quality-guidelines)
- [Berkeley Earth Cigarette Equivalent Study](http://berkeleyearth.org/air-pollution-and-cigarette-equivalence/)

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify all dependencies are installed
4. Check that API keys are correctly configured

---

**Last Updated**: November 8, 2025
**Version**: 1.0.0
