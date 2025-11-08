# Advanced Analytics - AI/ML Features

## Overview
The Advanced Analytics section provides deep insights and predictive models for air quality health trends, pattern analysis, and risk forecasting using historical data from 2015-present across 5 major Indian cities.

## Data Sources
The analytics engine processes historical AQI data from CSV files:
- **city_day.csv** - Daily city-level measurements (18,267 records)
- **city_hour.csv** - Hourly city-level measurements (438,247 records)
- **station_day.csv** - Daily station-level measurements (36,532 records)
- **station_hour.csv** - Hourly station-level measurements
- **stations.csv** - Station metadata (cities and station IDs)

### Cities Covered
- Delhi
- Mumbai
- Chennai
- Kolkata (default)
- Bangalore

### Pollutants Tracked
PM2.5, PM10, NO, NO2, NOx, NH3, CO, SO2, O3, Benzene, Toluene, Xylene

## Features

### 1. Historical Trends Analysis
**Endpoint**: `GET /api/analytics/trends?city={city}&timeRange={range}`

**Capabilities**:
- Monthly AQI trends with min/max/average values
- Pollutant-specific analysis (average, max, min, standard deviation)
- Time range filtering: 1 month, 3 months, 6 months, 1 year, all time
- Statistical measures: mean, median, standard deviation

**Visualizations**:
- Area chart showing monthly AQI trends
- Grid of pollutant statistics
- Summary cards with key metrics

### 2. AI/ML Forecast (7-Day Prediction)
**Endpoint**: `GET /api/analytics/forecast?city={city}&days={days}`

**ML Model**: Hybrid approach combining:
- **Moving Average** (7-day window) - 60% weight
- **Linear Regression** (trend analysis) - 40% weight
- Confidence intervals based on historical standard deviation

**Outputs**:
- 7-day AQI predictions
- Upper and lower confidence bounds
- Trend direction (increasing/decreasing/stable)
- Confidence level (high/medium/low)

**Visualizations**:
- Area chart with confidence intervals
- Detailed prediction cards with confidence ratings
- Trend indicators

### 3. Pattern Analysis
**Endpoint**: `GET /api/analytics/patterns?city={city}`

**Analysis Types**:

#### Seasonal Patterns
- Monthly average AQI across all years
- Identifies seasonal trends (winter vs. summer pollution)
- Bar chart visualization

#### Weekly Patterns
- Day-of-week analysis (Monday through Sunday)
- Identifies weekday vs. weekend differences
- Radar chart visualization

#### Hourly Patterns
- 24-hour cycle analysis (0:00 to 23:00)
- Identifies peak pollution hours
- Line chart visualization

#### Pollutant Correlations
- Pearson correlation coefficient between pollutant pairs
- Helps identify pollution sources
- Strength indicators (strong: >0.7, moderate: >0.4, weak: <0.4)

### 4. Risk Assessment
**Endpoint**: `GET /api/analytics/risk?city={city}`

**Risk Levels**:
- **Low** (AQI < 100): Minimal health impact
- **Low-Moderate** (AQI 100-150): Generally acceptable
- **Moderate** (AQI 150-200): Possible effects for sensitive individuals
- **High** (AQI 200-300): Health alert
- **Severe** (AQI > 300): Serious health effects

**Analysis**:
- 30-day rolling average
- AQI category distribution (Good, Satisfactory, Moderate, Poor, Very Poor, Severe)
- Percentage of unhealthy days (AQI > 150)
- Health impact assessment

**Recommendations**:
Risk-specific health recommendations including:
- Outdoor activity guidelines
- Mask recommendations (N95/N99)
- Air purifier usage
- Sensitive group precautions

## Technical Implementation

### Backend (`server/analytics.js`)
```javascript
// Core ML functions
- calculateTrends(city, timeRange)
- forecastAQI(city, days)
- analyzePatterns(city)
- assessRisk(city)
```

**Dependencies**:
- `csv-parser` - Streaming CSV parsing
- `simple-statistics` - Statistical analysis (mean, median, std dev, linear regression)

**Caching**: None currently (processes CSV files on each request)

### Frontend (`src/components/AnalyticsSection.tsx`)

**UI Features**:
- City selector (5 cities)
- Time range selector (1m, 3m, 6m, 1y, all time)
- 4 analysis tabs (Trends, Forecast, Patterns, Risk)
- Interactive charts using Recharts library

**Chart Types**:
- Area charts (trends, forecasts)
- Bar charts (seasonal patterns, risk distribution)
- Line charts (hourly patterns)
- Radar charts (weekly patterns)

## API Examples

### Get Historical Trends
```bash
curl http://localhost:4000/api/analytics/trends?city=Kolkata&timeRange=6m
```

### Get AI Forecast
```bash
curl http://localhost:4000/api/analytics/forecast?city=Delhi&days=7
```

### Get Pattern Analysis
```bash
curl http://localhost:4000/api/analytics/patterns?city=Mumbai
```

