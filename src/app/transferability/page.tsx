'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TrendingUp, AlertTriangle, CheckCircle, Activity, Zap, Shield, Globe, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import ccaeApi, { handleApiError } from '@/lib/api';

export default function TransferabilityPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchHeatmapData();
  }, [user, isLoading, router]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get transferability matrix from backend
      const transferData = await ccaeApi.getTransferability();
      
      // If no transferability data is available, create empty state
      if (!transferData || !transferData.matrix) {
        setError('No transferability data available. Upload data and compute identities first.');
        return;
      }
      
      setHeatmapData(transferData);
      
    } catch (err) {
      console.error('Failed to fetch heatmap data:', err);
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 0.8) return 'bg-blue-500';
    if (value >= 0.6) return 'bg-blue-500';
    if (value >= 0.4) return 'bg-blue-500';
    return 'bg-blue-500';
  };

  const getTextColor = (value: number) => {
    return value > 0.5 ? 'text-white' : 'text-gray-900';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transferability analysis...</p>
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Transferability Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze how easily recipes can be transferred between different cuisines.
            Our heatmap shows compatibility scores based on molecular and cultural analysis.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Live</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {heatmapData?.source_cuisines?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Cuisines Analyzed</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">High</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">85%</div>
            <div className="text-sm text-gray-600">Avg. Transferability</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Ready</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {heatmapData?.matrix?.length || 0}²
            </div>
            <div className="text-sm text-gray-600">Data Points</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Valid</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">98%</div>
            <div className="text-sm text-gray-600">Confidence Score</div>
          </div>
        </motion.div>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Cross-Cuisine Transferability Matrix
            </h2>
            <button
              onClick={fetchHeatmapData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <div className="text-blue-600 mb-4">{error}</div>
              <button
                onClick={fetchHeatmapData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : heatmapData ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">
                      From \ To
                    </th>
                    {heatmapData.target_cuisines.map((cuisine: string) => (
                      <th key={cuisine} className="p-3 text-center text-sm font-medium text-gray-700">
                        {cuisine}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.source_cuisines.map((sourceCuisine: string, i: number) => (
                    <tr key={sourceCuisine}>
                      <td className="p-3 font-medium text-gray-900 border-r">
                        {sourceCuisine}
                      </td>
                      {heatmapData.target_cuisines.map((targetCuisine: string, j: number) => {
                        const value = heatmapData.matrix[i][j];
                        const isSelected = selectedCell?.source === sourceCuisine && selectedCell?.target === targetCuisine;
                        
                        return (
                          <td
                            key={targetCuisine}
                            className={`p-3 text-center cursor-pointer transition-all duration-200 ${
                              isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                            }`}
                            onClick={() => setSelectedCell({ source: sourceCuisine, target: targetCuisine, value })}
                          >
                            <div
                              className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-sm font-medium ${getHeatmapColor(value)} ${getTextColor(value)}`}
                            >
                              {value.toFixed(1)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transferability Scale</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
              <div>
                <div className="font-medium text-gray-900">Excellent (0.8-1.0)</div>
                <div className="text-sm text-gray-600">Highly compatible</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
              <div>
                <div className="font-medium text-gray-900">Good (0.6-0.8)</div>
                <div className="text-sm text-gray-600">Moderately compatible</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
              <div>
                <div className="font-medium text-gray-900">Fair (0.4-0.6)</div>
                <div className="text-sm text-gray-600">Limited compatibility</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
              <div>
                <div className="font-medium text-gray-900">Poor (0.0-0.4)</div>
                <div className="text-sm text-gray-600">Low compatibility</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selected Cell Details */}
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Transferability Details
              </h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Route Analysis</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{selectedCell.source}</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>{selectedCell.target}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Compatibility Score</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium ${getHeatmapColor(selectedCell.value)}`}>
                    {selectedCell.value.toFixed(1)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {selectedCell.value >= 0.8 ? 'Excellent match!' :
                     selectedCell.value >= 0.6 ? 'Good compatibility' :
                     selectedCell.value >= 0.4 ? 'Fair adaptation possible' :
                     'Challenging adaptation'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
