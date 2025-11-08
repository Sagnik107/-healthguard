import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { calculateTrends, forecastAQI, analyzePatterns, assessRisk } from './analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory cache
const cache = {
  stations: null,
  timestamp: null,
  TTL: 5 * 60 * 1000, // 5 minutes
};

// Mock data for Kolkata stations
const getMockStations = () => {
  const now = new Date().toISOString();
  return [
    {
      id: '1',
      name: 'Ballygunge, Kolkata',
      lat: 22.5344,
      lon: 88.3656,
      aqi: 171,
      pm25: 84,
      pm10: 105,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '2',
      name: 'Fort William, Kolkata',
      lat: 22.5497,
      lon: 88.342,
      aqi: 165,
      pm25: 79,
      pm10: 98,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '3',
      name: 'Jadavpur, Kolkata',
      lat: 22.4991,
      lon: 88.3637,
      aqi: 183,
      pm25: 92,
      pm10: 118,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '4',
      name: 'Rabindra Bharati University, Kolkata',
      lat: 22.6534,
      lon: 88.3739,
      aqi: 158,
      pm25: 75,
      pm10: 95,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '5',
      name: 'Victoria Memorial, Kolkata',
      lat: 22.5448,
      lon: 88.3426,
      aqi: 176,
      pm25: 87,
      pm10: 108,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '6',
      name: 'Rabindra Sarobar, Kolkata',
      lat: 22.5167,
      lon: 88.3667,
      aqi: 168,
      pm25: 81,
      pm10: 102,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '7',
      name: 'Bidhannagar, Kolkata',
      lat: 22.5780,
      lon: 88.4337,
      aqi: 162,
      pm25: 77,
      pm10: 96,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '8',
      name: 'Howrah',
      lat: 22.5958,
      lon: 88.2636,
      aqi: 194,
      pm25: 98,
      pm10: 125,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '9',
      name: 'Salt Lake, Kolkata',
      lat: 22.578,
      lon: 88.4337,
      aqi: 162,
      pm25: 77,
      pm10: 96,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '10',
      name: 'Dum Dum, Kolkata',
      lat: 22.6283,
      lon: 88.4170,
      aqi: 179,
      pm25: 88,
      pm10: 112,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '11',
      name: 'Park Street, Kolkata',
      lat: 22.5535,
      lon: 88.3583,
      aqi: 172,
      pm25: 85,
      pm10: 106,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '12',
      name: 'New Town, Kolkata',
      lat: 22.5867,
      lon: 88.4750,
      aqi: 155,
      pm25: 72,
      pm10: 92,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '13',
      name: 'Rajarhat, Kolkata',
      lat: 22.6208,
      lon: 88.4617,
      aqi: 164,
      pm25: 78,
      pm10: 98,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '14',
      name: 'Behala, Kolkata',
      lat: 22.4850,
      lon: 88.3100,
      aqi: 186,
      pm25: 94,
      pm10: 120,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
    {
      id: '15',
      name: 'Kasba, Kolkata',
      lat: 22.5200,
      lon: 88.3800,
      aqi: 174,
      pm25: 86,
      pm10: 108,
      dominant: 'PM2.5',
      lastUpdate: now,
    },
  ];
};

// Fetch stations from AQICN API
const fetchFromAPI = async () => {
  const apiUrl = process.env.AQI_API_URL;
  const apiKey = process.env.AQI_API_KEY;

  if (!apiUrl || !apiKey) {
    console.log('No AQI_API_URL or AQI_API_KEY configured, using mock data');
    return getMockStations();
  }

  try {
    // Fetch multiple known Kolkata locations
    // Using actual verified station names that work with AQICN
    const locations = [
      'kolkata',                         // Main Kolkata station
      'howrah',                          // Howrah, Kolkata
      'kolkata/us-consulate',            // US Consulate, Kolkata
      'india/west-bengal/kolkata/ballygunge',         // Ballygunge
      'india/west-bengal/kolkata/fort-william',       // Fort William
      'india/west-bengal/kolkata/jadavpur',           // Jadavpur
      'india/west-bengal/kolkata/rabindra-bharati',   // Rabindra Bharati
      'india/west-bengal/kolkata/victoria',           // Victoria
      'india/west-bengal/kolkata/bidhannagar',        // Bidhannagar
      'india/west-bengal/kolkata/dum-dum',            // Dum Dum
    ];

    console.log(`Fetching real-time data from AQICN for ${locations.length} Kolkata stations...`);
    
    const stationPromises = locations.map(async (location) => {
      try {
        const url = `${apiUrl}/feed/${location}/?token=${apiKey}`;
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'HealthGuard-Dashboard/1.0',
          },
        });

        if (response.data.status === 'ok' && response.data.data) {
          const data = response.data.data;
          const stationName = data.city?.name || location;
          const lat = data.city?.geo?.[0] || 22.5726;
          const lon = data.city?.geo?.[1] || 88.3639;
          const country = (data.city?.country || '').toLowerCase();
          const cityUrl = (data.city?.url || '').toLowerCase();
          
          // STRICT Filter: Must be in Kolkata region geographically
          const isInKolkataGeo = lat >= 22.3 && lat <= 22.8 && lon >= 88.1 && lon <= 88.6;
          
          // Check if station is in India (country field or URL contains /india/)
          const isInIndia = country.includes('india') || country.includes('भारत') || cityUrl.includes('/india/');
          
          // Additional check: Station name must contain Kolkata-related keywords
          const kolkataKeywords = ['kolkata', 'howrah', 'calcutta', 'কলকাতা', 'west bengal'];
          const nameContainsKolkata = kolkataKeywords.some(keyword => 
            stationName.toLowerCase().includes(keyword) || 
            location.toLowerCase().includes(keyword)
          );
          
          // Accept if: (In Kolkata geo AND (In India OR Name mentions Kolkata))
          const isValid = isInKolkataGeo && (isInIndia || nameContainsKolkata);
          
          if (!isValid) {
            console.log(`❌ Filtered out: ${stationName} (${lat}, ${lon}) - Country: ${country || 'N/A'}, InGeo: ${isInKolkataGeo}, InIndia: ${isInIndia}`);
            return null;
          }
          
          console.log(`✓ Added: ${stationName} - AQI: ${data.aqi} (${lat}, ${lon})`);
          
          return {
            id: data.idx?.toString() || location,
            name: stationName,
            lat: lat,
            lon: lon,
            aqi: data.aqi || 0,
            pm25: data.iaqi?.pm25?.v || null,
            pm10: data.iaqi?.pm10?.v || null,
            dominant: data.dominentpol || 'PM2.5',
            lastUpdate: data.time?.iso || new Date().toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.log(`Failed to fetch ${location}: ${err.message}`);
        return null;
      }
    });

    const results = await Promise.all(stationPromises);
    const stations = results.filter(s => s !== null);

    if (stations.length > 0) {
      console.log(`✅ Successfully fetched ${stations.length} real-time stations from AQICN`);
      return stations;
    }

    console.warn('No valid stations returned from AQICN, falling back to mock data');
    return getMockStations();
  } catch (error) {
    console.error('AQICN API error:', error.message);
    return getMockStations();
  }
};

