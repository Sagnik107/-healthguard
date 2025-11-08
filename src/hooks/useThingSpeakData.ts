import { useState, useEffect, useCallback } from 'react';
import {
  readChannelFeed,
  readChannelField,
  parseFieldValue,
  formatTimestamp,
  ThingSpeakFeed,
} from '../services/thingspeakService';
import { HealthMetrics, TrendData } from '../types';

export function useThingSpeakData(refreshInterval: number = 15000) {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    aqi: 0,
    pm25: 0,
    co2: 0,
    stress: 0,
    pathogenRisk: 0,
    temperature: 0,
    humidity: 0,
  });

  const [trendData, setTrendData] = useState<{
    field1: TrendData[];
    field2: TrendData[];
    field3: TrendData[];
    field4: TrendData[];
    field5: TrendData[];
    field6: TrendData[];
  }>({
    field1: [],
    field2: [],
    field3: [],
    field4: [],
    field5: [],
    field6: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLatestData = useCallback(async () => {
    try {
      const data = await readChannelFeed(1);
      
      if (data.feeds.length > 0) {
        const latest = data.feeds[0];
        
        // Map ThingSpeak fields to health metrics based on Arduino code
        // Field 1: Temperature, Field 2: Humidity, Field 3: CO2
        // Field 4: NH3, Field 5: CO, Field 6: AQI Code
        const aqiCode = parseFieldValue(latest.field6, 1);
        let aqiValue = 0;
        if (aqiCode === 1) aqiValue = 50;      // Good
        else if (aqiCode === 2) aqiValue = 100; // Moderate
        else if (aqiCode === 3) aqiValue = 150; // Poor
        
        setMetrics({
          temperature: parseFieldValue(latest.field1, 0),   // Field 1: Temperature
          humidity: parseFieldValue(latest.field2, 0),      // Field 2: Humidity
          co2: parseFieldValue(latest.field3, 400),         // Field 3: CO2
          pm25: parseFieldValue(latest.field4, 0),          // Field 4: NH3 (using as PM2.5 display)
          stress: parseFieldValue(latest.field5, 0),        // Field 5: CO (using as stress display)
          aqi: aqiValue,                                    // Field 6: AQI Code converted to value
          pathogenRisk: 0,
        });
        
        setLastUpdate(new Date(latest.created_at));
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching latest data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendData = useCallback(async (fieldNumber: number, results: number = 20) => {
    try {
      const data = await readChannelField(fieldNumber, results);
      
      const trendArray: TrendData[] = data.feeds
        .reverse()
        .map((feed: ThingSpeakFeed) => ({
          time: formatTimestamp(feed.created_at),
          value: parseFieldValue(feed[`field${fieldNumber}` as keyof ThingSpeakFeed] as string, 0),
          timestamp: feed.created_at,
        }));
      
      setTrendData((prev) => ({
        ...prev,
        [`field${fieldNumber}`]: trendArray,
      }));
      
    } catch (err) {
      console.error(`Error fetching trend data for field ${fieldNumber}:`, err);
    }
  }, []);

  const fetchAllTrends = useCallback(async (results: number = 20) => {
    try {
      const data = await readChannelFeed(results);
      
      const reversedFeeds = [...data.feeds].reverse();
      
      // Process all fields
      const trends: any = {
        field1: [],
        field2: [],
        field3: [],
        field4: [],
        field5: [],
        field6: [],
      };
      
      reversedFeeds.forEach((feed) => {
        const time = formatTimestamp(feed.created_at);
        
        if (feed.field1) trends.field1.push({ time, value: parseFieldValue(feed.field1), timestamp: feed.created_at });
        if (feed.field2) trends.field2.push({ time, value: parseFieldValue(feed.field2), timestamp: feed.created_at });
        if (feed.field3) trends.field3.push({ time, value: parseFieldValue(feed.field3), timestamp: feed.created_at });
        if (feed.field4) trends.field4.push({ time, value: parseFieldValue(feed.field4), timestamp: feed.created_at });
        if (feed.field5) trends.field5.push({ time, value: parseFieldValue(feed.field5), timestamp: feed.created_at });
        if (feed.field6) trends.field6.push({ time, value: parseFieldValue(feed.field6), timestamp: feed.created_at });
      });
      
      setTrendData(trends);
    } catch (err) {
      console.error('Error fetching all trends:', err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchLatestData();
    fetchAllTrends(50);

    // Set up polling interval
    const interval = setInterval(() => {
      fetchLatestData();
      fetchAllTrends(50);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchLatestData, fetchAllTrends, refreshInterval]);

  return {
    metrics,
    trendData,
    loading,
    error,
    lastUpdate,
    refresh: () => {
      fetchLatestData();
      fetchAllTrends(50);
    },
    fetchTrendData,
  };
}
