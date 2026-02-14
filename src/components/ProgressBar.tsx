'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'medium',
  color = 'blue',
  showLabel = false,
  animated = true,
  className = ''
}) => {
  const percentage = Math.min(100, (value / max) * 100);

  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-blue-500',
    yellow: 'bg-blue-500',
    red: 'bg-blue-500',
    purple: 'bg-blue-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
