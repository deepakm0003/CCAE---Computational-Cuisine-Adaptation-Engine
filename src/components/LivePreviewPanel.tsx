'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Eye, Activity, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { previewCompatibility, CompatibilityPreviewResponse } from '@/lib/api';

interface PreviewData {
  identity_score: number;
  compatibility_score: number;
  adaptation_distance: number;
  flavor_coherence: number;
  estimated_is_drop: number;
  estimated_cs_increase: number;
}

interface LivePreviewPanelProps {
  // No props needed for now
}

const LivePreviewPanel = () => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPreviewData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get selected recipe and target cuisine from localStorage
      const selectedRecipeId = localStorage.getItem('selectedRecipe');
      const targetCuisine = localStorage.getItem('targetCuisine');
      
      if (!selectedRecipeId || !targetCuisine) {
        setError('Please select a recipe and target cuisine first');
        return;
      }
      
      // Call real API for preview
      const response: CompatibilityPreviewResponse = await previewCompatibility({
        recipe_id: parseInt(selectedRecipeId),
        source_cuisine: '', // Will be determined by backend
        target_cuisine: targetCuisine
      });
      
      // Transform API response to component format
      const transformedData: PreviewData = {
        identity_score: response.mathematical_scores.identity_score || 0,
        compatibility_score: response.mathematical_scores.compatibility_score || 0,
        adaptation_distance: 1 - response.mathematical_scores.compatibility_ratio || 0, // Transform compatibility ratio
        flavor_coherence: response.mathematical_scores.cuisine_similarity || 0,
        estimated_is_drop: Math.max(0, 100 - response.mathematical_scores.identity_score) || 0, // Calculate from identity score
        estimated_cs_increase: Math.max(0, response.mathematical_scores.compatibility_score - 50) || 0 // Calculate from compatibility score
      };
      
      setPreviewData(transformedData);
      setLastUpdated(new Date());
      
      // Store preview data for other components
      localStorage.setItem('previewData', JSON.stringify(transformedData));
    } catch (err) {
      console.error('Failed to fetch preview data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPreviewData();
    
    // Set up interval for periodic updates (every 10 seconds)
    const interval = setInterval(fetchPreviewData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-blue-600';
    return 'text-blue-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-blue-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-blue-100';
    return 'bg-blue-100';
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Live Preview Analysis
        </h3>
        <motion.button
          onClick={fetchPreviewData}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>
      
      {error && (
        <motion.div
          className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-blue-800">Preview Error</div>
              <div className="text-xs text-blue-700 mt-1">{error}</div>
            </div>
          </div>
        </motion.div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing compatibility...</p>
        </div>
      ) : previewData ? (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              className="bg-gray-50 rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-sm text-gray-600 mb-2">Identity Preservation</div>
              <div className={`text-2xl font-bold ${getScoreColor(previewData.identity_score)}`}>
                {previewData.identity_score.toFixed(1)}%
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-50 rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-sm text-gray-600 mb-2">Compatibility Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(previewData.compatibility_score)}`}>
                {previewData.compatibility_score.toFixed(1)}%
              </div>
            </motion.div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              className="text-center bg-gray-50 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-sm text-gray-600 mb-1">Adaptation Distance</div>
              <div className="text-lg font-bold text-gray-900">
                {previewData.adaptation_distance.toFixed(3)}
              </div>
              <div className="text-xs text-gray-500">Semantic units</div>
            </motion.div>

            <motion.div
              className="text-center bg-gray-50 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-sm text-gray-600 mb-1">Flavor Coherence</div>
              <div className="text-lg font-bold text-gray-900">
                {previewData.flavor_coherence.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Molecular alignment</div>
            </motion.div>

            <motion.div
              className="text-center bg-gray-50 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-sm text-gray-600 mb-1">Est. IS Drop</div>
              <div className={`text-lg font-bold ${getScoreColor(100 - previewData.estimated_is_drop)}`}>
                -{previewData.estimated_is_drop.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Identity impact</div>
            </motion.div>

            <motion.div
              className="text-center bg-gray-50 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="text-sm text-gray-600 mb-1">Est. CS Increase</div>
              <div className={`text-lg font-bold ${getScoreColor(previewData.estimated_cs_increase)}`}>
                +{previewData.estimated_cs_increase.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Cross-cultural appeal</div>
            </motion.div>
          </div>

          {/* Status Indicators */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">✅ Live API Connected</span>
            </div>
            <div className="text-xs text-blue-700">
              Real-time preview from ML adaptation engine. Updates every 10 seconds.
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {/* Warning */}
          {(previewData.estimated_is_drop > 20 || previewData.adaptation_distance > 0.5) && (
            <motion.div
              className="bg-blue-50 rounded-xl p-4 border border-blue-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-800">
                    <strong>High Adaptation Risk Detected</strong>
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Current settings may result in significant identity loss or structural incoherence.
                    Consider reducing intensity or adjusting weights.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Select a recipe and target cuisine to see live preview
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default LivePreviewPanel;
