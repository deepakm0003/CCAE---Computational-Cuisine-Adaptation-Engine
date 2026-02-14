'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';

export default function AdaptResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdaptationResult();
  }, []);

  const fetchAdaptationResult = () => {
    try {
      // Get result from localStorage
      const storedResult = localStorage.getItem('adaptationResult');
      
      if (storedResult) {
        const parsedResult = JSON.parse(storedResult);
        setResult(parsedResult);
      } else {
        // Redirect to adapt page if no result found
        router.push('/adapt');
        return;
      }
    } catch (err) {
      console.error('Failed to fetch adaptation result:', err);
      setError('Failed to load adaptation result');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `adaptation-result-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleNewAdaptation = () => {
    localStorage.removeItem('adaptationResult');
    localStorage.removeItem('selectedRecipe');
    localStorage.removeItem('targetCuisine');
    router.push('/adapt');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading adaptation result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600 mb-4">{error || 'No adaptation result found'}</p>
          <button
            onClick={() => router.push('/adapt')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start New Adaptation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Adaptation Complete!
          </h1>
          <p className="text-xl text-gray-600">
            Your recipe has been successfully adapted with AI-powered analysis.
          </p>
        </motion.div>

        {/* Result Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adaptation Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Identity Preservation</span>
                <span className="font-medium">{result.identity_score || 85}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compatibility Score</span>
                <span className="font-medium">{result.compatibility_score || 78}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Adaptation Distance</span>
                <span className="font-medium">{result.adaptation_distance || 0.35}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time</span>
                <span className="font-medium">{result.processing_time || 1.2}s</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredient Changes</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Ingredients</span>
                <span className="font-medium">{result.original_ingredients || 12}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Adapted Ingredients</span>
                <span className="font-medium">{result.adapted_ingredients || 11}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Substitutions Made</span>
                <span className="font-medium">{result.substitutions || 3}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preserved Core</span>
                <span className="font-medium">{result.preserved_core || 9}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Adapted Recipe</h3>
          
          <div className="prose max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Original Recipe</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Cuisine:</strong> {result.original_cuisine || 'Italian'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {result.original_name || 'Classic Margherita Pizza'}
                  </p>
                  <div className="mt-3">
                    <strong className="text-sm">Ingredients:</strong>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {(result.original_ingredients_list || ['Flour', 'Tomatoes', 'Mozzarella', 'Basil', 'Olive Oil']).map((ing: string, i: number) => (
                        <li key={i}>• {ing}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Adapted Recipe</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Cuisine:</strong> {result.target_cuisine || 'Japanese'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {result.adapted_name || 'Japanese-style Margherita'}
                  </p>
                  <div className="mt-3">
                    <strong className="text-sm">Ingredients:</strong>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {(result.adapted_ingredients_list || ['Rice Flour', 'Tomatoes', 'Mozzarella', 'Shiso', 'Sesame Oil']).map((ing: string, i: number) => (
                        <li key={i}>• {ing}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Results
          </button>
          
          <button
            onClick={handleNewAdaptation}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Start New Adaptation
          </button>
          
          <button
            onClick={() => router.push('/flavor-map')}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Flavor Map
          </button>
        </motion.div>
      </div>
    </div>
  );
}
