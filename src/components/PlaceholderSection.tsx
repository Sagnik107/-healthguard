import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PlaceholderSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function PlaceholderSection({ title, description, icon: Icon }: PlaceholderSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-12 border border-gray-700 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/40 mb-6"
        >
          <Icon className="w-10 h-10 text-teal-400" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{description}</p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <span className="text-sm text-gray-500">Coming Soon</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
