# Smart Alert System Documentation

## Overview
The Smart Alert System provides real-time notifications for health risks, air quality changes, and environmental hazards based on ThingSpeak sensor data. Users can register their contact information and configure customizable alert rules that trigger notifications when sensor values exceed specified thresholds.

## Features

### 1. Contact Registration
- **Email Registration**: Users can register their email address to receive alert notifications
- **Phone Registration**: Users can register their mobile number for SMS-style alerts
- **Verification System**: Simulates email/phone verification (can be extended with real verification)
- **Persistent Storage**: Contact information is saved to browser localStorage

### 2. Customizable Alert Rules
Users can create custom alert rules with the following parameters:

#### Rule Configuration
- **Rule Name**: Custom name for the alert (e.g., "High AQI Warning")
- **Metric Type**: Choose from:
  - Air Quality Index (AQI)
  - Temperature
  - Humidity
  - CO2 Level
  - NH3 Level
  - CO Level
- **Condition**: "Above" or "Below" threshold
- **Threshold Value**: Numeric value that triggers the alert
- **Severity Level**:
  - **Info**: Blue - informational alerts
  - **Warning**: Yellow - moderate concern
  - **Critical**: Red - immediate attention required
- **Enable/Disable**: Toggle rules on/off without deleting them

#### Default Alert Rules
The system comes with 4 pre-configured rules:
1. **High AQI Alert**: Triggers when AQI > 150 (Critical)
2. **High Temperature**: Triggers when Temperature > 35°C (Warning)
3. **High CO2 Level**: Triggers when CO2 > 1000 ppm (Warning)
4. **High CO Level**: Triggers when CO > 50 ppm (Critical)

### 3. Real-Time Monitoring
- **Auto-Detection**: Continuously monitors ThingSpeak sensor data
- **Smart Throttling**: Prevents duplicate notifications within 5 minutes
- **Live Updates**: Checks sensor values every 15 seconds (configurable)
- **Notification History**: Stores all triggered alerts with timestamps

### 4. Notification System

#### Notification Display
- **Unread Counter**: Shows number of new unread alerts
- **Color-Coded Severity**: Visual indicators for alert importance
- **Timestamp**: When each alert was triggered
- **Read/Unread Status**: Track which alerts have been reviewed
- **One-Click Mark as Read**: Click any notification to mark it as read

#### Notification Content
Each notification includes:
- Metric name that triggered the alert
- Current sensor value
- Threshold that was exceeded
- Timestamp of the event
- Severity level (color-coded)

### 5. Data Persistence
All data is saved to browser localStorage:
- Contact information (email, phone, verification status)
- Custom alert rules
- Notification history
- Survives browser refresh

## How to Use

### Step 1: Register Contact Information
1. Navigate to the **Alerts** section
2. Click **"Edit"** in the Contact Information section
3. Enter your email address and/or phone number
4. Click **"Save Contact Info"**
5. The system will automatically verify your contact (simulated)

### Step 2: Configure Alert Rules
#### To Add a New Rule:
1. Click **"New Rule"** button
2. Fill in the form:
   - Enter a descriptive name
   - Select the metric to monitor
   - Choose condition (above/below)
   - Set threshold value
   - Select severity level
3. Click **"Add Rule"**

#### To Manage Existing Rules:
- **Enable/Disable**: Click the green "Enabled" or gray "Disabled" button
- **Delete**: Click the red trash icon
- Each rule shows what it monitors and when it triggers

### Step 3: Monitor Notifications
1. The header shows unread notification count
2. New alerts appear in the "Recent Notifications" section
3. Click any notification to mark it as read
4. Use "Clear All" to remove all notifications

## Technical Details

### Data Sources
The alert system monitors data from the ThingSpeak sensor feed:
- **Channel ID**: 2736528
- **Read API Key**: WRG6LI8BJSEJD0IP
- **Update Frequency**: 15 seconds (configurable)

