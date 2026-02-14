'use client';

import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  description?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'medium',
  label,
  description,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-4';
      case 'medium':
        return 'w-11 h-6';
      case 'large':
        return 'w-14 h-8';
      default:
        return 'w-11 h-6';
    }
  };

  const getThumbSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-3 h-3';
      case 'medium':
        return 'w-4 h-4';
      case 'large':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const getThumbTranslateClasses = () => {
    switch (size) {
      case 'small':
        return checked ? 'translate-x-4' : 'translate-x-0.5';
      case 'medium':
        return checked ? 'translate-x-5' : 'translate-x-0.5';
      case 'large':
        return checked ? 'translate-x-6' : 'translate-x-1';
      default:
        return checked ? 'translate-x-5' : 'translate-x-0.5';
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${getSizeClasses()}
          ${
            checked
              ? 'bg-blue-600'
              : 'bg-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow-lg
            transform ring-0 transition duration-200 ease-in-out
            ${getThumbSizeClasses()} ${getThumbTranslateClasses()}
          `}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-gray-900">
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-500">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;
