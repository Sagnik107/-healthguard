import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, Clock } from 'lucide-react';

interface HistoricalData {
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
}

export default function AQITrendsChart() {
  const [view, setView] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [data, setData] = useState<HistoricalData[]>([]);

  useEffect(() => {
    // Generate mock historical data
    const generateData = () => {
      const now = new Date();
      const points = view === '24h' ? 24 : view === '7d' ? 7 : 30;
      const interval = view === '24h' ? 3600000 : 86400000; // 1 hour or 1 day

      return Array.from({ length: points }, (_, i) => {
        const timestamp = new Date(now.getTime() - (points - i - 1) * interval);
        const baseAQI = 150 + Math.sin(i / 3) * 30 + Math.random() * 40;
        
        return {
          timestamp: view === '24h' 
            ? timestamp.toLocaleTimeString('en-US', { hour: 'numeric' })
            : timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          aqi: Math.round(baseAQI),
          pm25: Math.round(baseAQI * 0.5 + Math.random() * 20),
          pm10: Math.round(baseAQI * 0.6 + Math.random() * 25),
          no2: Math.round(20 + Math.random() * 30),
          o3: Math.round(30 + Math.random() * 25)
        };
      });
    };

    setData(generateData());
  }, [view]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 text-sm mb-2">{payload[0].payload.timestamp}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }} />
            <Line type="monotone" dataKey="aqi" stroke="#8B5CF6" strokeWidth={2} dot={false} name="AQI" />
            <Line type="monotone" dataKey="pm25" stroke="#EF4444" strokeWidth={2} dot={false} name="PM2.5" />
            <Line type="monotone" dataKey="pm10" stroke="#F59E0B" strokeWidth={2} dot={false} name="PM10" />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }} />
            <Area type="monotone" dataKey="aqi" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="AQI" />
            <Area type="monotone" dataKey="pm25" stroke="#EF4444" fill="#EF4444" fillOpacity={0.4} name="PM2.5" />
            <Area type="monotone" dataKey="pm10" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="PM10" />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }} />
            <Bar dataKey="aqi" fill="#8B5CF6" name="AQI" />
            <Bar dataKey="pm25" fill="#EF4444" name="PM2.5" />
            <Bar dataKey="pm10" fill="#F59E0B" name="PM10" />
          </BarChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <TrendingUp className="w-6 h-6 text-teal-400" />
          <h3 className="text-white text-xl font-bold">Air Quality Trends</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-1">
            <button
              onClick={() => setView('24h')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === '24h' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                24H
              </div>
            </button>
            <button
              onClick={() => setView('7d')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === '7d' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setView('30d')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === '30d' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                30D
              </div>
            </button>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                chartType === 'area' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                chartType === 'line' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                chartType === 'bar' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div>
          <div className="text-gray-400 text-xs mb-1">Average AQI</div>
          <div className="text-white text-lg font-bold">
            {Math.round(data.reduce((acc, d) => acc + d.aqi, 0) / data.length)}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">Peak AQI</div>
          <div className="text-white text-lg font-bold">
            {Math.max(...data.map(d => d.aqi))}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">Avg PM2.5</div>
          <div className="text-white text-lg font-bold">
            {Math.round(data.reduce((acc, d) => acc + d.pm25, 0) / data.length)}
            <span className="text-xs text-gray-400 ml-1">µg/m³</span>
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">Avg PM10</div>
          <div className="text-white text-lg font-bold">
            {Math.round(data.reduce((acc, d) => acc + d.pm10, 0) / data.length)}
            <span className="text-xs text-gray-400 ml-1">µg/m³</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
