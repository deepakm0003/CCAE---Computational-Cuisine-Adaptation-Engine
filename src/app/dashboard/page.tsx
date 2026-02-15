'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ccaeApi, { handleApiError } from '@/lib/api';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  Calendar,
  Clock,
  ArrowRight,
  Play,
  BarChart3,
  Globe,
  ChefHat,
  GraduationCap,
  Shield
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAdaptations: 0,
    successRate: 0,
    totalRecipes: 0,
    totalCuisines: 0,
    avgProcessingTime: 0
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        const health = await ccaeApi.getHealth();
        setStats({
          totalAdaptations: 0, // Will be tracked when we add adaptation logging
          successRate: 95, // Default success rate
          totalRecipes: health.stats.recipes,
          totalCuisines: health.stats.cuisines,
          avgProcessingTime: 850 // Average in ms
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, [user, isLoading, router]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'chef':
        return {
          title: 'Culinary Innovation Hub',
          description: 'Explore new recipe adaptations and culinary techniques',
          actions: [
            { label: 'Create New Adaptation', href: '/adapt', icon: Play },
            { label: 'View Flavor Map', href: '/flavor-map', icon: Globe },
            { label: 'Recipe Analytics', href: '/analytics', icon: BarChart3 }
          ]
        };
      case 'student':
        return {
          title: 'Learning Dashboard',
          description: 'Track your progress and explore culinary science',
          actions: [
            { label: 'Start Learning', href: '/features', icon: GraduationCap },
            { label: 'Explore Cuisines', href: '/flavor-map', icon: Globe },
            { label: 'View Progress', href: '/profile', icon: Users }
          ]
        };
      case 'researcher':
        return {
          title: 'Research Center',
          description: 'Advanced analytics and research tools',
          actions: [
            { label: 'View Analytics', href: '/analytics', icon: BarChart3 },
            { label: 'Research Tools', href: '/metrics', icon: Target },
            { label: 'Data Analysis', href: '/transferability', icon: TrendingUp }
          ]
        };
      case 'admin':
        return {
          title: 'System Administration',
          description: 'Manage system settings and monitor performance',
          actions: [
            { label: 'Data Upload', href: '/data-upload', icon: Target },
            { label: 'System Metrics', href: '/metrics', icon: BarChart3 },
            { label: 'User Management', href: '/settings', icon: Shield }
          ]
        };
      default:
        return {
          title: 'Welcome Dashboard',
          description: 'Explore the CCAE platform',
          actions: [
            { label: 'Get Started', href: '/features', icon: Play },
            { label: 'Explore', href: '/flavor-map', icon: Globe },
            { label: 'Learn More', href: '/about', icon: Users }
          ]
        };
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'chef': return <ChefHat className="w-6 h-6" />;
      case 'student': return <Users className="w-6 h-6" />;
      case 'researcher': return <GraduationCap className="w-6 h-6" />;
      case 'admin': return <Shield className="w-6 h-6" />;
      default: return <Brain className="w-6 h-6" />;
    }
  };

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

  const roleContent = getRoleBasedContent();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getWelcomeMessage()}, {user.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              {roleContent.description}
            </p>
            <div className="flex items-center gap-2 mt-4">
              {getRoleIcon(user.role)}
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium capitalize">
                {user.role}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-2">
              {stats.totalAdaptations}
            </div>
            <div className="text-blue-100">
              Total Adaptations
            </div>
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
            <Target className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalAdaptations}
          </div>
          <div className="text-sm text-gray-600">Total Adaptations</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-blue-500" />
            <div className="text-xs text-blue-500 font-medium">+5%</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.successRate}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-500 font-medium">Live</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalRecipes}
          </div>
          <div className="text-sm text-gray-600">Total Recipes</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <ChefHat className="w-8 h-8 text-blue-400" />
            <div className="text-xs text-blue-500 font-medium">{stats.totalCuisines} types</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalCuisines}
          </div>
          <div className="text-sm text-gray-600">Cuisines</div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleContent.actions.map((action, index) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <action.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 group-hover:text-blue-600">
                  {action.label}
                </p>
                <p className="text-sm text-gray-500">
                  Get started →
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </a>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                Welcome to the CCAE Dashboard! Explore the features available for your role.
              </p>
              <p className="text-xs text-gray-500 mt-1">Just now</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                System successfully initialized with all components operational.
              </p>
              <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                New features and improvements have been added to the platform.
              </p>
              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
