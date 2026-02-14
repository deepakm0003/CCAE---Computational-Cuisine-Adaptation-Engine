'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Globe, Shield, BarChart3, Settings, Play, Eye, Database } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Adaptation',
      description: 'Advanced machine learning algorithms analyze recipes and suggest optimal ingredient substitutions while preserving flavor profiles.',
      color: 'blue'
    },
    {
      icon: Globe,
      title: 'Cross-Cultural Analysis',
      description: 'Comprehensive analysis of culinary traditions from around the world, enabling authentic cross-cultural recipe transformations.',
      color: 'green'
    },
    {
      icon: Zap,
      title: 'Real-Time Processing',
      description: 'Lightning-fast computation of adaptation possibilities with real-time feedback and confidence scores.',
      color: 'yellow'
    },
    {
      icon: Shield,
      title: 'Identity Preservation',
      description: 'Sophisticated algorithms ensure that the core identity and cultural significance of recipes are maintained during adaptation.',
      color: 'purple'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed metrics and insights on adaptation success rates, compatibility scores, and culinary patterns.',
      color: 'orange'
    },
    {
      icon: Database,
      title: 'Comprehensive Database',
      description: 'Extensive database of ingredients, flavor compounds, and culinary techniques from diverse cultural traditions.',
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Features & Capabilities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the powerful features that make CCAE the leading platform for computational cuisine adaptation
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${getColorClasses(feature.color)}`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Core Technologies
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Machine Learning adaptation engines</li>
                <li>• Molecular flavor analysis</li>
                <li>• Natural language processing</li>
                <li>• Graph neural networks</li>
                <li>• Real-time data processing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Performance Metrics
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Sub-second adaptation processing</li>
                <li>• 95%+ accuracy in flavor prediction</li>
                <li>• Support for 50+ cuisine types</li>
                <li>• 10,000+ ingredient database</li>
                <li>• Real-time collaboration features</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* User Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Experience</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Eye className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Intuitive Interface</h3>
              <p className="text-gray-600 text-sm">
                Clean, modern design with guided workflows for seamless navigation
              </p>
            </div>
            
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Feedback</h3>
              <p className="text-gray-600 text-sm">
                Instant visual feedback and confidence scores for all adaptations
              </p>
            </div>
            
            <div className="text-center">
              <Globe className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Language Support</h3>
              <p className="text-gray-600 text-sm">
                Available in multiple languages with cultural context awareness
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
