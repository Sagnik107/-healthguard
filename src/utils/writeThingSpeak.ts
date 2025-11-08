/**
 * ThingSpeak Data Writer Example
 * Use this to test writing data to your ThingSpeak channel
 */

import { writeToThingSpeak } from '../services/thingspeakService';

/**
 * Send sample health monitoring data to ThingSpeak
 */
export async function sendSampleData() {
  try {
    // Generate realistic sample data
    const sampleData = {
      field1: Math.floor(Math.random() * 100) + 30,  // AQI: 30-130
      field2: Math.floor(Math.random() * 50) + 10,   // PM2.5: 10-60
      field3: Math.floor(Math.random() * 400) + 400, // CO2: 400-800 ppm
      field4: Math.floor(Math.random() * 15) + 18,   // Temp: 18-33°C
      field5: Math.floor(Math.random() * 40) + 40,   // Humidity: 40-80%
      field6: Math.floor(Math.random() * 100),       // Stress: 0-100%
    };

    console.log('📤 Sending data to ThingSpeak:', sampleData);
    
    const entryId = await writeToThingSpeak(sampleData);
    
    console.log('✅ Data sent successfully! Entry ID:', entryId);
    console.log('🔄 Wait 15 seconds before sending another update (ThingSpeak rate limit)');
    
    return entryId;
  } catch (error) {
    console.error('❌ Error sending data:', error);
    throw error;
  }
}

/**
 * Send custom data to ThingSpeak
 */
export async function sendCustomData(data: {
  aqi?: number;
  pm25?: number;
  co2?: number;
  temperature?: number;
  humidity?: number;
  stress?: number;
}) {
  try {
    const fieldData: Record<string, number> = {};
    
    if (data.aqi !== undefined) fieldData.field1 = data.aqi;
    if (data.pm25 !== undefined) fieldData.field2 = data.pm25;
    if (data.co2 !== undefined) fieldData.field3 = data.co2;
    if (data.temperature !== undefined) fieldData.field4 = data.temperature;
    if (data.humidity !== undefined) fieldData.field5 = data.humidity;
    if (data.stress !== undefined) fieldData.field6 = data.stress;

    console.log('📤 Sending custom data:', fieldData);
    
    const entryId = await writeToThingSpeak(fieldData);
    
    console.log('✅ Data sent successfully! Entry ID:', entryId);
    
    return entryId;
  } catch (error) {
    console.error('❌ Error sending custom data:', error);
    throw error;
  }
}

/**
 * Simulate continuous data stream (for testing)
 * WARNING: Respects ThingSpeak 15-second rate limit
 */
export async function simulateDataStream(duration: number = 300000) {
  console.log('🔄 Starting data simulation...');
  console.log(`⏱️  Duration: ${duration / 1000} seconds`);
  
  const startTime = Date.now();
  let count = 0;
  
  const sendData = async () => {
    if (Date.now() - startTime >= duration) {
      console.log('✅ Simulation complete!');
      console.log(`📊 Total entries sent: ${count}`);
      clearInterval(interval);
      return;
    }
    
    try {
      await sendSampleData();
      count++;
    } catch (error) {
      console.error('Error in simulation:', error);
    }
  };
  
  // Send initial data
  await sendData();
  
  // Send data every 15 seconds (ThingSpeak free tier limit)
  const interval = setInterval(sendData, 15000);
  
  return () => clearInterval(interval);
}

// Example usage instructions
console.log(`
🚀 ThingSpeak Data Writer Loaded!

Usage Examples:
--------------

1. Send sample data:
   import { sendSampleData } from './utils/writeThingSpeak';
   sendSampleData();

2. Send custom data:
   import { sendCustomData } from './utils/writeThingSpeak';
   sendCustomData({
     aqi: 75,
     pm25: 25,
     co2: 450,
     temperature: 22,
     humidity: 60,
     stress: 30
   });

3. Simulate data stream (5 minutes):
   import { simulateDataStream } from './utils/writeThingSpeak';
   const stopSimulation = await simulateDataStream(300000);
   // To stop early: stopSimulation();

⚠️  Remember: ThingSpeak free tier allows updates every 15 seconds minimum!
`);
