'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getScores, getHealth } from '@/lib/api';
import { Activity, Zap, Clock, CheckCircle, AlertTriangle, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';

interface MetricData {
  metric: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface HealthData {
  api_status: 'healthy' | 'warning' | 'error';
  inference_load: number;
  latency: number;
  model_stability: number;
  uptime: number;
  timestamp: string;
}

export default function MetricsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'researcher') {
      router.push('/');
      return;
    }

    fetchMetrics();
  }, [user, isLoading, router]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [scoresResponse, healthResponse] = await Promise.all([
        getScores(),
        getHealth()
      ]);

      // Transform scores data to metrics format
      const transformedMetrics: MetricData[] = [
        {
          metric: 'Average Identity Score',
          value: scoresResponse.average_identity_score,
          unit: '%',
          status: scoresResponse.average_identity_score > 80 ? 'good' : 
                  scoresResponse.average_identity_score > 60 ? 'warning' : 'critical',
          trend: 'stable'
        },
        {
          metric: 'Average Compatibility Score',
          value: scoresResponse.average_compatibility_score,
          unit: '%',
          status: scoresResponse.average_compatibility_score > 80 ? 'good' : 
                  scoresResponse.average_compatibility_score > 60 ? 'warning' : 'critical',
          trend: 'up'
        },
        {
          metric: 'Average Adaptation Distance',
          value: scoresResponse.average_adaptation_distance,
          unit: 'units',
          status: scoresResponse.average_adaptation_distance < 0.5 ? 'good' : 
                  scoresResponse.average_adaptation_distance < 0.8 ? 'warning' : 'critical',
          trend: 'down'
        },
        {
          metric: 'Average Processing Time',
          value: scoresResponse.average_processing_time,
          unit: 'ms',
          status: scoresResponse.average_processing_time < 1000 ? 'good' : 
                  scoresResponse.average_processing_time < 2000 ? 'warning' : 'critical',
          trend: 'stable'
        },
        {
          metric: 'Total Recipes',
          value: scoresResponse.total_recipes,
          unit: 'recipes',
          status: 'good',
          trend: 'up'
        },
        {
          metric: 'Total Cuisines',
          value: scoresResponse.total_cuisines,
          unit: 'cuisines',
          status: 'good',
          trend: 'stable'
        }
      ];

      setMetrics(transformedMetrics);
      setHealth(healthResponse);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Failed to load metrics data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MetricData['status']) => {
    switch (status) {
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-blue-600 bg-blue-100';
      case 'critical': return 'text-blue-600 bg-blue-100';
    }
  };

  const getTrendIcon = (trend: MetricData['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-blue-600 rotate-180" />;
      case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading metrics...</p>
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
              System Metrics
            </h1>
            <p className="text-gray-600">
              Real-time performance and health monitoring
            </p>
          </div>
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Health Status */}
        {health && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              System Health
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                  health.api_status === 'healthy' ? 'bg-blue-100 text-blue-800' :
                  health.api_status === 'warning' ? 'bg-blue-100 text-blue-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  {health.api_status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">API Status</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {health.inference_load}%
                </div>
                <div className="text-sm text-gray-600">Inference Load</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {health.latency}ms
                </div>
                <div className="text-sm text-gray-600">Latency</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {health.uptime}h
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.metric}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {metric.metric}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </span>
                    <span className="text-sm text-gray-500">
                      {metric.unit}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metric.status === 'good' ? 'bg-blue-500' :
                    metric.status === 'warning' ? 'bg-blue-500' :
                    'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (metric.value / 100) * 100)}%` 
                  }}
                ></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          Last updated: {new Date().toLocaleString()}
        </motion.div>
      </div>
    </div>
  );
}
