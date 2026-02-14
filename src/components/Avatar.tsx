'use client';

import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  fallback = '',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6 text-xs';
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'md':
        return 'w-10 h-10 text-base';
      case 'lg':
        return 'w-12 h-12 text-lg';
      case 'xl':
        return 'w-16 h-16 text-xl';
      case '2xl':
        return 'w-20 h-20 text-2xl';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  const getInitials = (text: string) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarContent = () => {
    if (src) {
      return (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative inline-flex items-center justify-center
        bg-gradient-to-br from-blue-500 to-blue-600 
        text-white font-medium rounded-full overflow-hidden
        ${getSizeClasses()} ${className}
      `}
    >
      {avatarContent()}
      <div className="flex items-center justify-center w-full h-full">
        {src ? (
          <span className="hidden">
            {getInitials(fallback || alt)}
          </span>
        ) : (
          getInitials(fallback || alt)
        )}
      </div>
    </motion.div>
  );
};

export default Avatar;
