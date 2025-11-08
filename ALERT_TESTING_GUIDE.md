# Alert System Testing Guide 📱

## Quick Test Instructions

### Test the Alert System in 3 Easy Steps:

1. **Open the Application**
   - URL: http://localhost:5174/
   - Click on "Alerts" in the navigation menu

2. **Register Your Phone Number**
   - Click "Edit" in the Contact Information section
   - Enter your phone number (e.g., +1 555-123-4567)
   - Optionally add your email
   - Click "Save Contact Info"
   - Wait 1 second for automatic verification ✅

3. **Send Test Notification**
   - Click the blue "🧪 Send Test Alert" button
   - Check the following:
     - ✅ Popup confirmation message appears
     - ✅ Browser notification (if permission granted)
     - ✅ Notification appears in "Recent Notifications" panel
     - ✅ Console log shows detailed notification info

---

## Testing Real Sensor-Based Alerts

### Method 1: Modify Alert Thresholds (Easiest)

The ThingSpeak sensors are currently reporting these values (example):
- Temperature: ~28°C
- Humidity: ~65%
- AQI: ~75
- CO2: ~800 ppm

**Steps:**
1. Click "New Rule" button
2. Create a rule that will trigger immediately:
   ```
   Rule Name: Test Low Temperature
   Metric Type: Temperature
   Condition: Below
   Threshold: 100  (much higher than current ~28°C)
   Severity: Warning
   ```
3. Click "Add Rule"
4. **Wait 15 seconds** (sensor data refresh interval)
5. Check console for notification trigger!

### Method 2: Wait for Real Threshold Breach

The default rules will trigger when:
- **High AQI Alert**: AQI > 150 (Critical)
- **High Temperature**: Temperature > 35°C (Warning)
- **High CO2 Level**: CO2 > 1000 ppm (Warning)
- **High CO Level**: CO > 50 ppm (Critical)

These will trigger automatically when sensor values exceed thresholds.

---

## What to Check During Testing

### ✅ Visual Indicators
- [ ] Green checkmark appears next to phone number after verification
- [ ] "🧪 Send Test Alert" button appears after registration
- [ ] Blue badge shows unread notification count
- [ ] Test notification appears in the notifications list
- [ ] Color-coded severity (Info = Blue, Warning = Yellow, Critical = Red)

### ✅ Console Output
Open browser DevTools (F12) and check Console tab for:

```
🔔 ===== TEST NOTIFICATION SENT =====
📱 Phone: +1 555-123-4567
📧 Email: your.email@example.com
⚠️  Severity: INFO (Test)
📊 Message: 🧪 TEST ALERT: This is a test notification...
⏰ Time: 11/8/2025, 2:30:45 PM
====================================
```

For real alerts triggered by sensor data:
```
🔔 ===== ALERT NOTIFICATION TRIGGERED =====
📱 Phone: +1 555-123-4567
📧 Email: your.email@example.com
⚠️  Severity: WARNING
📊 Message: Temperature is above 35. Current value: 36.2
⏰ Time: 11/8/2025, 2:35:12 PM
=========================================
```

### ✅ Browser Notifications
- [ ] Browser asks for notification permission on first visit
- [ ] Desktop notification appears when alert triggers
- [ ] Notification shows app name "Health Alert" or "Test Alert - HealthGuard"
- [ ] Click notification to focus the app

### ✅ LocalStorage Persistence
1. Trigger some notifications
2. Refresh the page (F5)
3. Check that:
   - [ ] Contact info is still saved
   - [ ] Alert rules are still configured
   - [ ] Previous notifications are still visible

---

## Advanced Testing Scenarios

### Test 1: Multiple Contact Methods
1. Add both email AND phone number
2. Send test notification
3. Check console shows both contact details

### Test 2: Create Custom Rule
1. Click "New Rule"
2. Set: "High Humidity" > 60% (will likely trigger)
3. Wait 15 seconds
4. Check for automatic notification

### Test 3: Severity Levels
Create rules with different severities:
- **Info** (Blue): Humidity below 80%
- **Warning** (Yellow): Temperature above 30°C
- **Critical** (Red): AQI above 100

### Test 4: Enable/Disable Rules
1. Create a rule that triggers
2. Disable it (click "Enabled" to toggle to "Disabled")
3. Wait - should NOT trigger
4. Re-enable it
5. Should start triggering again

