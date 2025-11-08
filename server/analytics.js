import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';
import { mean, median, standardDeviation, linearRegression, linearRegressionLine } from 'simple-statistics';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV file paths
const CSV_BASE_PATH = path.join(__dirname, '..', '..', 'healthguard imp', 'archive');

// Helper function to read CSV file
async function readCSV(filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(CSV_BASE_PATH, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`CSV file not found: ${filePath}`);
      return resolve([]);
    }

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Calculate historical trends for a city
export async function calculateTrends(city = 'Kolkata', timeRange = 'all') {
  try {
    const cityData = await readCSV('city_day.csv');
    
    // Filter by city
    let filteredData = cityData.filter(row => row.City === city);
    
    // Apply time range filter
    const now = new Date();
    if (timeRange !== 'all') {
      const monthsBack = {
        '1m': 1,
        '3m': 3,
        '6m': 6,
        '1y': 12
      }[timeRange] || 12;
      
      const cutoffDate = new Date(now);
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
      
      filteredData = filteredData.filter(row => {
        const rowDate = new Date(row.Datetime);
        return rowDate >= cutoffDate;
      });
    }

    if (filteredData.length === 0) {
      return {
        city,
        timeRange,
        averageAQI: 0,
        trends: [],
        pollutants: {},
        message: 'No data available for the selected time range'
      };
    }

    // Calculate AQI values (filter out invalid values)
    const aqiValues = filteredData
      .map(row => parseFloat(row.AQI))
      .filter(val => !isNaN(val));

    // Calculate trends by month
    const monthlyData = {};
    filteredData.forEach(row => {
      const date = new Date(row.Datetime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = [];
      }
      
      const aqi = parseFloat(row.AQI);
      if (!isNaN(aqi)) {
        monthlyData[monthKey].push(aqi);
      }
    });

    const trends = Object.entries(monthlyData).map(([month, values]) => ({
      month,
      averageAQI: mean(values),
      maxAQI: Math.max(...values),
      minAQI: Math.min(...values),
      dataPoints: values.length
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Calculate pollutant averages
    const pollutants = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3'];
    const pollutantStats = {};
    
    pollutants.forEach(pollutant => {
      const values = filteredData
        .map(row => parseFloat(row[pollutant]))
        .filter(val => !isNaN(val) && val > 0);
      
      if (values.length > 0) {
        pollutantStats[pollutant] = {
          average: mean(values),
          max: Math.max(...values),
          min: Math.min(...values),
          stdDev: standardDeviation(values)
        };
      }
    });

    return {
      city,
      timeRange,
      averageAQI: aqiValues.length > 0 ? mean(aqiValues) : 0,
      medianAQI: aqiValues.length > 0 ? median(aqiValues) : 0,
      maxAQI: aqiValues.length > 0 ? Math.max(...aqiValues) : 0,
      minAQI: aqiValues.length > 0 ? Math.min(...aqiValues) : 0,
      stdDevAQI: aqiValues.length > 0 ? standardDeviation(aqiValues) : 0,
      trends,
      pollutants: pollutantStats,
      totalDataPoints: filteredData.length
    };
  } catch (error) {
    console.error('Error calculating trends:', error);
    throw error;
  }
}

// Forecast AQI for next 7 days using moving average and linear regression
export async function forecastAQI(city = 'Kolkata', days = 7) {
  try {
    const cityData = await readCSV('city_day.csv');
    
    // Filter by city and sort by date
    const filteredData = cityData
      .filter(row => row.City === city)
      .sort((a, b) => new Date(a.Datetime) - new Date(b.Datetime));

    if (filteredData.length === 0) {
      return {
        city,
        forecast: [],
        method: 'none',
        message: 'No data available for forecasting'
      };
    }

    // Get last 30 days for trend analysis
    const recentData = filteredData.slice(-30);
    const aqiValues = recentData
      .map(row => parseFloat(row.AQI))
      .filter(val => !isNaN(val));

    if (aqiValues.length < 7) {
      return {
        city,
        forecast: [],
        method: 'insufficient-data',
        message: 'Insufficient data for forecasting'
      };
    }

    // Calculate moving average (7-day)
    const movingAvg = mean(aqiValues.slice(-7));
    
    // Calculate trend using linear regression
    const dataPoints = aqiValues.map((val, idx) => [idx, val]);
    const regression = linearRegression(dataPoints);
    const regressionLine = linearRegressionLine(regression);
    
    // Generate forecast
    const lastDate = new Date(recentData[recentData.length - 1].Datetime);
    const forecast = [];
    
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Combine moving average and regression trend
      const trendValue = regressionLine(aqiValues.length + i);
      const predictedAQI = (movingAvg * 0.6) + (trendValue * 0.4);
      
      // Add some variance based on historical standard deviation
      const stdDev = standardDeviation(aqiValues);
      const lowerBound = Math.max(0, predictedAQI - stdDev);
      const upperBound = predictedAQI + stdDev;
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedAQI: Math.round(predictedAQI * 10) / 10,
        lowerBound: Math.round(lowerBound * 10) / 10,
        upperBound: Math.round(upperBound * 10) / 10,
        confidence: stdDev < 50 ? 'high' : stdDev < 100 ? 'medium' : 'low'
      });
    }

    return {
      city,
      forecast,
      method: 'moving-average-regression',
      currentAQI: aqiValues[aqiValues.length - 1],
      trend: regression.m > 0 ? 'increasing' : regression.m < 0 ? 'decreasing' : 'stable',
      trendStrength: Math.abs(regression.m)
    };
  } catch (error) {
    console.error('Error forecasting AQI:', error);
    throw error;
  }
}

