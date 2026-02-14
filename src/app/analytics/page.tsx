'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, TrendingDown, Activity, Brain, FileText, Download, Filter, Calendar, Eye, Zap, Target } from 'lucide-react';

interface AnalyticsData {
  totalAdaptations: number;
  successRate: number;
  avgConfidence: number;
  researchPapers: number;
  dataPoints: number;
  activeStudies: number;
}

interface TrendData {
  day: string;
  adaptations: number;
  success: number;
  confidence: number;
}

interface StudyData {
  name: string;
  status: 'active' | 'completed' | 'planned';
  progress: number;
  participants: number;
  duration: string;
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalAdaptations: 0,
    successRate: 0,
    avgConfidence: 0,
    researchPapers: 0,
    dataPoints: 0,
    activeStudies: 0
  });

  const [trendData, setTrendData] = useState<TrendData[]>([
    { day: 'Mon', adaptations: 45, success: 89, confidence: 92 },
    { day: 'Tue', adaptations: 52, success: 91, confidence: 94 },
    { day: 'Wed', adaptations: 48, success: 87, confidence: 90 },
    { day: 'Thu', adaptations: 61, success: 93, confidence: 95 },
    { day: 'Fri', adaptations: 58, success: 90, confidence: 93 },
    { day: 'Sat', adaptations: 42, success: 85, confidence: 88 },
    { day: 'Sun', adaptations: 38, success: 86, confidence: 89 }
  ]);

  const [studies, setStudies] = useState<StudyData[]>([
    { name: 'Cross-Cultural Flavor Transferability', status: 'active', progress: 78, participants: 156, duration: '3 months' },
    { name: 'Structural Integrity Analysis', status: 'active', progress: 45, participants: 89, duration: '6 months' },
    { name: 'Semantic Divergence Study', status: 'completed', progress: 100, participants: 234, duration: '4 months' },
    { name: 'Cultural Distance Modeling', status: 'planned', progress: 15, participants: 0, duration: '2 months' }
  ]);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchAnalyticsData();
  }, [user, isLoading, router, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      // Simulate data updates
      setAnalyticsData({
        totalAdaptations: Math.floor(Math.random() * 500) + 1200,
        successRate: Math.floor(Math.random() * 10) + 85,
        avgConfidence: Math.floor(Math.random() * 8) + 87,
        researchPapers: Math.floor(Math.random() * 5) + 12,
        dataPoints: Math.floor(Math.random() * 1000) + 4500,
        activeStudies: Math.floor(Math.random() * 3) + 4
      });
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Research Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive analysis of CCAE system performance and research insights
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.totalAdaptations.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Adaptations</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.successRate}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <TrendingDown className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.avgConfidence}%
            </div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.researchPapers}
            </div>
            <div className="text-sm text-gray-600">Research Papers</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.dataPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Data Points</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-blue-600" />
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.activeStudies}
            </div>
            <div className="text-sm text-gray-600">Active Studies</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Trends</h3>
            
            <div className="space-y-4">
              {trendData.map((day, index) => (
                <div key={day.day} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {day.day}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xs text-gray-500">Adaptations</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(day.adaptations / 70) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs font-medium text-gray-900 w-8">
                        {day.adaptations}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">Success</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${day.success}%` }}
                        ></div>
                      </div>
                      <div className="text-xs font-medium text-gray-900 w-8">
                        {day.success}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Studies */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Research Studies</h3>
            
            <div className="space-y-4">
              {studies.map((study, index) => (
                <div key={study.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{study.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      study.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      study.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {study.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{study.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          study.status === 'completed' ? 'bg-blue-500' :
                          study.status === 'active' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${study.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{study.participants} participants</span>
                      <span>{study.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          Last updated: {new Date().toLocaleString()}
        </motion.div>
      </div>
    </div>
  );
}
