'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'pending' | 'processing';
  text?: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'medium',
  animated = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: CheckCircle,
          iconColor: 'text-blue-600'
        };
      case 'warning':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: AlertCircle,
          iconColor: 'text-blue-600'
        };
      case 'error':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: XCircle,
          iconColor: 'text-blue-600'
        };
      case 'pending':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: Clock,
          iconColor: 'text-gray-600'
        };
      case 'processing':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: Clock,
          iconColor: 'text-blue-600'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: Clock,
          iconColor: 'text-gray-600'
        };
    }
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={animated ? { scale: 0.8, opacity: 0 } : false}
      animate={animated ? { scale: 1, opacity: 1 } : false}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-2 rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${sizeClasses[size]} ${className}
      `}
    >
      <Icon className={`${iconSizeClasses[size]} ${config.iconColor}`} />
      {text && <span>{text}</span>}
    </motion.div>
  );
};

export default StatusBadge;
