'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
    recipesCreated: 0,
    adaptationsCompleted: 0,
    avgRating: 0,
    timeSaved: 0
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'chef') {
      router.push('/dashboard');
      return;
    }

    setStats({
      recipesCreated: Math.floor(Math.random() * 20) + 5,
      adaptationsCompleted: Math.floor(Math.random() * 50) + 20,
      avgRating: (Math.random() * 2 + 3).toFixed(1),
      timeSaved: Math.floor(Math.random() * 10) + 5
    });
  }, [user, isLoading, router]);

  const recentRecipes = [
    { name: 'Fusion Sushi Pizza', rating: 4.8, adaptations: 12, time: '2 hours ago' },
    { name: 'Thai Tacos al Pastor', rating: 4.6, adaptations: 8, time: '1 day ago' },
    { name: 'Indian-style Ramen', rating: 4.9, adaptations: 15, time: '2 days ago' },
    { name: 'Mexican Birria Ramen', rating: 4.7, adaptations: 10, time: '3 days ago' }
  ];

  if (isLoading) {
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
            {stats.recipesCreated}
          </div>
          <div className="text-sm text-gray-600">Recipes Created</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">+8</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.adaptationsCompleted}
          </div>
          <div className="text-sm text-gray-600">Adaptations</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">+0.2</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.avgRating}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">-2h</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.timeSaved}h
          </div>
          <div className="text-sm text-gray-600">Time Saved</div>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Creations</h2>
        
        <div className="space-y-4">
          {recentRecipes.map((recipe, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{recipe.name}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-blue-500" />
                    {recipe.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.adaptations} adaptations
                  </div>
                  <div>{recipe.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
