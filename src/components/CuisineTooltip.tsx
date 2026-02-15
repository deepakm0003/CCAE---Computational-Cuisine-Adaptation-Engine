'use client';

import { motion } from 'framer-motion';
import { X, ChefHat, Leaf, FlaskConical, TrendingUp } from 'lucide-react';

interface CuisineTooltipProps {
  cuisine: any;
  onClose: () => void;
}

const CuisineTooltip: React.FC<CuisineTooltipProps> = ({ cuisine, onClose }) => {
  // Get data from cuisine details (passed from flavor map)
  const details = cuisine.details || {};
  const recipeCount = details.recipe_count || cuisine.recipe_count || 0;
  const ingredientCount = details.ingredient_count || cuisine.ingredient_count || 0;
  const moleculeCount = details.molecule_count || (cuisine.molecule_distribution ? Object.keys(cuisine.molecule_distribution).length : 0);
  
  // Get top ingredients - handle both array of strings and array of objects
  const topIngredients = details.top_ingredients || cuisine.top_ingredients || [];
  const ingredientNames = topIngredients.map((ing: any) => 
    typeof ing === 'string' ? ing : ing.name || ing
  );

  // Calculate complexity based on available data
  const complexity = moleculeCount > 50 ? 'High' : moleculeCount > 20 ? 'Medium' : 'Low';
  
  // Estimate flavor characteristics based on ingredient patterns (simple heuristics)
  const hasSpicy = ingredientNames.some((i: string) => 
    /chili|pepper|cayenne|jalapeño|habanero|sriracha/i.test(i)
  );
  const hasSweet = ingredientNames.some((i: string) => 
    /sugar|honey|maple|sweet|caramel/i.test(i)
  );
  const hasUmami = ingredientNames.some((i: string) => 
    /soy|miso|fish sauce|mushroom|parmesan|tomato/i.test(i)
  );

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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{cuisine.name}</h2>
                <p className="text-sm text-gray-500">Cuisine Profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{recipeCount}</div>
              <div className="text-xs text-gray-600">Recipes</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{ingredientCount}</div>
              <div className="text-xs text-gray-600">Ingredients</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{moleculeCount}</div>
              <div className="text-xs text-gray-600">Molecules</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data Analysis */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Data Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Complexity</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    complexity === 'High' ? 'bg-red-100 text-red-700' :
                    complexity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{complexity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Avg Ingredients/Recipe</span>
                  <span className="font-medium text-gray-900">
                    {recipeCount > 0 ? Math.round(ingredientCount / recipeCount) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Data Quality</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recipeCount >= 10 ? 'bg-green-100 text-green-700' :
                    recipeCount >= 5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {recipeCount >= 10 ? 'Good' : recipeCount >= 5 ? 'Fair' : 'Limited'}
                  </span>
                </div>
              </div>
            </div>

            {/* Flavor Profile */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Detected Flavors</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Spice Level</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasSpicy ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{hasSpicy ? 'Detected' : 'Mild'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Sweetness</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasSweet ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>{hasSweet ? 'Detected' : 'Low'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Umami</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasUmami ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{hasUmami ? 'Detected' : 'Low'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Ingredients */}
          {ingredientNames.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Top Ingredients</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredientNames.slice(0, 10).map((ingredient: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => {
                localStorage.setItem('targetCuisine', cuisine.name);
                window.location.href = '/adapt';
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Adapt to {cuisine.name}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CuisineTooltip;
