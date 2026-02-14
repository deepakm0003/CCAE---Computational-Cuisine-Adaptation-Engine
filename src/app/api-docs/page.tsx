'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  example?: string;
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/recipes',
    description: 'Get all available recipes',
    parameters: [
      { name: 'cuisine', type: 'string', required: false, description: 'Filter by cuisine type' },
      { name: 'limit', type: 'integer', required: false, description: 'Number of results to return' }
    ],
    example: `GET /api/v1/recipes?cuisine=italian&limit=10`
  },
  {
    method: 'POST',
    path: '/api/v1/adapt',
    description: 'Adapt a recipe to a different cuisine',
    parameters: [
      { name: 'recipe_id', type: 'string', required: true, description: 'ID of the recipe to adapt' },
      { name: 'target_cuisine', type: 'string', required: true, description: 'Target cuisine type' },
      { name: 'replacement_ratio', type: 'number', required: false, description: 'Ingredient replacement ratio (0-1)' }
    ],
    example: `POST /api/v1/adapt
{
  "recipe_id": "rec_123",
  "target_cuisine": "japanese",
  "replacement_ratio": 0.7
}`
  },
  {
    method: 'GET',
    path: '/api/v1/flavor-map',
    description: 'Get flavor map data for visualization',
    example: `GET /api/v1/flavor-map`
  },
  {
    method: 'POST',
    path: '/api/v1/preview-compatibility',
    description: 'Preview compatibility between cuisines',
    parameters: [
      { name: 'recipe_id', type: 'string', required: true, description: 'Recipe ID' },
      { name: 'source_cuisine', type: 'string', required: true, description: 'Source cuisine' },
      { name: 'target_cuisine', type: 'string', required: true, description: 'Target cuisine' }
    ],
    example: `POST /api/v1/preview-compatibility
{
  "recipe_id": "rec_123",
  "source_cuisine": "italian",
  "target_cuisine": "japanese"
}`
  }
];

export default function APIDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete API reference for the Computational Cuisine Adaptation Engine
          </p>
        </motion.div>

        {/* Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">API Key Required</p>
                <p className="text-gray-600">Include your API key in the request headers</p>
              </div>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <div>Authorization: Bearer YOUR_API_KEY</div>
              <div>X-API-Key: YOUR_API_KEY</div>
            </div>
          </div>
        </motion.div>

        {/* Base URL */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Base URL</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
            https://api.ccae.ai/v1
          </div>
        </motion.div>

        {/* Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Endpoints</h2>
          <div className="space-y-6">
            {apiEndpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{endpoint.description}</p>

                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param) => (
                        <div key={param.name} className="flex items-center gap-4 text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                          <span className="text-gray-500">{param.type}</span>
                          {param.required && <span className="text-blue-600">required</span>}
                          <span className="text-gray-600">{param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {endpoint.example && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Example</h4>
                      <button
                        onClick={() => copyToClipboard(endpoint.example!, endpoint.path)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {copiedCode === endpoint.path ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copiedCode === endpoint.path ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{endpoint.example}</pre>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rate Limits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-blue-50 rounded-2xl p-8 mt-8"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Rate Limits</h3>
              <p className="text-blue-800">
                API requests are limited to 1000 requests per hour per API key. 
                Contact support for higher limits.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
