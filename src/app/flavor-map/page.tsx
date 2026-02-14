'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getFlavorMap } from '@/lib/api';
import { Brain, Globe, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import FlavorMapCanvas from '@/components/FlavorMapCanvas';
import CuisineTooltip from '@/components/CuisineTooltip';
import FilterPanel from '@/components/FilterPanel';

export default function FlavorMapPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [flavorData, setFlavorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<any>(null);
  const [filters, setFilters] = useState({
    region: 'all',
    complexity: 'all',
    ingredients: 'all'
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchFlavorMap();
  }, [user, isLoading, router]);

  const fetchFlavorMap = async () => {
    try {
      setLoading(true);
      const response = await getFlavorMap();
      setFlavorData(response);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch flavor map:', err);
      setError('Failed to load flavor map data');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flavor map...</p>
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
            Interactive Flavor Map
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the relationships between different cuisines through our computational flavor analysis.
            Click on any cuisine to see detailed molecular profiles and compatibility metrics.
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
              <span className="text-sm text-blue-600 font-medium">Live Data</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {flavorData?.cuisines?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Cuisines</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {flavorData?.dimensions || 2}
            </div>
            <div className="text-sm text-gray-600">Dimensions</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Ready</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {flavorData?.molecules?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Molecules</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Updated</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              98%
            </div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
            />
          </motion.div>

          {/* Flavor Map Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Cuisine Relationships
                </h2>
                <button
                  onClick={fetchFlavorMap}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {error ? (
                <div className="text-center py-12">
                  <div className="text-blue-600 mb-4">{error}</div>
                  <button
                    onClick={fetchFlavorMap}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <FlavorMapCanvas
                  data={flavorData}
                  onCuisineSelect={setSelectedCuisine}
                  selectedCuisine={selectedCuisine}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Cuisine Details */}
        {selectedCuisine && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <CuisineTooltip
              cuisine={selectedCuisine}
              onClose={() => setSelectedCuisine(null)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
