'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { 
  ChefHat, 
  User, 
  GraduationCap, 
  Shield, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Brain,
  BookOpen,
  Utensils,
  Microscope,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [isHovered, setIsHovered] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Determine role from email
    let role = 'student'; // default
    if (email.includes('chef')) role = 'chef';
    else if (email.includes('researcher')) role = 'researcher';
    else if (email.includes('admin')) role = 'admin';

    const success = await login(email, password, role);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const userTypes = [
    {
      icon: ChefHat,
      role: 'chef',
      email: 'chef@ccae.ai',
      title: 'Professional Chef',
      description: 'Access recipe adaptation tools and culinary analytics',
      gradient: 'from-orange-500 to-red-600',
      bgPattern: '🔥',
      features: ['Recipe Adaptation', 'Flavor Analysis', 'Menu Planning']
    },
    {
      icon: User,
      role: 'student',
      email: 'student@ccae.ai',
      title: 'Culinary Student',
      description: 'Learn about cross-cultural cuisine and food science',
      gradient: 'from-blue-500 to-purple-600',
      bgPattern: '📚',
      features: ['Interactive Learning', 'Recipe Database', 'Cultural Insights']
    },
    {
      icon: GraduationCap,
      role: 'researcher',
      email: 'researcher@ccae.ai',
      title: 'Food Researcher',
      description: 'Advanced computational cuisine research and analysis',
      gradient: 'from-green-500 to-teal-600',
      bgPattern: '🔬',
      features: ['Data Analysis', 'Pattern Recognition', 'Research Tools']
    },
    {
      icon: Shield,
      role: 'admin',
      email: 'admin@ccae.ai',
      title: 'System Admin',
      description: 'System administration and user management',
      gradient: 'from-purple-500 to-pink-600',
      bgPattern: '',
      features: ['User Management', 'System Health', 'Data Oversight']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -100, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0], 
            y: [0, 100, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Left Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
              />
              <Brain className="w-12 h-12 text-white relative z-10" />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/20 rounded-3xl"
              />
            </motion.div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Welcome to CCAE
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Computational Cuisine Adaptation Engine
            </motion.p>
          </motion.div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              {userTypes.map((userType, index) => (
                <motion.div
                  key={userType.role}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedRole(userType.role);
                    setEmail(userType.email);
                    setPassword('password');
                  }}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedRole === userType.role
                      ? 'bg-gradient-to-r ' + userType.gradient + ' text-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onMouseEnter={() => setIsHovered(userType.role)}
                  onMouseLeave={() => setIsHovered('')}
                >
                  <div className="text-2xl mb-2">{userType.bgPattern}</div>
                  <motion.div
                    animate={{ rotate: isHovered === userType.role ? [0, 10, -10, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <userType.icon className={`w-6 h-6 mb-2 ${selectedRole === userType.role ? 'text-white' : 'text-blue-600'}`} />
                  </motion.div>
                  <h3 className={`font-semibold text-sm ${selectedRole === userType.role ? 'text-white' : 'text-gray-900'}`}>
                    {userType.title}
                  </h3>
                  <AnimatePresence>
                    {isHovered === userType.role && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1"
                      >
                        {userType.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`text-xs ${selectedRole === userType.role ? 'text-white/90' : 'text-gray-600'}`}
                          >
                            • {feature}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-5"
          >
            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="relative"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                  placeholder={userTypes.find(u => u.role === selectedRole)?.email || "Enter your email"}
                  required
                />
              </div>
            </motion.div>

            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="relative"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden"
            >
              <motion.div
                animate={{ x: isLoading ? [0, 100] : 0 }}
                transition={{ repeat: isLoading ? Infinity : 0, duration: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </motion.button>
          </motion.form>

          {/* Demo Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <p className="text-sm font-semibold text-gray-700">Demo Access</p>
            </div>
            <p className="text-xs text-gray-600">Use password: <code className="bg-gray-100 px-2 py-1 rounded">password</code></p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Side - Visual Showcase */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 items-center justify-center p-8 relative overflow-hidden"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: Math.random() * 360 }}
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100]
              }}
              transition={{ 
                duration: 10 + Math.random() * 10, 
                repeat: Infinity, 
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
              className="absolute bg-white/10 rounded-full backdrop-blur-sm"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center text-white relative z-10 max-w-lg"
        >
          <motion.div
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative"
          >
            <motion.div
              animate={{ 
                rotate: [0, -360],
                scale: [1, 0.8, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"
            />
            <Brain className="w-16 h-16 text-white relative z-10" />
          </motion.div>

          <motion.h2 
            className="text-5xl font-bold mb-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Computational
            <motion.span 
              className="block text-yellow-300"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Cuisine
            </motion.span>
          </motion.h2>

          <motion.p 
            className="text-xl opacity-90 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Where tradition meets innovation through AI-powered recipe adaptation
          </motion.p>

          <motion.div 
            className="grid grid-cols-2 gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Utensils className="w-10 h-10 mb-3 mx-auto text-yellow-300" />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">Chef Tools</h3>
              <p className="text-sm opacity-80">Professional recipe adaptation</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Microscope className="w-10 h-10 mb-3 mx-auto text-yellow-300" />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">Research</h3>
              <p className="text-sm opacity-80">Advanced food science analysis</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 flex items-center justify-center gap-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-yellow-300">50K+</div>
              <div className="text-sm opacity-80">Recipes</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-yellow-300">100+</div>
              <div className="text-sm opacity-80">Cuisines</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-yellow-300">95%</div>
              <div className="text-sm opacity-80">Accuracy</div>
            </motion.div>
          </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
