'use client';

import { motion } from 'framer-motion';
import { Brain, Globe, Zap, Shield, BarChart3, Database } from 'lucide-react';

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
    color: 'blue'
  },
  {
    icon: Zap,
    title: 'Real-Time Processing',
    description: 'Lightning-fast computation of adaptation possibilities with real-time feedback and confidence scores.',
    color: 'blue'
  },
  {
    icon: Shield,
    title: 'Identity Preservation',
    description: 'Sophisticated algorithms ensure that the core identity and cultural significance of recipes are maintained during adaptation.',
    color: 'blue'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed metrics and insights on adaptation success rates, compatibility scores, and culinary patterns.',
    color: 'blue'
  },
  {
    icon: Database,
    title: 'Comprehensive Database',
    description: 'Extensive database of ingredients, flavor compounds, and culinary techniques from diverse cultural traditions.',
    color: 'blue'
  }
];

const getColorClasses = (color: string) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-blue-100 text-blue-600',
    yellow: 'bg-blue-100 text-blue-600',
    purple: 'bg-blue-100 text-blue-600',
    orange: 'bg-blue-100 text-blue-600',
    red: 'bg-blue-100 text-blue-600'
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

export default function FeatureSection() {
  return (
    <section className="py-24 bg-[#FAFBFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Culinary Innovation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the cutting-edge capabilities that make CCAE the leading platform 
            for computational cuisine adaptation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${getColorClasses(feature.color)}`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
