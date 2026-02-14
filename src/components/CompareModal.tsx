'use client';

import { motion } from 'framer-motion';
import { X, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuisine1: any;
  cuisine2: any;
}

const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  cuisine1,
  cuisine2
}) => {
  if (!isOpen) return null;

  const getComparisonIcon = (value1: number, value2: number) => {
    if (value1 > value2) return <TrendingUp className="w-4 h-4 text-blue-600" />;
    if (value1 < value2) return <TrendingDown className="w-4 h-4 text-blue-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const metrics = [
    { name: 'Complexity', key: 'complexity', unit: '/10' },
    { name: 'Spice Level', key: 'spice_level', unit: '/10' },
    { name: 'Sweetness', key: 'sweetness', unit: '/10' },
    { name: 'Umami', key: 'umami', unit: '/10' },
    { name: 'Adaptability', key: 'adaptability', unit: '%' },
    { name: 'Popularity', key: 'popularity', unit: '%' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cuisine Comparison</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Cuisine 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {cuisine1?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {cuisine1?.name || 'Cuisine 1'}
              </h3>
              <p className="text-sm text-gray-600">
                {cuisine1?.region || 'Region Unknown'}
              </p>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-gray-600">VS</span>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
              </div>
            </div>

            {/* Cuisine 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {cuisine2?.name?.charAt(0) || 'B'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {cuisine2?.name || 'Cuisine 2'}
              </h3>
              <p className="text-sm text-gray-600">
                {cuisine2?.region || 'Region Unknown'}
              </p>
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="space-y-4">
            {metrics.map((metric) => {
              const value1 = cuisine1?.[metric.key] || 0;
              const value2 = cuisine2?.[metric.key] || 0;
              
              return (
                <div key={metric.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{metric.name}</h4>
                    {getComparisonIcon(value1, value2)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{cuisine1?.name}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {value1}{metric.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, value1)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{cuisine2?.name}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {value2}{metric.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, value2)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flavor Profiles */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">{cuisine1?.name} Flavor Profile</h4>
              <div className="flex flex-wrap gap-2">
                {(cuisine1?.flavorProfile || ['Herbal', 'Rich', 'Savory']).map((flavor: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {flavor}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">{cuisine2?.name} Flavor Profile</h4>
              <div className="flex flex-wrap gap-2">
                {(cuisine2?.flavorProfile || ['Spicy', 'Bold', 'Earthy']).map((flavor: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {flavor}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Handle adaptation between these cuisines
                onClose();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Adaptation
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CompareModal;
