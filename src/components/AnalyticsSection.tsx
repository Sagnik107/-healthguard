import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Activity, 
  Calendar, Wind, Shield, Target, Brain, Clock 
} from 'lucide-react';

interface TrendData {
  city: string;
  timeRange: string;
  averageAQI: number;
  medianAQI: number;
  maxAQI: number;
  minAQI: number;
  trends: Array<{
    month: string;
    averageAQI: number;
    maxAQI: number;
    minAQI: number;
  }>;
  pollutants: Record<string, {
    average: number;
    max: number;
    min: number;
  }>;
  totalDataPoints?: number;
}

interface ForecastData {
  city: string;
  forecast: Array<{
    date: string;
    predictedAQI: number;
    lowerBound: number;
    upperBound: number;
    confidence: string;
  }>;
  trend: string;
  currentAQI: number;
}

interface PatternData {
  city: string;
  seasonal: Array<{ month: string; averageAQI: number }>;
  weekly: Array<{ day: string; averageAQI: number }>;
  hourly: Array<{ hour: number; averageAQI: number }>;
  correlations: Array<{
    pollutant1: string;
    pollutant2: string;
    correlation: number;
  }>;
}

interface RiskData {
  city: string;
  riskLevel: string;
  healthImpact: string;
  currentAverage: number;
  distribution: Array<{
    category: string;
    percentage: number;
    days: number;
  }>;
  unhealthyDaysPercentage: number;
  recommendations: string[];
}

