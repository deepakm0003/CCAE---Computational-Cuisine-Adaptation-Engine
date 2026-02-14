'use client';

import { motion } from 'framer-motion';
import { Brain, Globe, Users, Target, Award, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About CCAE
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Computational Cuisine Adaptation Engine - Bridging culinary traditions through AI-powered analysis
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            The Computational Cuisine Adaptation Engine (CCAE) leverages cutting-edge machine learning and molecular analysis 
            to enable seamless cross-cultural recipe adaptation while preserving culinary identity. Our mission is to break down 
            cultural barriers through food, allowing recipes to travel across borders while maintaining their authentic essence.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Advanced machine learning algorithms analyze molecular structures and culinary patterns
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cultural Bridge</h3>
            <p className="text-gray-600">
              Connect diverse culinary traditions while respecting cultural authenticity
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaborative Platform</h3>
            <p className="text-gray-600">
              Empower chefs, researchers, and food enthusiasts to explore culinary possibilities
            </p>
          </div>
        </motion.div>

        {/* Research */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Research Foundation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Molecular Gastronomy</h3>
              <p className="text-gray-600">
                Deep analysis of flavor compounds and their interactions across different cuisines
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cultural Anthropology</h3>
              <p className="text-gray-600">
                Understanding the cultural significance and traditional cooking methods
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Computational Linguistics</h3>
              <p className="text-gray-600">
                Processing recipe descriptions and cooking instructions across languages
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Food Science</h3>
              <p className="text-gray-600">
                Chemical reactions and cooking techniques that define culinary outcomes
              </p>
            </div>
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Our Team</h2>
          </div>
          <p className="text-gray-600 mb-6">
            CCAE is developed by a multidisciplinary team of researchers, chefs, data scientists, and food technologists 
            dedicated to advancing culinary innovation through technology.
          </p>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2026 Computational Cuisine Adaptation Engine. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
