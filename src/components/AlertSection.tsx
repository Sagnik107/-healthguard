import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Save,
  Trash2,
  Plus,
  Wind,
  Droplets,
  Thermometer,
  Activity
} from 'lucide-react';
import { useThingSpeakData } from '../hooks/useThingSpeakData';

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
  type: 'aqi' | 'temperature' | 'humidity' | 'co2' | 'nh3' | 'co';
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
}

interface ContactInfo {
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export default function AlertSection() {
  const { metrics } = useThingSpeakData(15000);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    emailVerified: false,
    phoneVerified: false,
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'High AQI Alert',
      type: 'aqi',
      condition: 'above',
      threshold: 150,
      enabled: true,
      severity: 'critical',
    },
    {
      id: '2',
      name: 'High Temperature',
      type: 'temperature',
      condition: 'above',
      threshold: 35,
      enabled: true,
      severity: 'warning',
    },
    {
      id: '3',
      name: 'High CO2 Level',
      type: 'co2',
      condition: 'above',
      threshold: 1000,
      enabled: true,
      severity: 'warning',
    },
    {
      id: '4',
      name: 'High CO Level',
      type: 'co',
      condition: 'above',
      threshold: 50,
      enabled: true,
      severity: 'critical',
    },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    type: 'aqi',
    condition: 'above',
    threshold: 0,
    severity: 'warning',
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedContact = localStorage.getItem('alertContactInfo');
    const savedRules = localStorage.getItem('alertRules');
    const savedNotifications = localStorage.getItem('notifications');

    if (savedContact) setContactInfo(JSON.parse(savedContact));
    if (savedRules) setAlertRules(JSON.parse(savedRules));
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Save contact info
  const saveContactInfo = () => {
    localStorage.setItem('alertContactInfo', JSON.stringify(contactInfo));
    setShowContactForm(false);
    // Simulate verification
    setTimeout(() => {
      setContactInfo(prev => ({
        ...prev,
        emailVerified: !!prev.email,
        phoneVerified: !!prev.phone,
      }));
    }, 1000);
  };

