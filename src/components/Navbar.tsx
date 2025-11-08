import { motion } from 'framer-motion';
import { Activity, Map, BarChart3, Bell } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

export default function Navbar({ activeSection, setActiveSection }: NavbarProps) {
  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-teal-400" />
            <span className="text-xl font-bold text-white">HealthGuard</span>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`relative px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-lg border border-teal-500/40"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
