'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Database, 
  Settings, 
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 0,
    dataProcessed: 0
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setStats({
      totalUsers: Math.floor(Math.random() * 200) + 100,
      activeUsers: Math.floor(Math.random() * 100) + 50,
      systemHealth: Math.floor(Math.random() * 10) + 90,
      dataProcessed: Math.floor(Math.random() * 5000) + 10000
    });
  }, [user, isLoading, router]);

  const systemAlerts = [
    { type: 'warning', message: 'High memory usage on processing server', time: '5 minutes ago' },
    { type: 'info', message: 'Scheduled maintenance in 2 hours', time: '1 hour ago' },
    { type: 'success', message: 'Database backup completed successfully', time: '2 hours ago' }
  ];

  const recentActivity = [
    { action: 'User registration', user: 'John Doe', time: '2 minutes ago' },
    { action: 'Recipe adaptation completed', user: 'Chef Smith', time: '5 minutes ago' },
    { action: 'System update deployed', user: 'System', time: '15 minutes ago' },
    { action: 'New data uploaded', user: 'Research Team', time: '30 minutes ago' }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-blue-50 border-blue-200';
      case 'error': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-blue-50 border-blue-200';
      default: return 'bg-blue-50 border-blue-200';
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <Shield className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100">
              System administration and monitoring center
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
            <Users className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalUsers}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">+12</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.activeUsers}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">Optimal</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.systemHealth}%
          </div>
          <div className="text-sm text-gray-600">System Health</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <div className="text-xs text-blue-600 font-medium">+1K</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.dataProcessed.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Data Processed</div>
        </div>
      </motion.div>

      {/* System Alerts and Activity */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* System Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Alerts</h2>
          <div className="space-y-3">
            {systemAlerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span>
                    {activity.user !== 'System' && ` by ${activity.user}`}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Admin Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Administration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/data-upload"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Data Management</p>
              <p className="text-sm text-gray-600">Upload and manage data</p>
            </div>
          </a>
          
          <a
            href="/metrics"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">System Metrics</p>
              <p className="text-sm text-gray-600">Performance monitoring</p>
            </div>
          </a>
          
          <a
            href="/settings"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">System Settings</p>
              <p className="text-sm text-gray-600">Configure platform</p>
            </div>
          </a>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">API Server</h3>
            <p className="text-sm text-blue-600">Operational</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Database</h3>
            <p className="text-sm text-blue-600">Healthy</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Processing Queue</h3>
            <p className="text-sm text-blue-600">High Load</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">CDN</h3>
            <p className="text-sm text-blue-600">Operational</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
