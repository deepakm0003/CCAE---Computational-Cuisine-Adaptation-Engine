'use client';

import { motion } from 'framer-motion';
import { Brain, ChefHat, GraduationCap, Shield, ArrowRight } from 'lucide-react';

const userTypes = [
  {
    icon: ChefHat,
    title: 'Professional Chefs',
    description: 'Create innovative cross-cultural recipes with AI-powered adaptation tools',
    features: ['Recipe Adaptation', 'Flavor Analysis', 'Menu Planning'],
    color: 'blue'
  },
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Learn about cross-cultural cuisine and food science through interactive courses',
    features: ['Interactive Learning', 'Recipe Exploration', 'Progress Tracking'],
    color: 'blue'
  },
  {
    icon: Brain,
    title: 'Researchers',
    description: 'Access advanced analytics and research tools for culinary innovation',
    features: ['Data Analysis', 'Research Tools', 'Publication Support'],
    color: 'blue'
  },
  {
    icon: Shield,
    title: 'Administrators',
    description: 'Manage system settings and monitor performance with comprehensive tools',
    features: ['System Management', 'User Administration', 'Performance Monitoring'],
    color: 'red'
  }
];

const getColorClasses = (color: string) => {
  const colors = {
    orange: 'bg-blue-100 text-blue-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-blue-100 text-blue-600',
    red: 'bg-blue-100 text-blue-600'
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

export default function SystemOverview() {
  return (
    <section className="py-24 bg-[#FAFBFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Designed for Every Culinary Professional
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're a chef, student, researcher, or administrator, CCAE provides 
            tailored tools to meet your specific needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {userTypes.map((userType, index) => (
            <motion.div
              key={userType.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${getColorClasses(userType.color)}`}>
                <userType.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {userType.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {userType.description}
              </p>
              <ul className="space-y-2 mb-6">
                {userType.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
