'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, Settings, LogOut, ChefHat, GraduationCap, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    adaptations: 0,
    recipesCreated: 0,
    researchPapers: 0,
    joinDate: ''
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Mock user stats
    setStats({
      adaptations: Math.floor(Math.random() * 50) + 10,
      recipesCreated: Math.floor(Math.random() * 20) + 5,
      researchPapers: Math.floor(Math.random() * 10) + 2,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
  }, [user, isLoading, router]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'chef': return <ChefHat className="w-6 h-6 text-blue-600" />;
      case 'student': return <User className="w-6 h-6 text-green-600" />;
      case 'researcher': return <GraduationCap className="w-6 h-6 text-purple-600" />;
      case 'admin': return <Shield className="w-6 h-6 text-red-600" />;
      default: return <User className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chef': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'researcher': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">{user.name}</h2>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  {getRoleIcon(user.role)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {stats.joinDate}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats and Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-blue-600" />
                  <span className="text-sm text-green-600 font-medium">+12%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.adaptations}
                </div>
                <div className="text-sm text-gray-600">Adaptations</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <ChefHat className="w-8 h-8 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+5</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.recipesCreated}
                </div>
                <div className="text-sm text-gray-600">Recipes Created</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                  <span className="text-sm text-green-600 font-medium">+2</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.researchPapers}
                </div>
                <div className="text-sm text-gray-600">Research Papers</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Adapted <span className="font-medium">Italian Margherita Pizza</span> to Japanese cuisine
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Created new recipe <span className="font-medium">Fusion Sushi Bowl</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Published research paper on <span className="font-medium">Cross-Cultural Flavor Analysis</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Completed <span className="font-medium">Advanced Culinary Analytics</span> course
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">First Adaptation</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ChefHat className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Recipe Master</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Globe className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Culture Explorer</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Research Pioneer</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
