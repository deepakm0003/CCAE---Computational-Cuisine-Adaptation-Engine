'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap, Settings } from 'lucide-react';

const IntensitySlider = () => {
  const [intensity, setIntensity] = useState(50);
  const [preserveIdentity, setPreserveIdentity] = useState(true);
  const [optimizeCompatibility, setOptimizeCompatibility] = useState(true);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('adaptationIntensity', intensity.toString());
    localStorage.setItem('preserveIdentity', preserveIdentity.toString());
    localStorage.setItem('optimizeCompatibility', optimizeCompatibility.toString());
  }, [intensity, preserveIdentity, optimizeCompatibility]);

  const getIntensityColor = (value: number) => {
    if (value < 33) return 'bg-blue-500';
    if (value < 66) return 'bg-blue-500';
    return 'bg-blue-500';
  };

  const getIntensityLabel = (value: number) => {
    if (value < 33) return 'Gentle';
    if (value < 66) return 'Moderate';
    return 'Intensive';
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-blue-600" />
        Adaptation Intensity
      </h3>

      {/* Intensity Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Intensity Level
          </label>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getIntensityColor(intensity)}`}>
            {getIntensityLabel(intensity)}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div
            className={`absolute top-0 left-0 h-2 rounded-lg ${getIntensityColor(intensity)}`}
            style={{ width: `${intensity}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Gentle</span>
          <span>Moderate</span>
          <span>Intensive</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Preserve Identity
            </label>
            <p className="text-xs text-gray-500">
              Maintain core culinary characteristics
            </p>
          </div>
          <button
            onClick={() => setPreserveIdentity(!preserveIdentity)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preserveIdentity ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preserveIdentity ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Optimize Compatibility
            </label>
            <p className="text-xs text-gray-500">
              Enhance cross-cultural appeal
            </p>
          </div>
          <button
            onClick={() => setOptimizeCompatibility(!optimizeCompatibility)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              optimizeCompatibility ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                optimizeCompatibility ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Settings className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">
              Adaptation Settings
            </p>
            <p className="text-xs text-blue-700">
              Current intensity: {intensity}% - {getIntensityLabel(intensity)} adaptation with{' '}
              {preserveIdentity ? 'identity preservation' : 'flexible transformation'} and{' '}
              {optimizeCompatibility ? 'compatibility optimization' : 'authentic focus'}.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IntensitySlider;
