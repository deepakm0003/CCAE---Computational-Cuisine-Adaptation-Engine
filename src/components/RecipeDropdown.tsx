'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChefHat, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import ccaeApi, { handleApiError } from '@/lib/api';

interface Recipe {
  id: number;
  name: string;
  cuisine: string;
  ingredients: string[];
  instruction_count: number;
  ingredient_count?: number; // Optional, calculated from ingredients
  molecular_density?: number;
  identity_strength?: number;
}

interface RecipeSummary {
  recipe: Recipe;
  identity_baseline_score: number;
}

interface RecipeDropdownProps {
  onPreview?: () => void;
}

const RecipeDropdown = ({ onPreview }: RecipeDropdownProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<RecipeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ccaeApi.getRecipes();
      
      if (response && response.length > 0) {
        // Transform API response to component format
        const transformedRecipes = response.map(recipe => ({
          ...recipe,
          cuisine: recipe.cuisine || 'Unknown',
          ingredient_count: recipe.ingredients ? recipe.ingredients.length : 0
        }));
        setRecipes(transformedRecipes);
      } else {
        setError('No recipes found. Upload recipe data first.');
      }
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    localStorage.setItem('selectedRecipe', recipe.id.toString());
    
    // Create summary
    const summaryData: RecipeSummary = {
      recipe,
      identity_baseline_score: recipe.identity_strength || 0.75
    };
    setSummary(summaryData);
    
    // Trigger preview if callback provided
    if (onPreview) {
      setTimeout(onPreview, 100);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600">Loading recipes...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recipe Loading Error</h3>
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <button
              onClick={fetchRecipes}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <ChefHat className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Select Recipe</h3>
        {recipes.length > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {recipes.length} available
          </span>
        )}
      </div>

      <div className="space-y-4">
        <select
          value={selectedRecipe?.id || ''}
          onChange={(e) => {
            const recipe = recipes.find(r => r.id === parseInt(e.target.value));
            if (recipe) handleRecipeSelect(recipe);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a recipe...</option>
          {recipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name} ({recipe.cuisine})
            </option>
          ))}
        </select>

        {selectedRecipe && (
          <motion.div
            className="bg-blue-50 rounded-lg p-4 border border-blue-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">{selectedRecipe.name}</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Cuisine: <span className="font-medium">{selectedRecipe.cuisine}</span></div>
                  <div>Ingredients: <span className="font-medium">{selectedRecipe.ingredient_count}</span></div>
                  {selectedRecipe.molecular_density && (
                    <div>Molecular Density: <span className="font-medium">{selectedRecipe.molecular_density.toFixed(3)}</span></div>
                  )}
                  {summary && (
                    <div>Identity Score: <span className="font-medium">{(summary.identity_baseline_score * 100).toFixed(1)}%</span></div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {recipes.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recipes available</p>
            <p className="text-sm mt-1">Upload recipe data to get started</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecipeDropdown;
