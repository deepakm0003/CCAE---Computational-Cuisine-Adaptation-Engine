'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ccaeApi, { handleApiError } from '@/lib/api';
import { 
  GraduationCap, 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Target,
  Brain,
  Award,
  Clock,
  Users,
  Activity
} from 'lucide-react';

export default function ResearcherDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalCuisines: 0,
    totalIngredients: 0,
    experimentsRun: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'researcher') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const health = await ccaeApi.getHealth();
        setStats({
          totalRecipes: health.stats.recipes || 0,
          totalCuisines: health.stats.cuisines || 0,
          totalIngredients: health.stats.ingredients || 0,
          experimentsRun: 0 // Will be tracked with research activity
        });
      } catch (err) {
        console.error('Failed to fetch researcher data:', err);
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isLoading, router]);

  // Research projects - feature coming soon
  const researchProjects: { name: string; status: string; progress: number; participants: number }[] = [];

  // Recent papers - feature coming soon
  const recentPapers: { title: string; journal: string; citations: number; date: string }[] = [];

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <GraduationCap className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Research Dashboard</h1>
            <p className="text-blue-100">
              Advanced analytics and research tools for culinary innovation studies
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
            <FileText className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalRecipes}
          </div>
          <div className="text-sm text-gray-600">Total Recipes</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">Live</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalCuisines}
          </div>
          <div className="text-sm text-gray-600">Cuisines</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">Database</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalIngredients.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Ingredients</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">Ready</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.experimentsRun}
          </div>
          <div className="text-sm text-gray-600">Experiments</div>
        </div>
      </motion.div>

      {/* Research Projects and Papers */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Active Projects */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Research Projects</h2>
          <div className="space-y-4">
            {researchProjects.map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        project.status === 'completed' ? 'bg-blue-500' :
                        project.status === 'active' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{project.participants} participants</span>
                    <span>{project.status === 'active' ? 'Ongoing' : project.status === 'completed' ? 'Finished' : 'Starting soon'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Publications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Publications</h2>
          <div className="space-y-4">
            {recentPapers.map((paper, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">{paper.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{paper.journal}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">{paper.citations} citations</span>
                  </div>
                  <span className="text-gray-500">{paper.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Research Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/analytics"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Advanced Analytics</p>
              <p className="text-sm text-gray-600">Data analysis tools</p>
            </div>
          </a>
          
          <a
            href="/metrics"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">System Metrics</p>
              <p className="text-sm text-gray-600">Performance monitoring</p>
            </div>
          </a>
          
          <a
            href="/transferability"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Transferability Analysis</p>
              <p className="text-sm text-gray-600">Cross-cuisine metrics</p>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