const AnalyticsSection: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('Kolkata');
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'forecast' | 'patterns' | 'risk'>('trends');
  
  const [trendsData, setTrendsData] = useState<TrendData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [patternsData, setPatternsData] = useState<PatternData | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  const cities = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore'];
  const timeRanges = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' },
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedCity, timeRange, activeTab]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const baseUrl = 'http://localhost:4000/api/analytics';
      
      if (activeTab === 'trends') {
        const response = await fetch(`${baseUrl}/trends?city=${selectedCity}&timeRange=${timeRange}`);
        const data = await response.json();
        setTrendsData(data.data);
      } else if (activeTab === 'forecast') {
        const response = await fetch(`${baseUrl}/forecast?city=${selectedCity}&days=7`);
        const data = await response.json();
        setForecastData(data.data);
      } else if (activeTab === 'patterns') {
        const response = await fetch(`${baseUrl}/patterns?city=${selectedCity}`);
        const data = await response.json();
        setPatternsData(data.data);
      } else if (activeTab === 'risk') {
        const response = await fetch(`${baseUrl}/risk?city=${selectedCity}`);
        const data = await response.json();
        setRiskData(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#84cc16';
    if (aqi <= 150) return '#eab308';
    if (aqi <= 200) return '#f97316';
    if (aqi <= 300) return '#ef4444';
    return '#991b1b';
  };

  const getRiskBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-green-500',
      'low-moderate': 'bg-lime-500',
      'moderate': 'bg-yellow-500',
      'high': 'bg-orange-500',
      'severe': 'bg-red-600',
    };
    return colors[level] || 'bg-gray-500';
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/80 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-white/60 text-xs mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Advanced Analytics</h1>
          </div>
          <p className="text-white/70">
            Deep insights and predictive models powered by AI/ML for health trends, 
            pattern analysis, and risk forecasting
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white/80 text-sm mb-2">Select City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-gray-900">
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value} className="bg-gray-900">
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'trends', label: 'Historical Trends', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'forecast', label: 'AI Forecast', icon: <Target className="w-4 h-4" /> },
            { id: 'patterns', label: 'Pattern Analysis', icon: <Activity className="w-4 h-4" /> },
            { id: 'risk', label: 'Risk Assessment', icon: <AlertTriangle className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Trends Tab */}
            {activeTab === 'trends' && trendsData && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Average AQI"
                    value={trendsData.averageAQI.toFixed(1)}
                    icon={<Activity className="w-5 h-5" />}
                    color="bg-blue-500/20"
                    subtitle={`Median: ${trendsData.medianAQI.toFixed(1)}`}
                  />
                  <StatCard
                    title="Maximum AQI"
                    value={trendsData.maxAQI.toFixed(1)}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="bg-red-500/20"
                    subtitle="Peak recorded"
                  />
                  <StatCard
                    title="Minimum AQI"
                    value={trendsData.minAQI.toFixed(1)}
                    icon={<TrendingDown className="w-5 h-5" />}
                    color="bg-green-500/20"
                    subtitle="Best recorded"
                  />
                  <StatCard
                    title="Data Points"
                    value={trendsData.totalDataPoints || 0}
                    icon={<Calendar className="w-5 h-5" />}
                    color="bg-purple-500/20"
                    subtitle="Total measurements"
                  />
                </div>

                {/* Monthly Trends Chart */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Monthly AQI Trends
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendsData.trends}>
                      <defs>
                        <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="#fff" fontSize={12} />
                      <YAxis stroke="#fff" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="averageAQI"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#aqiGradient)"
                        name="Average AQI"
                      />
                      <Line
                        type="monotone"
                        dataKey="maxAQI"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Max AQI"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pollutant Analysis */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wind className="w-5 h-5" />
                    Pollutant Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(trendsData.pollutants).map(([pollutant, stats]) => (
                      <div key={pollutant} className="bg-black/20 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">{pollutant}</h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-white/70">
                            Avg: <span className="text-white font-medium">{stats.average.toFixed(2)}</span>
                          </p>
                          <p className="text-white/70">
                            Max: <span className="text-red-400 font-medium">{stats.max.toFixed(2)}</span>
                          </p>
                          <p className="text-white/70">
                            Min: <span className="text-green-400 font-medium">{stats.min.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Forecast Tab */}
            {activeTab === 'forecast' && forecastData && (
              <div className="space-y-6">
                {/* Forecast Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Current AQI"
                    value={forecastData.currentAQI?.toFixed(1) || 'N/A'}
                    icon={<Activity className="w-5 h-5" />}
                    color="bg-blue-500/20"
                    subtitle="Latest measurement"
                  />
                  <StatCard
                    title="Trend Direction"
                    value={forecastData.trend?.charAt(0).toUpperCase() + forecastData.trend?.slice(1) || 'Unknown'}
                    icon={
                      forecastData.trend === 'increasing' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : forecastData.trend === 'decreasing' ? (
                        <TrendingDown className="w-5 h-5" />
                      ) : (
                        <Activity className="w-5 h-5" />
                      )
                    }
                    color={
                      forecastData.trend === 'increasing'
                        ? 'bg-red-500/20'
                        : forecastData.trend === 'decreasing'
                        ? 'bg-green-500/20'
                        : 'bg-yellow-500/20'
                    }
                    subtitle="Next 7 days"
                  />
                  <StatCard
                    title="Forecast Days"
                    value={forecastData.forecast?.length || 0}
                    icon={<Calendar className="w-5 h-5" />}
                    color="bg-purple-500/20"
                    subtitle="AI predictions"
                  />
                </div>

                {/* Forecast Chart */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    7-Day AQI Forecast (AI/ML Prediction)
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={forecastData.forecast}>
                      <defs>
                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#fff" 
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#fff" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="upperBound"
                        stroke="none"
                        fill="#ef4444"
                        fillOpacity={0.2}
                        name="Upper Bound"
                      />
                      <Area
                        type="monotone"
                        dataKey="predictedAQI"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#forecastGradient)"
                        name="Predicted AQI"
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerBound"
                        stroke="none"
                        fill="#10b981"
                        fillOpacity={0.2}
                        name="Lower Bound"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <p className="text-white/80 text-sm">
                      <strong>Model:</strong> Hybrid Moving Average + Linear Regression
                      <br />
                      <strong>Confidence Interval:</strong> Based on historical standard deviation
                    </p>
                  </div>
                </div>

                {/* Forecast Details */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Detailed Predictions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {forecastData.forecast?.map((day) => (
                      <div key={day.date} className="bg-black/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white/80 text-sm">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            day.confidence === 'high' ? 'bg-green-500' :
                            day.confidence === 'medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}>
                            {day.confidence}
                          </span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: getAQIColor(day.predictedAQI) }}>
                          {day.predictedAQI}
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                          Range: {day.lowerBound} - {day.upperBound}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Patterns Tab */}
            {activeTab === 'patterns' && patternsData && (
              <div className="space-y-6">
                {/* Seasonal Pattern */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Seasonal Pattern (Monthly Average)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={patternsData.seasonal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="#fff" fontSize={12} />
                      <YAxis stroke="#fff" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="averageAQI" fill="#8b5cf6" name="Average AQI" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Weekly Pattern */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Weekly Pattern (Day of Week)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={patternsData.weekly}>
                      <PolarGrid stroke="rgba(255,255,255,0.2)" />
                      <PolarAngleAxis dataKey="day" stroke="#fff" fontSize={12} />
                      <PolarRadiusAxis stroke="#fff" fontSize={12} />
                      <Radar
                        name="Average AQI"
                        dataKey="averageAQI"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Hourly Pattern */}
                {patternsData.hourly && patternsData.hourly.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Hourly Pattern (24-Hour Cycle)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={patternsData.hourly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="hour" 
                          stroke="#fff" 
                          fontSize={12}
                          tickFormatter={(value) => `${value}:00`}
                        />
                        <YAxis stroke="#fff" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                          }}
                          labelFormatter={(value) => `${value}:00`}
                        />
                        <Line
                          type="monotone"
                          dataKey="averageAQI"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          name="Average AQI"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Pollutant Correlations */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Pollutant Correlations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {patternsData.correlations?.map((corr, idx) => (
                      <div key={idx} className="bg-black/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm">
                            {corr.pollutant1} ↔ {corr.pollutant2}
                          </p>
                          <span
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor:
                                Math.abs(corr.correlation) > 0.7
                                  ? '#10b981'
                                  : Math.abs(corr.correlation) > 0.4
                                  ? '#f59e0b'
                                  : '#6b7280',
                            }}
                          >
                            {corr.correlation.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Risk Tab */}
            {activeTab === 'risk' && riskData && (
              <div className="space-y-6">
                {/* Risk Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Risk Level"
                    value={riskData.riskLevel.charAt(0).toUpperCase() + riskData.riskLevel.slice(1)}
                    icon={<Shield className="w-5 h-5" />}
                    color={getRiskBadgeColor(riskData.riskLevel)}
                    subtitle="Based on 30-day average"
                  />
                  <StatCard
                    title="Current Average"
                    value={riskData.currentAverage.toFixed(1)}
                    icon={<Activity className="w-5 h-5" />}
                    color="bg-blue-500/20"
                    subtitle="AQI (last 30 days)"
                  />
                  <StatCard
                    title="Unhealthy Days"
                    value={`${riskData.unhealthyDaysPercentage}%`}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    color="bg-orange-500/20"
                    subtitle="AQI > 150"
                  />
                </div>

                {/* Health Impact */}
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-red-500/30">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Health Impact Assessment
                  </h3>
                  <p className="text-white/90 text-lg">{riskData.healthImpact}</p>
                </div>

                {/* AQI Distribution */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Air Quality Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskData.distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="category" stroke="#fff" fontSize={12} />
                      <YAxis stroke="#fff" fontSize={12} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="percentage" fill="#8b5cf6" name="Percentage" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {riskData.distribution.map((item) => (
                      <div key={item.category} className="bg-black/20 rounded-lg p-3">
                        <p className="text-white/80 text-sm">{item.category}</p>
                        <p className="text-2xl font-bold text-white">{item.percentage}%</p>
                        <p className="text-white/60 text-xs">{item.days} days</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Health Recommendations
                  </h3>
                  <div className="space-y-3">
                    {riskData.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-black/20 rounded-lg p-4">
                        <div className="mt-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        </div>
                        <p className="text-white/90">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSection;
