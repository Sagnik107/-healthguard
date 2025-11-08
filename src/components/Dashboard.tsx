import { motion } from 'framer-motion';
import { Wind, Droplets, Thermometer, Heart, Gauge, Activity, RefreshCw } from 'lucide-react';
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';
import ThingSpeakStatus from './ThingSpeakStatus';
import LiveAQIWidget from './LiveAQIWidget';
import AQITrendsChart from './AQITrendsChart';
import { useThingSpeakData } from '../hooks/useThingSpeakData';

export default function Dashboard() {
  const { metrics, trendData, loading, error, lastUpdate, refresh } = useThingSpeakData(15000);

  if (loading && !lastUpdate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 text-teal-400 animate-pulse mx-auto mb-4" />
            <p className="text-gray-400">Loading real-time data from ThingSpeak...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Health Guard - Environmental Monitor</h1>
            <p className="text-gray-400">Real-time air quality and environmental data from ESP32 sensors</p>
            {lastUpdate && (
              <p className="text-gray-500 text-sm mt-1">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Temperature"
          value={metrics.temperature}
          unit="°C"
          icon={Thermometer}
          delay={0.1}
        />
        <MetricCard
          title="Humidity"
          value={metrics.humidity}
          unit="%"
          icon={Droplets}
          delay={0.2}
        />
        <MetricCard
          title="CO2 Level"
          value={metrics.co2}
          unit="ppm"
          icon={Gauge}
          delay={0.3}
        />
        <MetricCard
          title="NH3 Level"
          value={metrics.pm25}
          unit="ppm"
          icon={Wind}
          delay={0.4}
        />
        <MetricCard
          title="CO Level"
          value={metrics.stress}
          unit="ppm"
          icon={Heart}
          delay={0.5}
        />
        <MetricCard
          title="Air Quality Index"
          value={metrics.aqi}
          unit="AQI"
          icon={Wind}
          type="aqi"
          delay={0.6}
        />
      </div>

      {/* ThingSpeak Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Temperature Trend (°C)"
          data={trendData.field1}
          dataKey="value"
          color="#EF4444"
          delay={0.7}
        />
        <ChartCard
          title="Humidity Trend (%)"
          data={trendData.field2}
          dataKey="value"
          color="#3B82F6"
          delay={0.8}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="CO2 Level Trend (ppm)"
          data={trendData.field3}
          dataKey="value"
          color="#14B8A6"
          delay={0.9}
        />
        <ChartCard
          title="NH3 Level Trend (ppm)"
          data={trendData.field4}
          dataKey="value"
          color="#F59E0B"
          delay={1.0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="CO Level Trend (ppm)"
          data={trendData.field5}
          dataKey="value"
          color="#EC4899"
          delay={1.1}
        />
        <ChartCard
          title="Air Quality Index Trend"
          data={trendData.field6}
          dataKey="value"
          color="#8B5CF6"
          delay={1.2}
        />
      </div>

      {/* Live AQI Widget from aqi.in */}
      <div className="mb-8">
        <LiveAQIWidget />
      </div>

      {/* AQI Historical Trends */}
      <div className="mb-8">
        <AQITrendsChart />
      </div>

      <ThingSpeakStatus />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-6 bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-white text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-gray-300">All Sensors Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-gray-300">Data Stream Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-gray-300">AI Analysis Running</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