### Monitored Metrics
| Metric | Field | Unit | Typical Range |
|--------|-------|------|---------------|
| Temperature | Field 1 | °C | 15-40 |
| Humidity | Field 2 | % | 30-90 |
| AQI | Field 3 | Index | 0-500 |
| PM2.5 (NH3) | Field 4 | µg/m³ | 0-500 |
| Stress (CO) | Field 5 | ppm | 0-100 |
| CO2 | Field 6 | ppm | 400-2000 |

### Alert Triggering Logic
```typescript
// Alert triggers when:
(condition === 'above' && currentValue > threshold) ||
(condition === 'below' && currentValue < threshold)

// Throttling: No duplicate alerts for same metric within 5 minutes
```

### Storage Schema
```typescript
// localStorage keys:
- 'alertContactInfo': ContactInfo object
- 'alertRules': Array of AlertRule objects
- 'notifications': Array of Notification objects
```

## Health Risk Guidelines

### AQI Thresholds
- **0-50** (Good): No health concerns
- **51-100** (Moderate): Sensitive groups should limit prolonged outdoor exposure
- **101-150** (Unhealthy for Sensitive): General public may experience effects
- **151-200** (Unhealthy): Everyone may experience health effects
- **201-300** (Very Unhealthy): Health alert - everyone may experience serious effects
- **300+** (Hazardous): Health warning - emergency conditions

### Temperature Alerts
- **Below 15°C**: Risk of hypothermia for vulnerable individuals
- **Above 35°C**: Risk of heat exhaustion and heat stroke

### CO2 Levels
- **400-1000 ppm**: Normal indoor levels
- **1000-2000 ppm**: Drowsiness, poor air quality
- **2000+ ppm**: Headaches, sleepiness, poor concentration

### CO Levels
- **0-9 ppm**: Normal outdoor levels
- **10-29 ppm**: Mild symptoms possible
- **30-49 ppm**: Headache, dizziness
- **50+ ppm**: Serious health risk

## Future Enhancements

### Planned Features
1. **Real SMS/Email Integration**
   - Twilio integration for SMS
   - SendGrid/SMTP for email notifications
   - Webhook support

2. **Advanced Rules**
   - Multiple conditions (AND/OR logic)
   - Time-based rules (alert only during certain hours)
   - Location-based alerts

3. **Notification Channels**
   - Push notifications (via Service Worker)
   - Desktop notifications
   - Mobile app integration

4. **Analytics**
   - Alert frequency charts
   - Metric trending over time
   - Prediction-based early warnings

5. **User Preferences**
   - Quiet hours (do not disturb)
   - Notification frequency limits
   - Custom severity thresholds per user

## Troubleshooting

### Notifications Not Triggering
1. Verify contact info is registered and verified
2. Check that alert rules are enabled (green status)
3. Ensure threshold values are appropriate for current sensor readings
4. Check browser console for any errors

### Contact Info Not Saving
1. Check browser localStorage is enabled
2. Clear browser cache and try again
3. Ensure JavaScript is enabled

### Old Notifications Not Clearing
- Use "Clear All" button to remove all notifications
- Or manually clear localStorage item: `localStorage.removeItem('notifications')`

## API Reference

### Component Props
```typescript
// AlertSection (no props - standalone component)
<AlertSection />
```

### Data Interfaces
```typescript
interface ContactInfo {
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  type: 'aqi' | 'temperature' | 'humidity' | 'co2' | 'nh3' | 'co';
  condition: 'above' | 'below';
  threshold: number;
  enabled: boolean;
  severity: 'info' | 'warning' | 'critical';
}

interface Notification {
  id: string;
  message: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
}
```

## Support
For issues or questions about the Alert System, please check:
1. This documentation
2. Console logs for error messages
3. ThingSpeak data feed status

---
**Version**: 1.0  
**Last Updated**: November 2025  
**Dependencies**: React, Framer Motion, Lucide React, ThingSpeak Data Hook