// Analyze patterns (seasonal, weekly, hourly)
export async function analyzePatterns(city = 'Kolkata') {
  try {
    const [cityData, hourlyData] = await Promise.all([
      readCSV('city_day.csv'),
      readCSV('city_hour.csv')
    ]);

    const dailyFiltered = cityData.filter(row => row.City === city);
    const hourlyFiltered = hourlyData.filter(row => row.City === city);

    if (dailyFiltered.length === 0) {
      return {
        city,
        patterns: {},
        message: 'No data available for pattern analysis'
      };
    }

    // Analyze by month (seasonal pattern)
    const monthlyPattern = {};
    dailyFiltered.forEach(row => {
      const date = new Date(row.Datetime);
      const month = date.getMonth(); // 0-11
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
      
      if (!monthlyPattern[monthName]) {
        monthlyPattern[monthName] = [];
      }
      
      const aqi = parseFloat(row.AQI);
      if (!isNaN(aqi)) {
        monthlyPattern[monthName].push(aqi);
      }
    });

    const seasonalPattern = Object.entries(monthlyPattern).map(([month, values]) => ({
      month,
      averageAQI: mean(values),
      dataPoints: values.length
    }));

    // Analyze by day of week
    const weekdayPattern = {};
    dailyFiltered.forEach(row => {
      const date = new Date(row.Datetime);
      const dayOfWeek = date.getDay(); // 0-6
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      
      if (!weekdayPattern[dayName]) {
        weekdayPattern[dayName] = [];
      }
      
      const aqi = parseFloat(row.AQI);
      if (!isNaN(aqi)) {
        weekdayPattern[dayName].push(aqi);
      }
    });

    const weeklyPattern = Object.entries(weekdayPattern).map(([day, values]) => ({
      day,
      averageAQI: values.length > 0 ? mean(values) : 0,
      dataPoints: values.length
    }));

    // Analyze hourly pattern if data available
    let hourlyPattern = [];
    if (hourlyFiltered.length > 0) {
      const hourlyData = {};
      hourlyFiltered.forEach(row => {
        const datetime = row.Datetime;
        const hour = parseInt(datetime.split(' ')[1]?.split(':')[0] || '0');
        
        if (!hourlyData[hour]) {
          hourlyData[hour] = [];
        }
        
        const aqi = parseFloat(row.AQI);
        if (!isNaN(aqi)) {
          hourlyData[hour].push(aqi);
        }
      });

      hourlyPattern = Object.entries(hourlyData).map(([hour, values]) => ({
        hour: parseInt(hour),
        averageAQI: mean(values),
        dataPoints: values.length
      })).sort((a, b) => a.hour - b.hour);
    }

    // Calculate correlations between pollutants
    const pollutants = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO'];
    const correlations = [];
    
    for (let i = 0; i < pollutants.length; i++) {
      for (let j = i + 1; j < pollutants.length; j++) {
        const p1Values = dailyFiltered.map(row => parseFloat(row[pollutants[i]])).filter(v => !isNaN(v));
        const p2Values = dailyFiltered.map(row => parseFloat(row[pollutants[j]])).filter(v => !isNaN(v));
        
        if (p1Values.length > 10 && p2Values.length > 10) {
          // Simple correlation coefficient
          const correlation = calculateCorrelation(p1Values.slice(0, Math.min(p1Values.length, p2Values.length)), 
                                                   p2Values.slice(0, Math.min(p1Values.length, p2Values.length)));
          
          correlations.push({
            pollutant1: pollutants[i],
            pollutant2: pollutants[j],
            correlation: Math.round(correlation * 100) / 100
          });
        }
      }
    }

    return {
      city,
      seasonal: seasonalPattern,
      weekly: weeklyPattern,
      hourly: hourlyPattern,
      correlations
    };
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    throw error;
  }
}

