import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { getRiskLevel, getRiskColor, getRiskBgColor } from '../utils/MockData';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  type?: 'aqi' | 'stress' | 'pathogen' | 'default';
  delay?: number;
}

export default function MetricCard({ title, value, unit, icon: Icon, type = 'default', delay = 0 }: MetricCardProps) {
  const riskLevel = type !== 'default' ? getRiskLevel(value, type) : 'safe';
  const riskColor = getRiskColor(riskLevel);
  const riskBgColor = getRiskBgColor(riskLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border ${
        type !== 'default' ? riskBgColor : 'border-gray-700'
      } hover:border-teal-500/40 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${type !== 'default' ? riskBgColor : 'bg-teal-500/20'}`}>
          <Icon className={`w-5 h-5 ${type !== 'default' ? riskColor : 'text-teal-400'}`} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <motion.p
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-bold ${type !== 'default' ? riskColor : 'text-white'}`}
          >
            {value}
          </motion.p>
          <p className="text-gray-500 text-sm mt-1">{unit}</p>
        </div>

        {type !== 'default' && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${
              riskLevel === 'safe'
                ? 'bg-green-500/20 text-green-400'
                : riskLevel === 'moderate'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {riskLevel}
          </span>
        )}
      </div>
    </motion.div>
  );
}
