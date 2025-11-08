export interface AQIStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number;
  pm25?: number;
  pm10?: number;
  dominant?: string;
  lastUpdate?: string;
}

// Fetch station list from configured AQI API. The implementation below expects
// two optional environment variables provided via Vite:
// - VITE_AQI_API_URL  (full endpoint URL template or base URL)
// - VITE_AQI_API_KEY  (API key if required)
// Example usage (AQI.in may require contacting provider for an API endpoint):
// const apiUrl = `${import.meta.env.VITE_AQI_API_URL}/stations?city=kolkata&key=${import.meta.env.VITE_AQI_API_KEY}`

export async function fetchKolkataStations(): Promise<AQIStation[]> {
  // Use local backend server instead of direct API calls
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${backendUrl}/api/aqi/stations`);
    if (!res.ok) throw new Error(`Backend error ${res.status}`);
    
    const json = await res.json();
    
    if (!json.success || !Array.isArray(json.data)) {
      console.error('Invalid backend response format', json);
      return getMockStations();
    }
    
    return json.data as AQIStation[];
  } catch (err) {
    console.error('fetchKolkataStations: Backend fetch failed, falling back to mock data', err);
    return getMockStations();
  }
}

function getMockStations(): AQIStation[] {
  const now = new Date().toISOString();
  return [
    { id: '1', name: 'Ballygunge, Kolkata', lat: 22.5344, lon: 88.3656, aqi: 171, pm25: 84, pm10: 105, dominant: 'PM2.5', lastUpdate: now },
    { id: '2', name: 'Fort William, Kolkata', lat: 22.5497, lon: 88.3420, aqi: 165, pm25: 79, pm10: 98, dominant: 'PM2.5', lastUpdate: now },
    { id: '3', name: 'Jadavpur, Kolkata', lat: 22.4991, lon: 88.3637, aqi: 183, pm25: 92, pm10: 118, dominant: 'PM2.5', lastUpdate: now },
    { id: '4', name: 'Rabindra Bharati University, Kolkata', lat: 22.6534, lon: 88.3739, aqi: 158, pm25: 75, pm10: 95, dominant: 'PM2.5', lastUpdate: now },
    { id: '5', name: 'Victoria Memorial, Kolkata', lat: 22.5448, lon: 88.3426, aqi: 176, pm25: 87, pm10: 108, dominant: 'PM2.5', lastUpdate: now },
    { id: '6', name: 'Rabindra Sarobar, Kolkata', lat: 22.5167, lon: 88.3667, aqi: 168, pm25: 81, pm10: 102, dominant: 'PM2.5', lastUpdate: now },
    { id: '7', name: 'Bidhannagar, Kolkata', lat: 22.5780, lon: 88.4337, aqi: 162, pm25: 77, pm10: 96, dominant: 'PM2.5', lastUpdate: now },
    { id: '8', name: 'Howrah', lat: 22.5958, lon: 88.2636, aqi: 194, pm25: 98, pm10: 125, dominant: 'PM2.5', lastUpdate: now },
    { id: '9', name: 'Salt Lake, Kolkata', lat: 22.5780, lon: 88.4337, aqi: 162, pm25: 77, pm10: 96, dominant: 'PM2.5', lastUpdate: now },
    { id: '10', name: 'Dum Dum, Kolkata', lat: 22.6283, lon: 88.4170, aqi: 179, pm25: 88, pm10: 112, dominant: 'PM2.5', lastUpdate: now },
    { id: '11', name: 'Park Street, Kolkata', lat: 22.5535, lon: 88.3583, aqi: 172, pm25: 85, pm10: 106, dominant: 'PM2.5', lastUpdate: now },
    { id: '12', name: 'New Town, Kolkata', lat: 22.5867, lon: 88.4750, aqi: 155, pm25: 72, pm10: 92, dominant: 'PM2.5', lastUpdate: now },
    { id: '13', name: 'Rajarhat, Kolkata', lat: 22.6208, lon: 88.4617, aqi: 164, pm25: 78, pm10: 98, dominant: 'PM2.5', lastUpdate: now },
    { id: '14', name: 'Behala, Kolkata', lat: 22.4850, lon: 88.3100, aqi: 186, pm25: 94, pm10: 120, dominant: 'PM2.5', lastUpdate: now },
    { id: '15', name: 'Kasba, Kolkata', lat: 22.5200, lon: 88.3800, aqi: 174, pm25: 86, pm10: 108, dominant: 'PM2.5', lastUpdate: now },
  ];
}