// Helper function to calculate correlation coefficient
function calculateCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  const meanX = mean(x.slice(0, n));
  const meanY = mean(y.slice(0, n));
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : numerator / denom;
}

// Risk assessment based on historical data
export async function assessRisk(city = 'Kolkata') {
  try {
    const cityData = await readCSV('city_day.csv');
    const filteredData = cityData.filter(row => row.City === city);

    if (filteredData.length === 0) {
      return {
        city,
        riskLevel: 'unknown',
        message: 'No data available for risk assessment'
      };
    }

    // Calculate AQI distribution by category
    const categoryCount = {
      'Good': 0,
      'Satisfactory': 0,
      'Moderate': 0,
      'Poor': 0,
      'Very Poor': 0,
      'Severe': 0
    };

    filteredData.forEach(row => {
      const bucket = row.AQI_Bucket;
      if (categoryCount.hasOwnProperty(bucket)) {
        categoryCount[bucket]++;
      }
    });

    const total = filteredData.length;
    const distribution = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      percentage: Math.round((count / total) * 100 * 10) / 10,
      days: count
    }));

    // Calculate recent 30-day trend
    const recent30Days = filteredData.slice(-30);
    const recentAQI = recent30Days
      .map(row => parseFloat(row.AQI))
      .filter(val => !isNaN(val));

    const recentAvg = recentAQI.length > 0 ? mean(recentAQI) : 0;
    
    // Determine risk level
    let riskLevel = 'low';
    let healthImpact = 'Minimal health impact expected';
    
    if (recentAvg > 300) {
      riskLevel = 'severe';
      healthImpact = 'Serious health effects for all population groups';
    } else if (recentAvg > 200) {
      riskLevel = 'high';
      healthImpact = 'Health alert for sensitive groups';
    } else if (recentAvg > 150) {
      riskLevel = 'moderate';
      healthImpact = 'Possible health effects for sensitive individuals';
    } else if (recentAvg > 100) {
      riskLevel = 'low-moderate';
      healthImpact = 'Generally acceptable air quality';
    }

    // Calculate unhealthy days percentage
    const unhealthyDays = filteredData.filter(row => {
      const aqi = parseFloat(row.AQI);
      return aqi > 150;
    }).length;

    const unhealthyPercentage = Math.round((unhealthyDays / total) * 100 * 10) / 10;

    return {
      city,
      riskLevel,
      healthImpact,
      currentAverage: recentAvg,
      distribution,
      unhealthyDaysPercentage: unhealthyPercentage,
      recommendations: getHealthRecommendations(riskLevel)
    };
  } catch (error) {
    console.error('Error assessing risk:', error);
    throw error;
  }
}

// Health recommendations based on risk level
function getHealthRecommendations(riskLevel) {
  const recommendations = {
    'low': [
      'Air quality is satisfactory',
      'Outdoor activities are safe for all',
      'No special precautions needed'
    ],
    'low-moderate': [
      'Generally safe for outdoor activities',
      'Sensitive individuals should monitor symptoms',
      'Reduce prolonged outdoor exertion'
    ],
    'moderate': [
      'Sensitive groups should limit prolonged outdoor activities',
      'Wear N95 masks during outdoor activities',
      'Keep windows closed during high pollution hours'
    ],
    'high': [
      'Everyone should reduce outdoor exertion',
      'Sensitive groups should avoid outdoor activities',
      'Use air purifiers indoors',
      'Wear N95/N99 masks when outdoors'
    ],
    'severe': [
      'Avoid all outdoor activities',
      'Keep all windows and doors closed',
      'Use high-quality air purifiers',
      'Seek medical attention if experiencing symptoms',
      'Children and elderly should stay indoors'
    ]
  };

  return recommendations[riskLevel] || recommendations['low'];
}
