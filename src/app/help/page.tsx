'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, ExternalLink, Video, FileText, Code } from 'lucide-react';
import { ReactNode } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface GuideItem {
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  type: 'video' | 'article' | 'code';
}

export default function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs: FAQItem[] = [
    {
      question: "How do I start adapting recipes?",
      answer: "Navigate to the Adapt page, select a recipe from the dropdown, choose your target cuisine, adjust the intensity slider, and click 'Start Adaptation'. The AI will analyze and transform your recipe while preserving its core identity."
    },
    {
      question: "What is the Flavor Map?",
      answer: "The Flavor Map is an interactive visualization that shows relationships between different cuisines based on their molecular profiles and cultural patterns. Click on any cuisine to see detailed information about its flavor characteristics."
    },
    {
      question: "How accurate are the adaptations?",
      answer: "Our AI system has a 95%+ accuracy rate in flavor prediction. The adaptations preserve the core identity of recipes while making them compatible with the target cuisine's ingredients and cooking techniques."
    },
    {
      question: "Can I upload my own recipes?",
      answer: "Yes! Admin users can upload recipe data through the Data Upload page. The system supports CSV files for recipes and JSON files for molecular data."
    },
    {
      question: "What do the different user roles mean?",
      answer: "Chefs can create and adapt recipes, Students can learn and explore, Researchers can access advanced analytics, and Admins can manage the system and upload data."
    }
  ];

  const guides: GuideItem[] = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of CCAE and how to navigate the platform",
      icon: <BookOpen className="w-5 h-5" />,
      link: "#",
      type: 'article'
    },
    {
      title: "Recipe Adaptation Tutorial",
      description: "Step-by-step video tutorial on adapting your first recipe",
      icon: <Video className="w-5 h-5" />,
      link: "#",
      type: 'video'
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers and researchers",
      icon: <Code className="w-5 h-5" />,
      link: "#",
      type: 'code'
    },
    {
      title: "Understanding Flavor Profiles",
      description: "Deep dive into the science behind our flavor analysis",
      icon: <FileText className="w-5 h-5" />,
      link: "#",
      type: 'article'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help & Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about the Computational Cuisine Adaptation Engine
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Quick Guides */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <motion.a
                key={index}
                href={guide.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    guide.type === 'video' ? 'bg-blue-100 text-blue-600' :
                    guide.type === 'code' ? 'bg-blue-100 text-blue-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {guide.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{guide.description}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <span className="capitalize">{guide.type}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No results found for "{searchTerm}"</p>
            </div>
          )}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our support team is here to help you make the most of CCAE. Reach out if you have questions or need assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Contact Support
            </button>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors font-medium">
              Join Community
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
