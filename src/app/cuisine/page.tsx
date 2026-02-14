'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ccaeApi, { handleApiError } from '@/lib/api';
import { Globe, ChefHat, Star, Clock, Users, TrendingUp, Filter, Search, AlertCircle } from 'lucide-react';

interface Cuisine {
  name: string;
  recipe_count: number;
  ingredient_count: number;
  top_ingredients: Array<{
    name: string;
    frequency: number;
    centrality: number;
  }>;
  molecule_distribution: Record<string, number>;
  centrality_scores: Record<string, number>;
  embedding_2d: number[];
  vector_dimension: number;
}

export default function CuisinePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedRegion, setSelectedRegion] = useState('all'); // Removed since not in real data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchCuisines();
  }, [user, isLoading, router]);

  const [error, setError] = useState<string | null>(null);

  const fetchCuisines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all cuisines from backend
      const cuisineList = await ccaeApi.getCuisines();
      
      // Get detailed identity for each cuisine
      const cuisineDetails = await Promise.all(
        cuisineList.map(async (cuisine: any) => {
          try {
            const identity = await ccaeApi.getCuisineIdentity(cuisine.name);
            return identity;
          } catch (err) {
            console.warn(`Failed to get identity for ${cuisine.name}:`, err);
            return null;
          }
        })
      );
      
      // Filter out null results
      const validCuisines = cuisineDetails.filter(Boolean);
      
      if (validCuisines.length === 0) {
        setError('No cuisine data available. Upload data and compute identities first.');
      }
      
      setCuisines(validCuisines);
      
    } catch (err) {
      console.error('Failed to fetch cuisines:', err);
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredCuisines = cuisines.filter(cuisine => {
    const matchesSearch = cuisine.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getComplexityColor = (ingredientCount: number) => {
    if (ingredientCount <= 10) return 'bg-green-500';
    if (ingredientCount <= 20) return 'bg-yellow-500';
    if (ingredientCount <= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cuisines...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Unable to Load Cuisines
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchCuisines}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Retry
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/data-upload')}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Upload Data
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty state
  if (cuisines.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No Cuisines Available
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload recipe data first to explore cuisines and their flavor profiles.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/data-upload')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Upload Recipe Data
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            World Cuisines
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore diverse culinary traditions from around the world and discover their unique characteristics
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Region filter removed - not available in real data */}
          </div>
        </motion.div>

        {/* Cuisines Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCuisines.map((cuisine, index) => (
            <motion.div
              key={cuisine.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{cuisine.name}</h3>
                  <p className="text-sm text-gray-500">Cuisine Identity</p>
                </div>
                <Globe className="w-6 h-6 text-blue-600" />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Recipes</span>
                    <p className="font-medium text-gray-900">{cuisine.recipe_count}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ingredients</span>
                    <p className="font-medium text-gray-900">{cuisine.ingredient_count}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Complexity</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getComplexityColor(cuisine.ingredient_count).includes('green') ? 'Simple' : 
                       getComplexityColor(cuisine.ingredient_count).includes('yellow') ? 'Moderate' :
                       getComplexityColor(cuisine.ingredient_count).includes('orange') ? 'Complex' : 'Very Complex'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getComplexityColor(cuisine.ingredient_count)}`}
                      style={{ width: `${Math.min((cuisine.ingredient_count / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Top Ingredients</p>
                  <div className="flex flex-wrap gap-1">
                    {cuisine.top_ingredients.slice(0, 3).map((ingredient: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {ingredient.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Molecules</p>
                  <p className="text-xs text-gray-500">
                    {Object.keys(cuisine.molecule_distribution).length} unique compounds
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Vector Dimension</p>
                  <p className="text-xs text-gray-500">{cuisine.vector_dimension}D</p>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredCuisines.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No cuisines found matching your criteria.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
