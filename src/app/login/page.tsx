'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ChefHat, User, GraduationCap, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
      description: 'Access recipe adaptation tools and culinary analytics'
    },
    {
      icon: User,
      role: 'student',
      email: 'student@ccae.ai',
      title: 'Student',
      description: 'Learn about cross-cultural cuisine and food science'
    },
    {
      icon: GraduationCap,
      role: 'researcher',
      email: 'researcher@ccae.ai',
      title: 'Researcher',
      description: 'Access advanced analytics and research tools'
    },
    {
      icon: Shield,
      role: 'admin',
      email: 'admin@ccae.ai',
      title: 'Administrator',
      description: 'Full system access and user management'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex">
      {/* Left Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to CCAE
            </h1>
            <p className="text-gray-600">
              Computational Cuisine Adaptation Engine
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </motion.form>
        </div>
      </motion.div>

      {/* Right Side - User Types */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-8">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-full flex flex-col justify-center"
        >
          <div className="text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">Choose Your Role</h2>
            <p className="text-blue-100">
              Select a demo account below to explore different features and capabilities
            </p>
          </div>

          <div className="space-y-4">
            {userTypes.map((userType, index) => (
              <motion.div
                key={userType.role}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => {
                  setEmail(userType.email);
                  setPassword(userType.role + '123');
                }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <userType.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {userType.title}
                    </h3>
                    <p className="text-sm text-blue-100 mb-2">
                      {userType.description}
                    </p>
                    <div className="text-xs text-blue-200 font-mono">
                      {userType.email}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-white text-sm">
            <p className="mb-2">Demo Passwords:</p>
            <div className="space-y-1 font-mono text-xs text-blue-100">
              <div>chef@ccae.ai → chef123</div>
              <div>student@ccae.ai → student123</div>
              <div>researcher@ccae.ai → research123</div>
              <div>admin@ccae.ai → admin123</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
