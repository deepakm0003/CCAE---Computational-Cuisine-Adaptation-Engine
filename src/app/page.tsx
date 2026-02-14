'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import ccaeApi, { handleApiError } from '@/lib/api';
import { 
  Brain, 
  Globe, 
  Zap, 
  Shield, 
  BarChart3, 
  Database,
  ChefHat,
  GraduationCap,
  Users,
  Target,
  Clock,
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Github,
  Twitter,
  Linkedin,
  Mail,
  CheckCircle,
  X,
  Menu
} from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // All useState hooks must be declared first
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [stats, setStats] = useState([
    { label: 'Cuisines', value: 0, icon: Globe, color: 'from-blue-500 to-purple-600' },
    { label: 'Recipes', value: 0, icon: ChefHat, color: 'from-green-500 to-teal-600' },
    { label: 'Ingredients', value: 0, icon: Database, color: 'from-orange-500 to-red-600' },
    { label: 'Adaptations', value: 0, icon: Brain, color: 'from-purple-500 to-pink-600' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Other hooks after useState
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 40 });
  const translateY = useTransform(smoothProgress, [0, 1], [0, -50]);

  useEffect(() => {
    if (user) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [user]);

  // Fetch real stats from backend - moved outside useEffect
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const healthData = await ccaeApi.getHealth();
      
      setStats([
        {
          label: 'Cuisines',
          value: healthData.stats.cuisines,
          icon: Globe,
          color: 'from-blue-500 to-purple-600'
        },
        {
          label: 'Recipes',
          value: healthData.stats.recipes,
          icon: ChefHat,
          color: 'from-green-500 to-teal-600'
        },
        {
          label: 'Ingredients',
          value: healthData.stats.ingredients,
          icon: Database,
          color: 'from-orange-500 to-red-600'
        },
        {
          label: 'Status',
          value: healthData.status === 'healthy' ? 1 : 0,
          icon: Brain,
          color: 'from-purple-500 to-pink-600'
        }
      ]);
      
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      fetchStats();
    }
  }, [user, isLoading]);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CCAE...</p>
        </div>
      </div>
    );
  }

  const handleProtectedAction = () => {
    if (user) {
      router.push(`/dashboard/${user.role}`);
    } else {
      router.push('/login');
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Adaptation',
      description: 'Advanced machine learning algorithms analyze recipes and suggest optimal ingredient substitutions while preserving flavor profiles.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Globe,
      title: 'Cross-Cultural Analysis',
      description: 'Comprehensive analysis of culinary traditions from around the world, enabling authentic cross-cultural recipe transformations.',
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: Zap,
      title: 'Real-Time Processing',
      description: 'Lightning-fast computation of adaptation possibilities with real-time feedback and confidence scores.',
      color: 'from-blue-400 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Identity Preservation',
      description: 'Sophisticated algorithms ensure that the core identity and cultural significance of recipes are maintained during adaptation.',
      color: 'from-blue-700 to-blue-800'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed metrics and insights on adaptation success rates, compatibility scores, and culinary patterns.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Database,
      title: 'Comprehensive Database',
      description: 'Extensive database of ingredients, flavor compounds, and culinary techniques from diverse cultural traditions.',
      color: 'from-blue-600 to-blue-700'
    }
  ];

  const userTypes = [
    {
      icon: ChefHat,
      title: 'Professional Chefs',
      description: 'Create innovative cross-cultural recipes with AI-powered adaptation tools',
      features: ['Recipe Adaptation', 'Flavor Analysis', 'Menu Planning'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: GraduationCap,
      title: 'Students',
      description: 'Learn about cross-cultural cuisine and food science through interactive courses',
      features: ['Interactive Learning', 'Recipe Exploration', 'Progress Tracking'],
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: Brain,
      title: 'Researchers',
      description: 'Access advanced analytics and research tools for culinary innovation',
      features: ['Data Analysis', 'Research Tools', 'Publication Support'],
      color: 'from-blue-400 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Administrators',
      description: 'Manage system settings and monitor performance with comprehensive tools',
      features: ['System Management', 'User Administration', 'Performance Monitoring'],
      color: 'from-blue-700 to-blue-800'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX: smoothProgress }}
      />
      
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-gray-200"
        style={{ translateY }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">CCAE</h1>
                <p className="text-xs text-gray-500">Computational Cuisine Adaptation Engine</p>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {[
                { name: 'Features', id: 'features' },
                { name: 'Overview', id: 'overview' },
                { name: 'Statistics', id: 'stats' }
              ].map((item) => (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className="text-gray-600 hover:text-blue-600 transition-colors relative group"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}
              {user ? (
                <motion.button
                  onClick={() => router.push(`/dashboard/${user.role}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              )}
            </div>

            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-6 py-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#overview" className="block text-gray-600 hover:text-gray-900">Overview</a>
              <a href="#stats" className="block text-gray-600 hover:text-gray-900">Statistics</a>
              {user ? (
                <button
                  onClick={() => router.push(`/dashboard/${user.role}`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* User Notification */}
      {showNotification && user && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 right-6 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Welcome back, {user.name}!</p>
              <p className="text-sm text-blue-700">You are logged in as a {user.role}</p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section id="hero" className="relative pt-24 pb-20 px-6 lg:px-8 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-50"></div>
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div 
            className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              scale: [1, 0.9, 1],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-gray-900"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                {["Computational", "Cuisine Adaptation", "Engine"].map((word, index) => (
                  <motion.span
                    key={word}
                    className={index === 1 ? "block text-blue-600" : "block"}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl mb-12 text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Harness the power of AI to bridge culinary traditions across cultures. 
                Transform recipes while preserving their authentic essence through advanced 
                molecular analysis and machine learning.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleProtectedAction}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  >
                    <Play className="w-5 h-5" />
                  </motion.div>
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#1e40af", color: "#ffffff" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-transparent border-2 border-blue-600 text-blue-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-3"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Chef Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <motion.div
                className="relative z-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-8 shadow-2xl"
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="w-full h-110 bg-gray-200 rounded-2xl overflow-hidden">
                  <img 
                    src="/chef.png" 
                    alt="Professional Chef"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1,
                }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Feature Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {[
              { icon: Brain, title: 'AI-Powered', desc: 'Advanced machine learning for precise recipe adaptation' },
              { icon: Globe, title: 'Cross-Cultural', desc: 'Bridge culinary traditions across 50+ cuisines' },
              { icon: Zap, title: 'Real-Time', desc: 'Instant processing with live preview capabilities' }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  scale: 1.02
                }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm cursor-pointer"
              >
                <motion.div 
                  className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <item.icon className="w-8 h-8 text-blue-600" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Powerful Features for
              <motion.span 
                className="text-blue-600"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {" "}Culinary Innovation
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              Discover the cutting-edge capabilities that make CCAE the leading platform 
              for computational cuisine adaptation
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.03,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 h-full hover:shadow-2xl transition-all duration-300">
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                    whileHover={{ 
                      scale: 1.2, 
                      rotate: [0, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 bg-gray-50 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Live System Statistics
              <motion.span 
                className="text-blue-600"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {" "}Real-time Data
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              Real-time statistics from our computational cuisine adaptation engine
            </motion.p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-700">⚠️ {error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ 
                  delay: index * 0.1 + 0.3, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="text-center"
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ 
                    rotate: 360,
                    scale: 1.1,
                    transition: { duration: 0.6 }
                  }}
                >
                  <stat.icon className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div 
                  className="text-5xl font-bold text-gray-900 mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {stat.label === 'Status' ? (stat.value === 1 ? 'Healthy' : 'Warning') : stat.value}
                </motion.div>
                <div className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</div>
                <p className="text-gray-600">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="overview" className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Designed for Every
              <span className="text-blue-600">
                {" "}Culinary Professional
              </span>
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
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${userType.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <userType.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{userType.title}</h3>
                  <p className="text-gray-600 mb-6">{userType.description}</p>
                  <ul className="space-y-2 mb-6">
                    {userType.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleProtectedAction}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your
                <span className="text-blue-200">
                  {" "}Culinary Journey?
                </span>
              </h2>
              <p className="text-xl lg:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
                Join thousands of chefs, students, and researchers who are already 
                revolutionizing cross-cultural cuisine with CCAE
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleProtectedAction}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                {[
                  { value: '10K+', label: 'Active Users' },
                  { value: '50K+', label: 'Recipes Adapted' },
                  { value: '95%', label: 'Success Rate' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-blue-100">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">CCAE</h3>
                  <p className="text-gray-400 text-sm">Computational Cuisine Adaptation Engine</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Bridging culinary traditions through AI-powered analysis and adaptation. 
                Transform recipes while preserving their authentic essence.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Twitter, href: '#' },
                  { icon: Linkedin, href: '#' },
                  { icon: Github, href: '#' },
                  { icon: Mail, href: '#' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Use Cases', 'API'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'Tutorials', 'Community', 'Support'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2026 CCAE. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm">
                Made with ❤️ for culinary innovation
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
