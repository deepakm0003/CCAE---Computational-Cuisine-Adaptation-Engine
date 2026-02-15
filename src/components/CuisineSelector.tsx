'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Globe, AlertTriangle, RefreshCw } from 'lucide-react';
import ccaeApi, { handleApiError } from '@/lib/api';

interface Cuisine {
  name: string;
  code?: string;
  identity_strength?: number;
}

interface CuisineSelectorProps {
  onPreview?: () => void;
}

const CuisineSelector = ({ onPreview }: CuisineSelectorProps) => {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCuisines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ccaeApi.getCuisines();
      
      if (response && response.length > 0) {
        // Transform string array to Cuisine objects
        const cuisineObjects = response.map((c: string | Cuisine) => {
          if (typeof c === 'string') {
            return { name: c };
          }
          return c;
        });
        setCuisines(cuisineObjects);
      } else {
        setError('No cuisines found. Upload data and compute identities first.');
      }
    } catch (err) {
      console.error('Failed to fetch cuisines:', err);
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuisines();
  }, []);

  const handleCuisineSelect = (cuisine: Cuisine) => {
    setSelectedCuisine(cuisine);
    localStorage.setItem('targetCuisine', cuisine.name);
    
    // Trigger preview if callback provided
    if (onPreview) {
      setTimeout(onPreview, 100);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600">Loading cuisines...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cuisine Loading Error</h3>
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <button
              onClick={fetchCuisines}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Target Cuisine</h3>
        {cuisines.length > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {cuisines.length} available
          </span>
        )}
      </div>

      <div className="space-y-4">
        <select
          value={selectedCuisine?.name || ''}
          onChange={(e) => {
            const cuisine = cuisines.find(c => c.name === e.target.value);
            if (cuisine) handleCuisineSelect(cuisine);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select target cuisine...</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine.name} value={cuisine.name}>
              {cuisine.name}
            </option>
          ))}
        </select>

        {selectedCuisine && (
          <motion.div
            className="bg-blue-50 rounded-lg p-4 border border-blue-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Selected: {selectedCuisine.name}</div>
              <div className="text-xs text-blue-600">
                Recipes will be adapted to match this cuisine's identity profile
              </div>
              {selectedCuisine.identity_strength && (
                <div className="text-xs text-blue-600 mt-1">
                  Identity Strength: {(selectedCuisine.identity_strength * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </motion.div>
        )}

        {cuisines.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No cuisines available</p>
            <p className="text-sm mt-1">Upload data and compute identities first</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CuisineSelector;
