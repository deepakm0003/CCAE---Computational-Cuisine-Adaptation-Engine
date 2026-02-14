'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Database, Upload, RefreshCw, CheckCircle, X } from 'lucide-react';
import { useDataUploadStore } from '@/store/dataUploadStore';
import FileUploadCard from '@/components/FileUploadCard';
import UploadProgress from '@/components/UploadProgress';
import UploadSummaryCard from '@/components/UploadSummaryCard';

export default function DataUploadPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { files, summary, isUploading, clearFiles, setUploading } = useDataUploadStore();
  const [systemStats, setSystemStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchSystemStats();
  }, [user, isLoading, router]);

  const fetchSystemStats = async () => {
    try {
      // Mock API call - replace with real API
      const mockStats = {
        totalRecipes: 1250,
        totalMolecules: 850,
        processedFiles: 45,
        lastUpdate: new Date().toISOString()
      };
      setSystemStats(mockStats);
    } catch (err) {
      console.error('Failed to fetch system stats:', err);
      setError('Failed to load system statistics');
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
                <span className="text-sm text-green-600 font-medium">Current</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.totalRecipes}
              </div>
              <div className="text-sm text-gray-600">Total Recipes</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Upload className="w-8 h-8 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.totalMolecules}
              </div>
              <div className="text-sm text-gray-600">Molecules</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-green-600 font-medium">Done</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.processedFiles}
              </div>
              <div className="text-sm text-gray-600">Files Processed</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <RefreshCw className="w-8 h-8 text-orange-600" />
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
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
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
      </div>
    </div>
  );
}
