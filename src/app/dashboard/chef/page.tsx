'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ccaeApi, { handleApiError, getAdaptationStats, getAdaptationHistory } from '@/lib/api';
import { 
  ChefHat, 
  TrendingUp, 
  Clock, 
  Star, 
  Play,
  BookOpen,
  Users,
  Award,
  Zap,
  Target
} from 'lucide-react';

export default function ChefDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalCuisines: 0,
    totalIngredients: 0,
    adaptationsCompleted: 0
  });
  const [recentRecipes, setRecentRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'chef') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Get real stats from API
        const health = await ccaeApi.getHealth();
        const adaptationStats = getAdaptationStats();
        
        setStats({
          totalRecipes: health.stats.recipes || 0,
          totalCuisines: health.stats.cuisines || 0,
          totalIngredients: health.stats.ingredients || 0,
          adaptationsCompleted: adaptationStats.total
        });

        // Get recent recipes from API
        const recipes = await ccaeApi.getRecipes();
        const recentList = recipes.slice(0, 4).map((recipe: any) => ({
          name: recipe.name,
          cuisine: recipe.cuisine,
          ingredients: recipe.ingredients?.length || 0
        }));
        setRecentRecipes(recentList);
      } catch (err) {
        console.error('Failed to fetch chef data:', err);
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Listen for adaptation completions to refresh stats
    const handleAdaptationComplete = () => fetchData();
    window.addEventListener('adaptation-completed', handleAdaptationComplete);
    
    return () => {
      window.removeEventListener('adaptation-completed', handleAdaptationComplete);
    };
  }, [user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <ChefHat className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Chef Dashboard</h1>
            <p className="text-blue-100">
              Create innovative cross-cultural recipes with AI-powered adaptation tools
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <ChefHat className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalRecipes}
          </div>
          <div className="text-sm text-gray-600">Total Recipes</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">Live</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalCuisines}
          </div>
          <div className="text-sm text-gray-600">Cuisines</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">Database</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalIngredients}
          </div>
          <div className="text-sm text-gray-600">Ingredients</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">Ready</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.adaptationsCompleted}
          </div>
          <div className="text-sm text-gray-600">Adaptations</div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/adapt"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Play className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Create New Adaptation</p>
                <p className="text-sm text-gray-600">Start a new recipe adaptation</p>
              </div>
            </a>
            
            <a
              href="/flavor-map"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Explore Flavor Map</p>
                <p className="text-sm text-gray-600">Discover cuisine relationships</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Resources</h2>
          <div className="space-y-3">
            <a
              href="/features"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Tutorial Center</p>
                <p className="text-sm text-gray-600">Learn advanced techniques</p>
              </div>
            </a>
            
            <a
              href="/analytics"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Achievements</p>
                <p className="text-sm text-gray-600">Track your progress</p>
              </div>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Recent Recipes */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Recipes from Database</h2>
        
        <div className="space-y-4">
          {recentRecipes.length > 0 ? (
            recentRecipes.map((recipe, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{recipe.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-blue-500" />
                      {recipe.cuisine}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.ingredients} ingredients
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recipes found. Upload some recipe data to get started!</p>
              <a href="/data-upload" className="text-blue-600 hover:underline mt-2 inline-block">
                Go to Data Upload
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