### Test 5: Alert Throttling
1. Create a rule that triggers (e.g., Temperature above 0°C)
2. First alert should appear immediately
3. Wait 2 minutes
4. No duplicate alert should appear (throttled for 5 minutes)
5. Wait 6 minutes total
6. New alert should appear

---

## Troubleshooting

### "Please register contact information first!" Alert
**Problem**: Trying to send test alert without registered contact  
**Solution**: Edit contact info and add phone/email first

### No Browser Notifications Appearing
**Problem**: Browser notification permission denied  
**Solution**: 
1. Click 🔒 icon in browser address bar
2. Find "Notifications" setting
3. Change to "Allow"
4. Refresh page

### Console Shows No Alert Triggers
**Problem**: Thresholds not being met  
**Solutions**:
1. Create a rule with very low/high threshold that will definitely trigger
2. Check that rule is "Enabled" (green button)
3. Wait at least 15 seconds for sensor data to update
4. Verify contact info has green checkmark

### Notifications Not Saving After Refresh
**Problem**: LocalStorage might be disabled  
**Solution**:
1. Check browser settings allow localStorage
2. Try incognito/private mode
3. Clear browser cache

---

## Expected Console Output Examples

### Successful Test Notification:
```javascript
🔔 ===== TEST NOTIFICATION SENT =====
📱 Phone: +1 (555) 123-4567
📧 Email: test@example.com
⚠️  Severity: INFO (Test)
📊 Message: 🧪 TEST ALERT: This is a test notification sent to +1 (555) 123-4567...
⏰ Time: 11/8/2025, 3:45:12 PM
====================================
```

### Automatic Sensor Alert:
```javascript
🔔 ===== ALERT NOTIFICATION TRIGGERED =====
📱 Phone: +1 (555) 123-4567
📧 Email: test@example.com
⚠️  Severity: CRITICAL
📊 Message: Air Quality Index is above 150. Current value: 165.0
⏰ Time: 11/8/2025, 3:50:25 PM
=========================================
```

---

## Current Sensor Data Source

**ThingSpeak Channel**: 2736528  
**Read API Key**: WRG6LI8BJSEJD0IP  
**Update Interval**: 15 seconds  

**Fields:**
- Field 1: Temperature (°C)
- Field 2: Humidity (%)
- Field 3: AQI (Index)
- Field 4: PM2.5/NH3 (µg/m³)
- Field 5: Stress/CO (ppm)
- Field 6: CO2 (ppm)

---

## Testing Checklist

Use this checklist to verify all features:

- [ ] **Registration**
  - [ ] Can add phone number
  - [ ] Can add email
  - [ ] Verification checkmark appears
  - [ ] Data persists after refresh

- [ ] **Test Notification**
  - [ ] Button appears after registration
  - [ ] Clicking shows confirmation popup
  - [ ] Notification appears in list
  - [ ] Console shows detailed log
  - [ ] Browser notification appears

- [ ] **Custom Rules**
  - [ ] Can create new rule
  - [ ] Can enable/disable rule
  - [ ] Can delete rule
  - [ ] Color-coded by severity

- [ ] **Automatic Alerts**
  - [ ] Triggers when threshold met
  - [ ] Shows in notifications list
  - [ ] Console logs details
  - [ ] Throttles duplicates (5 min)

- [ ] **Notifications Panel**
  - [ ] Shows unread count
  - [ ] Click to mark as read
  - [ ] Can clear all
  - [ ] Timestamps visible

---

## Next Steps for Production

To make this work with REAL SMS/Email:

### For SMS (Twilio):
```javascript
// Install: npm install twilio
import twilio from 'twilio';

const client = twilio(accountSid, authToken);
await client.messages.create({
  body: notification.message,
  from: '+1234567890',
  to: contactInfo.phone
});
```

### For Email (SendGrid):
```javascript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({
  to: contactInfo.email,
  from: 'alerts@healthguard.com',
  subject: 'Health Alert',
  text: notification.message,
});
```

Currently, the system **simulates** notifications by:
- ✅ Logging to browser console
- ✅ Showing in-app notifications
- ✅ Browser desktop notifications
- ⏳ Ready for SMS/Email backend integration

---

**Test Now!** Go to http://localhost:5174/ → Click "Alerts" → Add your phone number → Send Test Alert!
