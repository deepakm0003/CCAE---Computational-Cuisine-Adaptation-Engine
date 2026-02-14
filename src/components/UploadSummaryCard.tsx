'use client';

import { motion } from 'framer-motion';
import { useDataUploadStore } from '@/store/dataUploadStore';
import { Database, Upload, CheckCircle, Clock } from 'lucide-react';

const UploadSummaryCard = () => {
  const { summary, files } = useDataUploadStore();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressPercentage = () => {
    if (summary.totalSize === 0) return 0;
    return (summary.uploadedSize / summary.totalSize) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Summary</h3>
      
      <div className="space-y-4">
        {/* Total Files */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Total Files</span>
          </div>
          <span className="font-medium text-gray-900">{summary.totalFiles}</span>
        </div>

        {/* Completed Files */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <span className="font-medium text-green-600">{summary.completedFiles}</span>
        </div>

        {/* Failed Files */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-600">Failed</span>
          </div>
          <span className="font-medium text-red-600">{summary.failedFiles}</span>
        </div>

        {/* Size Progress */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Size Progress</span>
            </div>
            <span className="text-sm text-gray-900">
              {formatFileSize(summary.uploadedSize)} / {formatFileSize(summary.totalSize)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          <div className="text-center mt-2">
            <span className="text-sm font-medium text-gray-900">
              {getProgressPercentage().toFixed(1)}%
            </span>
          </div>
        </div>

        {/* File Types */}
        {files.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">File Types</div>
            <div className="space-y-1">
              {Array.from(new Set(files.map(f => f.type))).map(type => {
                const count = files.filter(f => f.type === type).length;
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-600">{type}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UploadSummaryCard;
