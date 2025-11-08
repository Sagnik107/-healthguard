/**
 * ThingSpeak Connection Test Utility
 * Run this script to verify ThingSpeak API connectivity
 */

import {
  readChannelFeed,
  readChannelField,
  readChannelStatus,
  getLatestEntry,
  parseFieldValue,
} from '../services/thingspeakService';

export async function testThingSpeakConnection() {
  console.log('🔍 Testing ThingSpeak Connection...\n');

  try {
    // Test 1: Read latest channel feed
    console.log('Test 1: Reading latest channel feed...');
    const channelData = await readChannelFeed(5);
    console.log('✅ Success! Channel Name:', channelData.channel.name);
    console.log('   Last Entry ID:', channelData.channel.last_entry_id);
    console.log('   Total Feeds Retrieved:', channelData.feeds.length);
    
    if (channelData.feeds.length > 0) {
      const latest = channelData.feeds[0];
      console.log('   Latest Entry:');
      console.log('     - Created:', latest.created_at);
      console.log('     - Field 1 (AQI):', parseFieldValue(latest.field1));
      console.log('     - Field 2 (PM2.5):', parseFieldValue(latest.field2));
      console.log('     - Field 3 (CO2):', parseFieldValue(latest.field3));
      console.log('     - Field 4 (Temp):', parseFieldValue(latest.field4));
      console.log('     - Field 5 (Humidity):', parseFieldValue(latest.field5));
      console.log('     - Field 6 (Stress):', parseFieldValue(latest.field6));
    }
    console.log('');

    // Test 2: Read specific field
    console.log('Test 2: Reading Field 1 (AQI) data...');
    const field1Data = await readChannelField(1, 5);
    console.log('✅ Success! Retrieved', field1Data.feeds.length, 'entries');
    console.log('');

    // Test 3: Get latest entry
    console.log('Test 3: Getting latest entry...');
    const latestEntry = await getLatestEntry();
    if (latestEntry) {
      console.log('✅ Success! Entry ID:', latestEntry.entry_id);
      console.log('   Timestamp:', latestEntry.created_at);
    }
    console.log('');

    // Test 4: Read channel status (may not be available for all channels)
    console.log('Test 4: Reading channel status...');
    try {
      const status = await readChannelStatus();
      console.log('✅ Success! Status entries:', status.length);
    } catch (err) {
      console.log('⚠️  Status not available (this is normal for some channels)');
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('✅ ThingSpeak integration is working correctly.');
    
    return true;
  } catch (error) {
    console.error('❌ Error during testing:', error);
    console.error('Please check:');
    console.error('  1. Internet connection');
    console.error('  2. Channel ID and API key are correct');
    console.error('  3. Channel has recent data');
    return false;
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  console.log('ThingSpeak Test Utility loaded. Call testThingSpeakConnection() to run tests.');
}
