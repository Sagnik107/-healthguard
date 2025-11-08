import { HealthMetrics, TrendData } from '../types';

export const generateMockMetrics = (): HealthMetrics => ({
  aqi: Math.floor(Math.random() * 150) + 20,
  pm25: Math.floor(Math.random() * 80) + 10,
  co2: Math.floor(Math.random() * 800) + 400,
  stress: Math.floor(Math.random() * 100),
  pathogenRisk: Math.floor(Math.random() * 100),
  temperature: Math.floor(Math.random() * 10) + 18,
  humidity: Math.floor(Math.random() * 40) + 30,
});

export const generateTrendData = (points: number = 12): TrendData[] => {
  const data: TrendData[] = [];
  const now = new Date();

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: Math.floor(Math.random() * 100) + 20,
    });
  }

  return data;
};

export const getRiskLevel = (value: number, type: 'aqi' | 'stress' | 'pathogen'): 'safe' | 'moderate' | 'high' => {
  if (type === 'aqi') {
    if (value <= 50) return 'safe';
    if (value <= 100) return 'moderate';
    return 'high';
  }

  if (value <= 40) return 'safe';
  if (value <= 70) return 'moderate';
  return 'high';
};

export const getRiskColor = (level: 'safe' | 'moderate' | 'high'): string => {
  switch (level) {
    case 'safe': return 'text-green-400';
    case 'moderate': return 'text-yellow-400';
    case 'high': return 'text-red-400';
  }
};

export const getRiskBgColor = (level: 'safe' | 'moderate' | 'high'): string => {
  switch (level) {
    case 'safe': return 'bg-green-500/20 border-green-500/40';
    case 'moderate': return 'bg-yellow-500/20 border-yellow-500/40';
    case 'high': return 'bg-red-500/20 border-red-500/40';
  }
};