### Get Risk Assessment
```bash
curl http://localhost:4000/api/analytics/risk?city=Bangalore
```

## Machine Learning Details

### Forecasting Algorithm
1. **Data Preparation**
   - Extract last 30 days of AQI measurements
   - Filter out invalid values (NaN, null)
   - Sort chronologically

2. **Moving Average Calculation**
   - Window: Last 7 days
   - Provides baseline prediction
   - Weight: 60%

3. **Linear Regression**
   - Fits trend line to recent data
   - Extrapolates future values
   - Weight: 40%

4. **Confidence Intervals**
   - Calculate standard deviation from historical data
   - Lower bound: prediction - std_dev
   - Upper bound: prediction + std_dev
   - Confidence rating based on std_dev magnitude

### Pattern Detection
- **Seasonal**: Groups by month, calculates monthly averages
- **Weekly**: Groups by day of week, identifies weekday/weekend patterns
- **Hourly**: Groups by hour (0-23), identifies diurnal patterns
- **Correlations**: Pearson correlation coefficient for pollutant pairs

### Risk Calculation
1. Calculate 30-day rolling average AQI
2. Categorize into 6 AQI buckets
3. Determine risk level based on average
4. Calculate percentage distribution
5. Generate health recommendations

## Performance Considerations

### CSV File Size
- Total records: ~500,000+
- Processing time: ~1-5 seconds per endpoint
- Memory usage: ~50-100 MB during processing

### Optimization Opportunities
1. **Implement caching** for processed data (similar to AQI stations cache)
2. **Pre-aggregate data** by month/week/hour at startup
3. **Add database** (SQLite/PostgreSQL) for faster queries
4. **Implement pagination** for large result sets
5. **Add data filtering** to reduce processing load

## Future Enhancements

### Advanced ML Models
- ARIMA (AutoRegressive Integrated Moving Average) for better time-series forecasting
- LSTM (Long Short-Term Memory) neural networks for complex patterns
- Random Forest for multi-variate predictions
- Prophet (Facebook's time series library)

### Additional Features
- **Multi-city comparison** - Compare trends across cities
- **Anomaly detection** - Identify unusual pollution events
- **Health correlation** - Link AQI to hospital admissions/respiratory issues
- **Weather integration** - Factor in temperature, humidity, wind speed
- **Source attribution** - Identify pollution sources (traffic, industry, biomass burning)
- **Real-time predictions** - Update forecasts as new data arrives
- **Export functionality** - Download charts and reports

### Data Enhancements
- **Update CSV files** with 2024 data
- **Integrate real-time APIs** for current measurements
- **Add more cities** and stations
- **Include meteorological data**

## Usage in Frontend

Navigate to the **Analytics** section in the navbar to access:
1. Select your city
2. Choose time range
3. Explore the 4 tabs:
   - **Historical Trends** - View past patterns
   - **AI Forecast** - See 7-day predictions
   - **Pattern Analysis** - Discover seasonal/weekly/hourly trends
   - **Risk Assessment** - Understand current health risks

## Dependencies

### Backend
```json
{
  "csv-parser": "^3.0.0",
  "papaparse": "^5.4.1",
  "simple-statistics": "^7.8.3"
}
```

### Frontend
```json
{
  "recharts": "^3.3.0",
  "lucide-react": "^0.344.0"
}
```

## Configuration

### Environment Variables
No additional configuration needed beyond existing backend setup.

### File Paths
CSV files location: `c:\Users\SagnikLaptop\Desktop\healthguard\healthguard imp\archive\`

Server analytics module: `server/analytics.js`

## Testing

### Backend Endpoints
Start the server: `npm run server:dev`

Test each endpoint:
```powershell
# Health check
curl http://localhost:4000/api/health

# Trends
curl http://localhost:4000/api/analytics/trends?city=Kolkata

# Forecast
curl http://localhost:4000/api/analytics/forecast?city=Kolkata&days=7

# Patterns
curl http://localhost:4000/api/analytics/patterns?city=Kolkata

# Risk
curl http://localhost:4000/api/analytics/risk?city=Kolkata
```

### Frontend
1. Start dev server: `npm run dev`
2. Navigate to Analytics section
3. Test city selection
4. Test time range selection
5. Verify all tabs load correctly
6. Check chart interactivity

## Troubleshooting

### CSV Files Not Found
- Ensure CSV files are in `healthguard imp/archive/` directory
- Check file paths in `server/analytics.js`
- Verify file names match exactly (case-sensitive)

### Slow Response Times
- Large CSV files take time to process
- Consider implementing caching
- Reduce time range for faster results

### No Data for City
- Verify city name matches CSV data exactly
- Check CSV files contain data for that city
- Some cities may have limited historical data

### Charts Not Rendering
- Check browser console for errors
- Verify Recharts is installed
- Ensure data format matches chart expectations

## License
Part of HealthGuard project - Educational/Research purposes
