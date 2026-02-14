'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Clock, 
  Play,
  Target,
  GraduationCap,
  Star,
  TrendingUp,
  Award,
  Globe,
  Zap
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    coursesCompleted: 0,
    recipesExplored: 0,
    adaptationsTried: 0,
    studyTime: 0
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'student') {
      router.push('/dashboard');
      return;
    }

    setStats({
      coursesCompleted: Math.floor(Math.random() * 5) + 2,
      recipesExplored: Math.floor(Math.random() * 30) + 15,
      adaptationsTried: Math.floor(Math.random() * 10) + 5,
      studyTime: Math.floor(Math.random() * 20) + 10
    });
  }, [user, isLoading, router]);

  const courses = [
    { name: 'Introduction to Culinary Science', progress: 100, status: 'completed' },
    { name: 'Cross-Cultural Cuisine Basics', progress: 75, status: 'in-progress' },
    { name: 'Molecular Gastronomy Fundamentals', progress: 45, status: 'in-progress' },
    { name: 'Advanced Recipe Adaptation', progress: 0, status: 'locked' }
  ];

  const achievements = [
    { name: 'First Adaptation', icon: Trophy, earned: true },
    { name: 'Cuisine Explorer', icon: Globe, earned: true },
    { name: 'Quick Learner', icon: Zap, earned: false },
    { name: 'Research Assistant', icon: Award, earned: false }
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
          <GraduationCap className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
            <p className="text-blue-100">
              Learn about cross-cultural cuisine and food science through interactive courses
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
            <BookOpen className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.coursesCompleted}
          </div>
          <div className="text-sm text-gray-600">Courses Completed</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">+8</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.recipesExplored}
          </div>
          <div className="text-sm text-gray-600">Recipes Explored</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Play className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">+3</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.adaptationsTried}
          </div>
          <div className="text-sm text-gray-600">Adaptations Tried</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">+2h</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.studyTime}h
          </div>
          <div className="text-sm text-gray-600">Study Time</div>
        </div>
      </motion.div>

      {/* Courses and Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Courses */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Courses</h2>
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{course.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    course.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      course.status === 'completed' ? 'bg-blue-500' :
                      course.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">{course.progress}% complete</div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h2>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`text-center p-4 rounded-lg border ${
                  achievement.earned 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <achievement.icon className={`w-8 h-8 mx-auto mb-2 ${
                  achievement.earned ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-medium text-gray-900">{achievement.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.earned ? 'Earned' : 'Locked'}
                </p>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/flavor-map"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Explore Cuisines</p>
              <p className="text-sm text-gray-600">Discover new flavors</p>
            </div>
          </a>
          
          <a
            href="/adapt"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Play className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Try Adaptation</p>
              <p className="text-sm text-gray-600">Practice your skills</p>
            </div>
          </a>
          
          <a
            href="/features"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Learn More</p>
              <p className="text-sm text-gray-600">Study resources</p>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
