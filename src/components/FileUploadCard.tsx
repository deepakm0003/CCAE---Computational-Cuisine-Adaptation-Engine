'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Upload, FileText, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface FileUploadCardProps {
  title: string;
  description: string;
  acceptType: string;
  fileType: 'recipes' | 'molecules';
  onUpload: (file: File, type: 'recipes' | 'molecules') => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  title,
  description,
  acceptType,
  fileType,
  onUpload
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (fileType === 'recipes' && !file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setErrorMessage('Please upload a CSV file for recipe data');
      return;
    }
    
    if (fileType === 'molecules' && !file.name.endsWith('.json')) {
      setUploadStatus('error');
      setErrorMessage('Please upload a JSON file for molecular data');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setErrorMessage('File size must be less than 10MB');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUpload(file, fileType);
      setUploadStatus('success');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
      
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Upload failed. Please try again.');
    }
  };

  const getIcon = () => {
    switch (fileType) {
      case 'recipes':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'molecules':
        return <Database className="w-8 h-8 text-blue-600" />;
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        {getIcon()}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : uploadStatus === 'error'
            ? 'border-blue-300 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptType}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadStatus === 'idle' && (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop your file here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">
              {acceptType === '.csv' ? 'CSV files up to 10MB' : 'JSON files up to 10MB'}
            </p>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <div className="space-y-4">
            {getStatusIcon()}
            <p className="text-gray-600">Uploading file...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="space-y-4">
            {getStatusIcon()}
            <p className="text-blue-600 font-medium">File uploaded successfully!</p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="space-y-4">
            {getStatusIcon()}
            <p className="text-blue-600 font-medium">{errorMessage}</p>
            <button
              onClick={() => {
                setUploadStatus('idle');
                setErrorMessage('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FileUploadCard;
