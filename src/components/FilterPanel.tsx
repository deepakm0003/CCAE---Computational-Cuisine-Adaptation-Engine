'use client';

import { motion } from 'framer-motion';

interface FilterPanelProps {
  filters: {
    region: string;
    complexity: string;
    ingredients: string;
  };
  onFiltersChange: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const regions = ['all', 'Asian', 'European', 'American', 'African', 'Middle Eastern'];
  const complexities = ['all', 'Simple', 'Medium', 'Complex'];
  const ingredientCounts = ['all', '0-10', '11-20', '20+'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
      
      <div className="space-y-6">
        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => onFiltersChange({ ...filters, region: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {regions.map(region => (
              <option key={region} value={region}>
                {region.charAt(0).toUpperCase() + region.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Complexity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complexity
          </label>
          <select
            value={filters.complexity}
            onChange={(e) => onFiltersChange({ ...filters, complexity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {complexities.map(complexity => (
              <option key={complexity} value={complexity}>
                {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Ingredients Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredient Count
          </label>
          <select
            value={filters.ingredients}
            onChange={(e) => onFiltersChange({ ...filters, ingredients: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ingredientCounts.map(count => (
              <option key={count} value={count}>
                {count.charAt(0).toUpperCase() + count.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => onFiltersChange({ region: 'all', complexity: 'all', ingredients: 'all' })}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </motion.div>
  );
};

export default FilterPanel;
