'use client';

import { motion } from 'framer-motion';
import { Target, Zap, Users, Database } from 'lucide-react';

const stats = [
  {
    icon: Target,
    value: '95%+',
    label: 'Accuracy Rate',
    description: 'Precise flavor prediction and adaptation'
  },
  {
    icon: Zap,
    value: '< 1s',
    label: 'Processing Time',
    description: 'Lightning-fast recipe analysis'
  },
  {
    icon: Users,
    value: '50+',
    label: 'Cuisines Supported',
    description: 'Global culinary traditions'
  },
  {
    icon: Database,
    value: '10K+',
    label: 'Ingredients',
    description: 'Comprehensive flavor database'
  }
];

export default function StatsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Culinary Professionals Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform delivers exceptional results through advanced AI technology 
            and comprehensive culinary research
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {stat.label}
              </div>
              <p className="text-gray-600">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
