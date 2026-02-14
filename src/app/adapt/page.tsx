'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Settings, Eye, AlertTriangle, ChefHat, Globe, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { getRecipes, getCuisines, adaptRecipe, previewCompatibility } from '@/lib/api';
import RecipeDropdown from '@/components/RecipeDropdown';
import CuisineSelector from '@/components/CuisineSelector';
import IntensitySlider from '@/components/IntensitySlider';
import LivePreviewPanel from '@/components/LivePreviewPanel';

const AdaptPage = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRunAdaptation = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get selected recipe and target cuisine from localStorage
      const selectedRecipeId = localStorage.getItem('selectedRecipe');
      const targetCuisine = localStorage.getItem('targetCuisine');
      
      if (!selectedRecipeId || !targetCuisine) {
        setError('Please select a recipe and target cuisine first');
        return;
      }
      
      // Call real adaptation API
      const response = await adaptRecipe({
        recipe_id: parseInt(selectedRecipeId),
        source_cuisine: '', // Will be determined by backend
        target_cuisine: targetCuisine,
        replacement_ratio: 0.3
      });
      
      // Store result in localStorage for result page
      localStorage.setItem('adaptationResult', JSON.stringify(response));
      
      setSuccess('Recipe adaptation completed successfully!');
      
      // Redirect to result page after a short delay
      setTimeout(() => {
        router.push('/adapt/result');
      }, 2000);
      
    } catch (err) {
      console.error('Adaptation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to adapt recipe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = async () => {
    try {
      const selectedRecipe = localStorage.getItem('selectedRecipe');
      const targetCuisine = localStorage.getItem('targetCuisine');
      
      if (!selectedRecipe || !targetCuisine) {
        throw new Error('Please select a recipe and target cuisine');
      }
      
      // Call real preview API
      const response = await previewCompatibility({
        recipe_id: parseInt(selectedRecipe),
        source_cuisine: '', // Will be determined by backend
        target_cuisine: targetCuisine
      });
      
      // Store preview data
      localStorage.setItem('previewData', JSON.stringify(response));
      
    } catch (err) {
      console.error('Preview failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          onClick={() => router.push('/flavor-map')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Flavor Map
        </motion.button>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">{success}</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        {loadingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Processing adaptation...</p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recipe Adaptation Engine
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform recipes across cultural boundaries while preserving their essential identity.
            Our AI-powered system analyzes molecular structures and culinary patterns.
          </p>
        </motion.div>

        {/* Main Control Panel */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <RecipeDropdown onPreview={handlePreview} />
            <CuisineSelector onPreview={handlePreview} />
            <IntensitySlider />
            <LivePreviewPanel />
            
            {/* Advanced Mode Toggle */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Advanced Settings
                </h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showAdvanced ? 'Hide' : 'Show'}
                </button>
              </div>

              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identity Preservation Weight
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="80"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compatibility Enhancement
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="60"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Replacement Ratio
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="30"
                      className="w-full"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            {/* Adaptation Preview */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Adaptation Preview
              </h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">AI-Powered Analysis</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Our system analyzes molecular compatibility and cultural patterns to ensure authentic taste profiles.
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Identity Preservation</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Core flavor compounds and cooking techniques are maintained while adapting ingredients.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Cultural Authenticity</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Respects traditional cooking methods and cultural significance of each cuisine.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-blue-600" />
                Start Adaptation
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleRunAdaptation}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Adaptation
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowTransparency(!showTransparency)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  View Process Details
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Transparency Panel */}
        {showTransparency && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Process Transparency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1. Analysis Phase</h4>
                <p className="text-sm text-gray-600">
                  Molecular structure analysis and cultural pattern recognition.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2. Adaptation Engine</h4>
                <p className="text-sm text-gray-600">
                  AI-powered ingredient substitution and technique adaptation.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">3. Validation</h4>
                <p className="text-sm text-gray-600">
                  Quality checks and authenticity verification.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdaptPage;
