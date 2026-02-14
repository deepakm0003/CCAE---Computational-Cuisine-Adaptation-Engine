'use client';

import { ReactNode } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  variant = 'default'
}) => {
  const getTabClasses = (tabId: string, disabled?: boolean) => {
    const isActive = activeTab === tabId;
    const baseClasses = 'flex items-center gap-2 px-4 py-2 font-medium transition-colors';
    
    if (disabled) {
      return `${baseClasses} text-gray-400 cursor-not-allowed`;
    }

    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-lg ${
          isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`;
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive 
            ? 'border-blue-600 text-blue-600' 
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`;
      default:
        return `${baseClasses} ${
          isActive 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600 hover:text-gray-900'
        }`;
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'pills':
        return 'flex gap-2 bg-gray-100 p-1 rounded-lg';
      case 'underline':
        return 'flex border-b border-gray-200';
      default:
        return 'flex space-x-8 border-b border-gray-200';
    }
  };

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={getContainerClasses()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={getTabClasses(tab.id, tab.disabled)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default TabNavigation;
