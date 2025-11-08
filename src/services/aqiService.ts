// AQI.in API Service for Kolkata
const AQI_API_BASE = 'https://api.aqi.in/v2';

export interface AQIResponse {
  aqi: number;
  pollutionLevel: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    so2?: number;
    co?: number;
  };
  dominantPollutant: string;
  lastUpdate: string;
  healthRecommendations: {
    generalPopulation: string;
    sensitiveGroups: string;
    athleticIndividuals: string;
  };
}

// For demonstration - you would need actual API key from aqi.in
// Note: The actual API might be different, this is a sample structure
export async function fetchKolkataAQI(): Promise<AQIResponse> {
  try {
    // Since we don't have actual API access, we'll use mock data
    // In production, replace this with actual API call
    const mockResponse: AQIResponse = {
      aqi: 171,
      pollutionLevel: 'Unhealthy',
      pollutants: {
        pm25: 84,
        pm10: 105,
        o3: 45,
        no2: 38,
        so2: 12,
        co: 0.8
      },
      dominantPollutant: 'PM2.5',
      lastUpdate: new Date().toISOString(),
      healthRecommendations: {
        generalPopulation: 'Everyone may begin to experience health effects. Limit outdoor activities.',
        sensitiveGroups: 'People with respiratory or heart disease, children, and older adults should avoid prolonged outdoor activities.',
        athleticIndividuals: 'Avoid strenuous outdoor activities.'
      }
    };

    return mockResponse;
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    throw error;
  }
}

export function getAQIColor(aqi: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (aqi <= 50) {
    return {
      bg: 'bg-green-500',
      text: 'text-green-500',
      border: 'border-green-500',
      label: 'Good'
    };
  } else if (aqi <= 100) {
    return {
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      border: 'border-yellow-500',
      label: 'Moderate'
    };
  } else if (aqi <= 150) {
    return {
      bg: 'bg-orange-500',
      text: 'text-orange-500',
      border: 'border-orange-500',
      label: 'Unhealthy for Sensitive'
    };
  } else if (aqi <= 200) {
    return {
      bg: 'bg-red-500',
      text: 'text-red-500',
      border: 'border-red-500',
      label: 'Unhealthy'
    };
  } else if (aqi <= 300) {
    return {
      bg: 'bg-purple-500',
      text: 'text-purple-500',
      border: 'border-purple-500',
      label: 'Very Unhealthy'
    };
  }
  return {
    bg: 'bg-red-900',
    text: 'text-red-900',
    border: 'border-red-900',
    label: 'Hazardous'
  };
}

export function calculateCigaretteEquivalent(pm25: number): number {
  // Based on Berkeley Earth formula: 22 µg/m³ of PM2.5 = 1 cigarette
  return pm25 / 22;
}
