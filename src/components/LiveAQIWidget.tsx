import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, Cigarette, Wind } from 'lucide-react';
import { fetchKolkataAQI, getAQIColor, calculateCigaretteEquivalent, AQIResponse } from '../services/aqiService';

export default function LiveAQIWidget() {
  const [aqiData, setAqiData] = useState<AQIResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchKolkataAQI();
        setAqiData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch AQI data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading || !aqiData) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const aqiColor = getAQIColor(aqiData.aqi);
  const cigaretteEquiv = calculateCigaretteEquivalent(aqiData.pollutants.pm25 || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold">Kolkata, West Bengal</span>
          </div>
          <div className="text-white text-xs">
            Live • {new Date(aqiData.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main AQI Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* AQI Circle */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <div className="relative">
              <div className={`w-40 h-40 rounded-full ${aqiColor.bg} flex items-center justify-center shadow-lg`}>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{aqiData.aqi}</div>
                  <div className="text-white text-sm font-semibold">AQI</div>
                </div>
              </div>
            </div>
            <div className={`mt-4 px-6 py-2 rounded-full ${aqiColor.bg} text-white font-bold text-sm`}>
              {aqiColor.label}
            </div>
          </div>

          {/* Major Pollutants */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Wind className="w-5 h-5 text-teal-400" />
              Major Air Pollutants
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">PM2.5</div>
                <div className="text-white font-bold text-lg">{aqiData.pollutants.pm25} <span className="text-sm font-normal">µg/m³</span></div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${aqiColor.bg}`} style={{ width: `${Math.min((aqiData.pollutants.pm25 || 0) / 2, 100)}%` }} />
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">PM10</div>
                <div className="text-white font-bold text-lg">{aqiData.pollutants.pm10} <span className="text-sm font-normal">µg/m³</span></div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${aqiColor.bg}`} style={{ width: `${Math.min((aqiData.pollutants.pm10 || 0) / 3, 100)}%` }} />
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">NO2</div>
                <div className="text-white font-bold text-lg">{aqiData.pollutants.no2} <span className="text-sm font-normal">ppb</span></div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">O3</div>
                <div className="text-white font-bold text-lg">{aqiData.pollutants.o3} <span className="text-sm font-normal">ppb</span></div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">SO2</div>
                <div className="text-white font-bold text-lg">{aqiData.pollutants.so2} <span className="text-sm font-normal">ppb</span></div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="text-gray-400 text-xs mb-1">CO</div>
                <div className="text-white font-bold text-lg">{aqiData.pollutants.co} <span className="text-sm font-normal">ppm</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cigarette Equivalent */}
        <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Cigarette className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-orange-400 font-semibold text-lg">
                {cigaretteEquiv.toFixed(1)} Cigarettes per day
              </div>
              <div className="text-gray-300 text-sm">
                Breathing this air is equivalent to smoking <strong>{cigaretteEquiv.toFixed(1)} cigarettes daily</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Health Advice */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-teal-400" />
            Health Recommendations
          </h4>
          <div className="space-y-2">
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">General Population</div>
              <div className="text-gray-300 text-sm">{aqiData.healthRecommendations.generalPopulation}</div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Sensitive Groups</div>
              <div className="text-gray-300 text-sm">{aqiData.healthRecommendations.sensitiveGroups}</div>
            </div>
          </div>
        </div>

        {/* AQI Scale */}
        <div className="mt-6">
          <div className="text-gray-400 text-xs mb-2">AQI Scale</div>
          <div className="flex rounded-lg overflow-hidden h-2">
            <div className="bg-green-500 flex-1" title="Good" />
            <div className="bg-yellow-500 flex-1" title="Moderate" />
            <div className="bg-orange-500 flex-1" title="Unhealthy for Sensitive" />
            <div className="bg-red-500 flex-1" title="Unhealthy" />
            <div className="bg-purple-500 flex-1" title="Very Unhealthy" />
            <div className="bg-red-900 flex-1" title="Hazardous" />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0-50</span>
            <span>51-100</span>
            <span>101-150</span>
            <span>151-200</span>
            <span>201-300</span>
            <span>300+</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