// GET /api/aqi/stations - Get all stations
app.get('/api/aqi/stations', async (req, res) => {
  try {
    // Check cache
    const now = Date.now();
    if (cache.stations && cache.timestamp && now - cache.timestamp < cache.TTL) {
      console.log('Returning cached stations');
      return res.json({
        success: true,
        cached: true,
        count: cache.stations.length,
        data: cache.stations,
      });
    }

    // Fetch fresh data
    console.log('Cache miss or expired, fetching fresh data');
    const stations = await fetchFromAPI();

    // Update cache
    cache.stations = stations;
    cache.timestamp = now;

    res.json({
      success: true,
      cached: false,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    console.error('Error in /api/aqi/stations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stations',
      message: error.message,
    });
  }
});

// GET /api/aqi/station/:id - Get single station
app.get('/api/aqi/station/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check cache first
    if (cache.stations) {
      const station = cache.stations.find((s) => s.id === id);
      if (station) {
        return res.json({
          success: true,
          data: station,
        });
      }
    }

    // If not in cache, fetch all and find
    const stations = await fetchFromAPI();
    const station = stations.find((s) => s.id === id);

    if (!station) {
      return res.status(404).json({
        success: false,
        error: 'Station not found',
      });
    }

    res.json({
      success: true,
      data: station,
    });
  } catch (error) {
    console.error(`Error fetching station ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch station',
      message: error.message,
    });
  }
});

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cache: {
      hasData: !!cache.stations,
      stationCount: cache.stations ? cache.stations.length : 0,
      age: cache.timestamp ? Date.now() - cache.timestamp : null,
      ttl: cache.TTL,
    },
  });
});

// Analytics Endpoints

// GET /api/analytics/trends - Historical trends analysis
app.get('/api/analytics/trends', async (req, res) => {
  try {
    const { city = 'Kolkata', timeRange = 'all' } = req.query;
    console.log(`Calculating trends for ${city} (${timeRange})`);
    
    const trends = await calculateTrends(city, timeRange);
    
    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Error in /api/analytics/trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate trends',
      message: error.message,
    });
  }
});

// GET /api/analytics/forecast - AQI forecasting
app.get('/api/analytics/forecast', async (req, res) => {
  try {
    const { city = 'Kolkata', days = 7 } = req.query;
    console.log(`Forecasting AQI for ${city} (${days} days)`);
    
    const forecast = await forecastAQI(city, parseInt(days));
    
    res.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error('Error in /api/analytics/forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate forecast',
      message: error.message,
    });
  }
});

// GET /api/analytics/patterns - Pattern analysis (seasonal, weekly, hourly)
app.get('/api/analytics/patterns', async (req, res) => {
  try {
    const { city = 'Kolkata' } = req.query;
    console.log(`Analyzing patterns for ${city}`);
    
    const patterns = await analyzePatterns(city);
    
    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    console.error('Error in /api/analytics/patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze patterns',
      message: error.message,
    });
  }
});

// GET /api/analytics/risk - Risk assessment
app.get('/api/analytics/risk', async (req, res) => {
  try {
    const { city = 'Kolkata' } = req.query;
    console.log(`Assessing risk for ${city}`);
    
    const risk = await assessRisk(city);
    
    res.json({
      success: true,
      data: risk,
    });
  } catch (error) {
    console.error('Error in /api/analytics/risk:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assess risk',
      message: error.message,
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 HealthGuard Backend Server`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 AQI Stations: http://localhost:${PORT}/api/aqi/stations`);
  console.log(`📈 Analytics Trends: http://localhost:${PORT}/api/analytics/trends`);
  console.log(`🔮 Analytics Forecast: http://localhost:${PORT}/api/analytics/forecast`);
  console.log(`🔍 Analytics Patterns: http://localhost:${PORT}/api/analytics/patterns`);
  console.log(`⚠️  Analytics Risk: http://localhost:${PORT}/api/analytics/risk`);
  console.log(`\n📝 Environment:`);
  const hasApiConfig = process.env.AQI_API_URL && process.env.AQI_API_KEY;
  console.log(`   - Data Source: ${hasApiConfig ? '🌐 AQICN Real-Time API' : '⚠️  Mock Data'}`);
  console.log(`   - AQI_API_URL: ${process.env.AQI_API_URL || 'Not configured'}`);
  console.log(`   - AQI_API_KEY: ${process.env.AQI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - Cache TTL: ${cache.TTL / 1000}s\n`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
