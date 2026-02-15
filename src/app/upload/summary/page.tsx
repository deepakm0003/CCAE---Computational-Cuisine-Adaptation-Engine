'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CheckCircle, FileText, Download, ArrowLeft, BarChart3, AlertTriangle } from 'lucide-react';
import { useDataUploadStore } from '@/store/dataUploadStore';
import ccaeApi, { handleApiError } from '@/lib/api';

export default function UploadSummaryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { files, summary: uploadSummary } = useDataUploadStore();
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    // Fetch current database statistics
    const fetchStats = async () => {
      try {
        const health = await ccaeApi.getHealth();
        setDbStats({
          totalRecipes: health.stats.recipes || 0,
          totalCuisines: health.stats.cuisines || 0,
          totalIngredients: health.stats.ingredients || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, [user, isLoading, router]);

  // Use real data from upload store
  const summary = {
    totalFiles: uploadSummary.totalFiles,
    successfulUploads: uploadSummary.completedFiles,
    failedUploads: uploadSummary.failedFiles,
    totalSize: `${(uploadSummary.totalSize / (1024 * 1024)).toFixed(2)} MB`,
    processingTime: 'Completed',
    files: files.map(f => ({
      name: f.name,
      status: f.status === 'completed' ? 'success' : f.status === 'error' ? 'failed' : 'pending',
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      records: 'N/A',
      error: f.error
    }))
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading summary...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/data-upload')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Data Upload
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Summary
          </h1>
          <p className="text-gray-600">
            Complete overview of your recent data upload session
          </p>
        </motion.div>

        {summary && (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Complete</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.totalFiles}
                </div>
                <div className="text-sm text-gray-600">Total Files</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Success</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.successfulUploads}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Failed</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.failedUploads}
                </div>
                <div className="text-sm text-gray-600">Failed Uploads</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Download className="w-8 h-8 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Size</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.totalSize}
                </div>
                <div className="text-sm text-gray-600">Total Size</div>
              </div>
            </motion.div>

            {/* File Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">File Details</h2>
              
              <div className="space-y-4">
                {summary.files.map((file: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          file.status === 'success' ? 'bg-blue-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {file.status === 'success' ? (
                          <div>
                            <span className="text-sm text-blue-600 font-medium">Success</span>
                            <p className="text-xs text-gray-500">{file.records} records</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-sm text-blue-600 font-medium">Failed</span>
                            <p className="text-xs text-gray-500">{file.error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Processing Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Processing Time</p>
                  <p className="text-lg font-medium text-gray-900">{summary.processingTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                  <p className="text-lg font-medium text-gray-900">
                    {Math.round((summary.successfulUploads / summary.totalFiles) * 100)}%
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
