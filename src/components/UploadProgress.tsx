'use client';

import { motion } from 'framer-motion';
import { useDataUploadStore } from '@/store/dataUploadStore';
import { X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const UploadProgress = () => {
  const { files, removeFile } = useDataUploadStore();

  if (files.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      case 'uploading':
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
      
      <div className="space-y-3">
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            {getStatusIcon(file.status)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{formatFileSize(file.size)}</span>
                <span className="capitalize">{file.type}</span>
              </div>
              
              {file.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
              )}
              
              {file.status === 'error' && file.error && (
                <p className="text-xs text-blue-600">{file.error}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UploadProgress;
