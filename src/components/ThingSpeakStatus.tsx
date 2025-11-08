import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Database, Clock, TrendingUp } from 'lucide-react';
import { readChannelFeed } from '../services/thingspeakService';

interface ChannelInfo {
  channelName: string;
  lastEntryId: number;
  lastUpdate: string;
  totalEntries: number;
  isOnline: boolean;
}

export default function ThingSpeakStatus() {
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        const data = await readChannelFeed(1);
        
        if (data.channel && data.feeds.length > 0) {
          const lastFeed = data.feeds[0];
          const lastUpdateTime = new Date(lastFeed.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - lastUpdateTime.getTime();
          const isOnline = timeDiff < 5 * 60 * 1000; // Online if updated within 5 minutes

          setChannelInfo({
            channelName: data.channel.name || 'Health Monitor Channel',
            lastEntryId: data.channel.last_entry_id,
            lastUpdate: lastFeed.created_at,
            totalEntries: data.channel.last_entry_id,
            isOnline,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching channel info:', error);
        setLoading(false);
      }
    };

    fetchChannelInfo();
    const interval = setInterval(fetchChannelInfo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!channelInfo) {
    return null;
  }

  const formatLastUpdate = () => {
    const date = new Date(channelInfo.lastUpdate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-teal-400" />
        ThingSpeak Channel Status
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center space-x-3">
          {channelInfo.isOnline ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <div>
            <p className="text-gray-400 text-sm">Connection Status</p>
            <p className={`font-semibold ${channelInfo.isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {channelInfo.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-gray-400 text-sm">Last Update</p>
            <p className="text-white font-semibold">{formatLastUpdate()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-gray-400 text-sm">Total Entries</p>
            <p className="text-white font-semibold">{channelInfo.totalEntries.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-teal-400" />
          <div>
            <p className="text-gray-400 text-sm">Channel Name</p>
            <p className="text-white font-semibold truncate">{channelInfo.channelName}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
