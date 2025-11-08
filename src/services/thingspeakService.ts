// ThingSpeak API Configuration
const CHANNEL_ID = '3148652';
const API_KEY = 'R3I1JJW8QKNIAI86';
const BASE_URL = 'https://api.thingspeak.com';

// Field Mapping (matching Arduino code):
// Field 1: Temperature (°C)
// Field 2: Humidity (%)
// Field 3: CO2 (ppm)
// Field 4: NH3 (ppm)
// Field 5: CO (ppm)
// Field 6: AQI Code (1=Good, 2=Moderate, 3=Poor)

export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  field6?: string;
  field7?: string;
  field8?: string;
}

export interface ThingSpeakChannel {
  channel: {
    id: number;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field5: string;
    field6: string;
    field7: string;
    field8: string;
    created_at: string;
    updated_at: string;
    last_entry_id: number;
  };
  feeds: ThingSpeakFeed[];
}

export interface ThingSpeakFieldData {
  channel: {
    id: number;
    name: string;
    field1?: string;
    field2?: string;
    field3?: string;
    field4?: string;
    field5?: string;
    field6?: string;
    field7?: string;
    field8?: string;
  };
  feeds: ThingSpeakFeed[];
}

export interface ThingSpeakStatus {
  created_at: string;
  entry_id: number;
  status: string;
}

// Write data to ThingSpeak channel
export async function writeToThingSpeak(fieldData: Record<string, number | string>): Promise<number> {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      ...Object.entries(fieldData).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: String(value)
      }), {})
    });

    const response = await fetch(`${BASE_URL}/update?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to write to ThingSpeak: ${response.statusText}`);
    }

    const entryId = await response.text();
    return parseInt(entryId, 10);
  } catch (error) {
    console.error('Error writing to ThingSpeak:', error);
    throw error;
  }
}

// Read channel feed (all fields)
export async function readChannelFeed(results: number = 100): Promise<ThingSpeakChannel> {
  try {
    const response = await fetch(
      `${BASE_URL}/channels/${CHANNEL_ID}/feeds.json?results=${results}`
    );

    if (!response.ok) {
      throw new Error(`Failed to read channel feed: ${response.statusText}`);
    }

    const data: ThingSpeakChannel = await response.json();
    return data;
  } catch (error) {
    console.error('Error reading channel feed:', error);
    throw error;
  }
}

// Read specific field data
export async function readChannelField(
  fieldNumber: number,
  results: number = 100
): Promise<ThingSpeakFieldData> {
  try {
    if (fieldNumber < 1 || fieldNumber > 8) {
      throw new Error('Field number must be between 1 and 8');
    }

    const response = await fetch(
      `${BASE_URL}/channels/${CHANNEL_ID}/fields/${fieldNumber}.json?results=${results}`
    );

    if (!response.ok) {
      throw new Error(`Failed to read field ${fieldNumber}: ${response.statusText}`);
    }

    const data: ThingSpeakFieldData = await response.json();
    return data;
  } catch (error) {
    console.error(`Error reading field ${fieldNumber}:`, error);
    throw error;
  }
}

// Read channel status updates
export async function readChannelStatus(): Promise<ThingSpeakStatus[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/channels/${CHANNEL_ID}/status.json`
    );

    if (!response.ok) {
      throw new Error(`Failed to read channel status: ${response.statusText}`);
    }

    const data = await response.json();
    return data.feeds || [];
  } catch (error) {
    console.error('Error reading channel status:', error);
    throw error;
  }
}

// Get latest entry from channel
export async function getLatestEntry(): Promise<ThingSpeakFeed | null> {
  try {
    const data = await readChannelFeed(1);
    return data.feeds.length > 0 ? data.feeds[0] : null;
  } catch (error) {
    console.error('Error getting latest entry:', error);
    return null;
  }
}

// Parse field value safely
export function parseFieldValue(value: string | undefined, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Format timestamp for display
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}
