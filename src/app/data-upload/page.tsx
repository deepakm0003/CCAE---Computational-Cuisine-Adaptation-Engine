'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Database, Upload, RefreshCw, CheckCircle, X, Wifi, WifiOff, Search, Zap, Globe } from 'lucide-react';
import { useDataUploadStore } from '@/store/dataUploadStore';
import FileUploadCard from '@/components/FileUploadCard';
import UploadProgress from '@/components/UploadProgress';
import UploadSummaryCard from '@/components/UploadSummaryCard';
import ccaeApi, { handleApiError } from '@/lib/api';

export default function DataUploadPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { files, summary, isUploading, clearFiles, setUploading } = useDataUploadStore();
  const [systemStats, setSystemStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchSystemStats();
  }, [user, isLoading, router]);

  const fetchSystemStats = async () => {
    try {
      const healthData = await ccaeApi.getHealth();
      setSystemStats({
        totalCuisines: healthData.stats.cuisines,
        totalRecipes: healthData.stats.recipes,
        totalIngredients: healthData.stats.ingredients,
        lastUpdate: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to fetch system stats:', err);
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    }
  };

  const handleFileUpload = async (file: File, type: 'recipes' | 'molecules') => {
    const fileId = Date.now().toString();
    
    // Add file to store
    const fileItem = {
      id: fileId,
      name: file.name,
      size: file.size,
      type,
      status: 'pending' as const,
      progress: 0
    };

    // This would be handled by the FileUploadCard component
  };

  const handleTestConnection = async () => {
    setApiLoading(true);
    try {
      const result = await ccaeApi.getHealth();
      setApiStatus({
        connected: result.status === 'healthy',
        message: `Backend connected: ${result.stats.cuisines} cuisines, ${result.stats.recipes} recipes`
      });
    } catch (err) {
      const errorMessage = handleApiError(err);
      setApiStatus({
        connected: false,
        message: `Failed to connect: ${errorMessage}`
      });
    } finally {
      setApiLoading(false);
    }
  };

  const handleSearchIngredients = async () => {
    if (!ingredientQuery.trim()) return;
    setApiLoading(true);
    try {
      // For now, just show a placeholder since searchIngredients was removed
      setSearchResults([{ name: ingredientQuery, available: true }]);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setApiLoading(false);
    }
  };

  const handleRecompute = async () => {
    try {
      setUploading(true);
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchSystemStats();
    } catch (err) {
      console.error('Recompute failed:', err);
      setError('Failed to recompute embeddings');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            Data Upload Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload recipe and molecular data to power the CCAE system. 
            Our processing pipeline will extract features and compute embeddings automatically.
          </p>
        </motion.div>

        {/* System Stats */}
        {systemStats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Current</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.totalRecipes}
              </div>
              <div className="text-sm text-gray-600">Total Recipes</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Upload className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Active</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.totalMolecules}
              </div>
              <div className="text-sm text-gray-600">Molecules</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Done</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.processedFiles}
              </div>
              <div className="text-sm text-gray-600">Files Processed</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <RefreshCw className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Ready</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {new Date(systemStats.lastUpdate).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">Last Update</div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <FileUploadCard
              title="Recipe Data Upload"
              description="Upload CSV files containing recipe data with ingredients, instructions, and cuisine information."
              acceptType=".csv"
              fileType="recipes"
              onUpload={handleFileUpload}
            />

            <FileUploadCard
              title="Molecular Data Upload"
              description="Upload JSON files containing molecular compound data and flavor profiles."
              acceptType=".json"
              fileType="molecules"
              onUpload={handleFileUpload}
            />

            {/* Upload Progress */}
            {files.length > 0 && (
              <UploadProgress />
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Upload Summary */}
            <UploadSummaryCard />

            {/* Recompute Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Operations
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleRecompute}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Recomputing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Recompute Embeddings
                    </>
                  )}
                </button>

                <button
                  onClick={clearFiles}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Upload Queue
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Recomputing embeddings may take several minutes depending on data size.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        {/* FoodScope API Integration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">FoodScope API Integration</h2>
                <p className="text-sm text-gray-500">Connect to FoodScope for ingredient compounds, flavor molecules & food pairings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Connection Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">API Connection</h3>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {apiStatus ? (
                    apiStatus.connected ? (
                      <Wifi className="w-5 h-5 text-blue-600" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-gray-400" />
                    )
                  ) : (
                    <WifiOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {apiStatus ? (apiStatus.connected ? 'Connected' : 'Not Connected') : 'Not Tested'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {apiStatus?.message || 'Click "Test Connection" to check API status'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={apiLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {apiLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Test Connection
                    </>
                  )}
                </button>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Setup:</strong> Add your FoodScope API credentials to <code className="bg-blue-100 px-1 rounded">.env.local</code>
                  </p>
                  <div className="mt-2 font-mono text-xs text-blue-700 space-y-1">
                    <p>NEXT_PUBLIC_FOODSCOPE_API_URL=https://api.foodscope.ai/v1</p>
                    <p>NEXT_PUBLIC_FOODSCOPE_API_KEY=your_api_key</p>
                  </div>
                </div>
              </div>

              {/* Ingredient Search */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ingredient Search</h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ingredientQuery}
                    onChange={(e) => setIngredientQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchIngredients()}
                    placeholder="Search ingredients (e.g. turmeric, basil)"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm"
                  />
                  <button
                    onClick={handleSearchIngredients}
                    disabled={apiLoading || !ingredientQuery.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                <div className="min-h-[120px] border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((item, i) => (
                        <div key={i} className="p-2 bg-white rounded border border-gray-100 text-sm">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-4">
                      <Search className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">
                        {apiStatus?.connected 
                          ? 'Search for ingredients to see compound data' 
                          : 'Connect the FoodScope API first to search ingredients'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['Fetch Compounds', 'Fetch Molecules', 'Fetch Pairings'].map((label) => (
                    <button
                      key={label}
                      disabled={!apiStatus?.connected}
                      className="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
