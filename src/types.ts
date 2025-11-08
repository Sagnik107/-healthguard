export interface HealthMetrics {
  aqi: number;
  pm25: number;
  co2: number;
  stress: number;
  pathogenRisk: number;
  temperature: number;
  humidity: number;
  heartRate?: number;
  spo2?: number;
}

export interface TrendData {
  time: string;
  value: number;
  timestamp?: string;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  field?: string;
}

export interface MultiFieldTrendData {
  time: string;
  field1?: number;
  field2?: number;
  field3?: number;
  field4?: number;
  field5?: number;
  field6?: number;
  field7?: number;
  field8?: number;
}

export type RiskLevel = 'safe' | 'moderate' | 'high';