  // Check thresholds and trigger alerts
  useEffect(() => {
    if (!contactInfo.emailVerified && !contactInfo.phoneVerified) return;

    alertRules.forEach(rule => {
      if (!rule.enabled) return;

      let currentValue = 0;
      let metricName = '';

      switch (rule.type) {
        case 'aqi':
          currentValue = metrics.aqi;
          metricName = 'Air Quality Index';
          break;
        case 'temperature':
          currentValue = metrics.temperature;
          metricName = 'Temperature';
          break;
        case 'humidity':
          currentValue = metrics.humidity;
          metricName = 'Humidity';
          break;
        case 'co2':
          currentValue = metrics.co2;
          metricName = 'CO2 Level';
          break;
        case 'nh3':
          currentValue = metrics.pm25;
          metricName = 'NH3 Level';
          break;
        case 'co':
          currentValue = metrics.stress;
          metricName = 'CO Level';
          break;
      }

      const shouldAlert = 
        (rule.condition === 'above' && currentValue > rule.threshold) ||
        (rule.condition === 'below' && currentValue < rule.threshold);

      if (shouldAlert) {
        // Check if we already have a recent notification for this
        const recentNotification = notifications.find(
          n => n.type === rule.type && 
          n.timestamp.getTime() > Date.now() - 300000 // 5 minutes
        );

        if (!recentNotification) {
          const notification: Notification = {
            id: Date.now().toString(),
            message: `${metricName} is ${rule.condition} ${rule.threshold}. Current value: ${currentValue.toFixed(1)}`,
            type: rule.type,
            severity: rule.severity,
            timestamp: new Date(),
            read: false,
          };
          setNotifications(prev => [notification, ...prev]);
          
          // Save to localStorage
          const updated = [notification, ...notifications];
          localStorage.setItem('notifications', JSON.stringify(updated));

          // Simulate sending notification
          console.log('� ===== ALERT NOTIFICATION TRIGGERED =====');
          console.log(`📱 Phone: ${contactInfo.phone || 'Not registered'}`);
          console.log(`📧 Email: ${contactInfo.email || 'Not registered'}`);
          console.log(`⚠️  Severity: ${notification.severity.toUpperCase()}`);
          console.log(`📊 Message: ${notification.message}`);
          console.log(`⏰ Time: ${notification.timestamp.toLocaleString()}`);
          console.log('=========================================');
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Health Alert', {
              body: notification.message,
              icon: '/vite.svg',
              tag: rule.type,
            });
          }
        }
      }
    });
  }, [metrics, alertRules, contactInfo, notifications]);

  const addAlertRule = () => {
    if (!newRule.name || !newRule.threshold) return;

    const rule: AlertRule = {
      id: Date.now().toString(),
      name: newRule.name,
      type: newRule.type || 'aqi',
      condition: newRule.condition || 'above',
      threshold: newRule.threshold,
      enabled: true,
      severity: newRule.severity || 'warning',
    };

    const updated = [...alertRules, rule];
    setAlertRules(updated);
    localStorage.setItem('alertRules', JSON.stringify(updated));
    
    setShowNewRuleForm(false);
    setNewRule({
      name: '',
      type: 'aqi',
      condition: 'above',
      threshold: 0,
      severity: 'warning',
    });
  };

  const toggleRule = (id: string) => {
    const updated = alertRules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    );
    setAlertRules(updated);
    localStorage.setItem('alertRules', JSON.stringify(updated));
  };

  const deleteRule = (id: string) => {
    const updated = alertRules.filter(rule => rule.id !== id);
    setAlertRules(updated);
    localStorage.setItem('alertRules', JSON.stringify(updated));
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  const sendTestNotification = () => {
    if (!contactInfo.emailVerified && !contactInfo.phoneVerified) {
      alert('Please register and verify your contact information first!');
      return;
    }

    const testNotification: Notification = {
      id: Date.now().toString(),
      message: `🧪 TEST ALERT: This is a test notification sent to ${contactInfo.phone || contactInfo.email}. Your alert system is working correctly!`,
      type: 'aqi',
      severity: 'info',
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [testNotification, ...prev]);
    localStorage.setItem('notifications', JSON.stringify([testNotification, ...notifications]));

    // Log test notification
    console.log('🔔 ===== TEST NOTIFICATION SENT =====');
    console.log(`📱 Phone: ${contactInfo.phone || 'Not registered'}`);
    console.log(`📧 Email: ${contactInfo.email || 'Not registered'}`);
    console.log(`⚠️  Severity: INFO (Test)`);
    console.log(`📊 Message: ${testNotification.message}`);
    console.log(`⏰ Time: ${testNotification.timestamp.toLocaleString()}`);
    console.log('====================================');

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Alert - HealthGuard', {
        body: testNotification.message,
        icon: '/vite.svg',
      });
    }

    alert(`✅ Test notification sent successfully!\n\nPhone: ${contactInfo.phone || 'N/A'}\nEmail: ${contactInfo.email || 'N/A'}\n\nCheck the console and notifications panel below.`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'info': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'aqi': return Wind;
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'co2':
      case 'nh3':
      case 'co': return Activity;
      default: return AlertTriangle;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-teal-400" />
              Smart Alerts & Notifications
            </h1>
            <p className="text-gray-400">
              Customizable notifications for health risks, air quality changes, and sensor detection events
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
              {unreadCount} New
            </div>
          )}
        </div>
      </motion.div>

      {/* Contact Registration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            Contact Information
          </h2>
          <div className="flex gap-2">
            {(contactInfo.emailVerified || contactInfo.phoneVerified) && (
              <button
                onClick={sendTestNotification}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                🧪 Send Test Alert
              </button>
            )}
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              {showContactForm ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {!showContactForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-semibold">{contactInfo.email || 'Not set'}</p>
              </div>
              {contactInfo.emailVerified && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
              <Phone className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-semibold">{contactInfo.phone || 'Not set'}</p>
              </div>
              {contactInfo.phoneVerified && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <button
              onClick={saveContactInfo}
              className="w-full md:w-auto px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Contact Info
            </button>
          </div>
        )}
      </motion.div>

      {/* Alert Rules */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Alert Rules ({alertRules.length})
          </h2>
          <button
            onClick={() => setShowNewRuleForm(!showNewRuleForm)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </button>
        </div>

        {showNewRuleForm && (
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h3 className="text-white font-semibold mb-3">Create New Alert Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none"
                  placeholder="e.g., High AQI Warning"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Metric Type</label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none"
                >
                  <option value="aqi">Air Quality Index</option>
                  <option value="temperature">Temperature</option>
                  <option value="humidity">Humidity</option>
                  <option value="co2">CO2 Level</option>
                  <option value="nh3">NH3 Level</option>
                  <option value="co">CO Level</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Condition</label>
                <select
                  value={newRule.condition}
                  onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Threshold</label>
                <input
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Severity</label>
                <select
                  value={newRule.severity}
                  onChange={(e) => setNewRule(prev => ({ ...prev, severity: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addAlertRule}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Add Rule
              </button>
              <button
                onClick={() => setShowNewRuleForm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {alertRules.map((rule) => {
            const Icon = getTypeIcon(rule.type);
            return (
              <div
                key={rule.id}
                className={`p-4 rounded-lg border ${getSeverityColor(rule.severity)} ${
                  !rule.enabled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm opacity-80">
                        Alert when {rule.type.toUpperCase()} is {rule.condition} {rule.threshold}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        rule.enabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-400" />
            Recent Notifications ({notifications.length})
          </h2>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-400">No alerts at the moment. All systems normal!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getTypeIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(notification.severity)} ${
                    notification.read ? 'opacity-60' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">{notification.message}</p>
                      <p className="text-sm opacity-80">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
