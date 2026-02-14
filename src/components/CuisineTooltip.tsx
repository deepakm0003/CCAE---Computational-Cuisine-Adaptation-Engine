'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface CuisineTooltipProps {
  cuisine: any;
  onClose: () => void;
}

const CuisineTooltip: React.FC<CuisineTooltipProps> = ({ cuisine, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{cuisine.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Molecular Profile</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Complexity Score</span>
                  <span className="font-medium">{cuisine.complexity || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unique Compounds</span>
                  <span className="font-medium">{cuisine.molecules?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Region</span>
                  <span className="font-medium">{cuisine.region || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Flavor Characteristics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Spice Level</span>
                  <span className="font-medium">{cuisine.spice_level || 'Medium'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sweetness</span>
                  <span className="font-medium">{cuisine.sweetness || 'Low'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Umami</span>
                  <span className="font-medium">{cuisine.umami || 'Medium'}</span>
                </div>
              </div>
            </div>
          </div>

          {cuisine.top_ingredients && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Top Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {cuisine.top_ingredients.map((ingredient: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CuisineTooltip;
