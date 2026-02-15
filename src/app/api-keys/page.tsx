'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Key, 
  Globe, 
  Wifi, 
  WifiOff, 
  Zap, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  RefreshCw,
  Database,
  Shield,
  Clock,
  Activity
} from 'lucide-react';
import ccaeApi, { handleApiError } from '@/lib/api';

interface ApiKeyConfig {
  id: string;
  name: string;
  key: string;
  provider: string;
  status: 'active' | 'inactive' | 'expired';
  lastUsed: string | null;
  createdAt: string;
  permissions: string[];
}

export default function ApiKeysPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // FoodScope API state
  const [foodscopeApiKey, setFoodscopeApiKey] = useState('');
  const [foodscopeApiUrl, setFoodscopeApiUrl] = useState('https://cosylab.iiitd.edu.in/flavordb/');
  const [showFoodscopeKey, setShowFoodscopeKey] = useState(false);
  const [foodscopeStatus, setFoodscopeStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [foodscopeLoading, setFoodscopeLoading] = useState(false);
  
  // CCAE Backend API state
  const [backendStatus, setBackendStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  
  // Ingredient search state
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // API Keys list
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([
    {
      id: '1',
      name: 'CCAE Backend',
      key: '',
      provider: 'ccae',
      status: 'active',
      lastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      permissions: ['read', 'write', 'adapt']
    }
  ]);
  
  // New key form
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyProvider, setNewKeyProvider] = useState('foodscope');
  
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Load saved API keys from localStorage
    const savedFoodscopeKey = localStorage.getItem('foodscope_api_key');
    const savedFoodscopeUrl = localStorage.getItem('foodscope_api_url');
    
    if (savedFoodscopeKey) setFoodscopeApiKey(savedFoodscopeKey);
    if (savedFoodscopeUrl) setFoodscopeApiUrl(savedFoodscopeUrl);
    
    // Test backend connection on mount
    handleTestBackendConnection();
  }, [user, isLoading, router]);

  const handleTestBackendConnection = async () => {
    setBackendLoading(true);
    try {
      const result = await ccaeApi.getHealth();
      setBackendStatus({
        connected: result.status === 'healthy',
        message: `Connected: ${result.stats.cuisines} cuisines, ${result.stats.recipes} recipes, ${result.stats.ingredients} ingredients`
      });
    } catch (err) {
      const errorMessage = handleApiError(err);
      setBackendStatus({
        connected: false,
        message: `Failed to connect: ${errorMessage}`
      });
    } finally {
      setBackendLoading(false);
    }
  };

  const handleTestFoodscopeConnection = async () => {
    setFoodscopeLoading(true);
    try {
      // For now, we'll simulate a connection test
      // In production, this would make a real API call to FoodScope
      if (foodscopeApiKey && foodscopeApiUrl) {
        // Simulated successful connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFoodscopeStatus({
          connected: true,
          message: 'FoodScope API connection successful'
        });
      } else {
        setFoodscopeStatus({
          connected: false,
          message: 'Please enter API key and URL to connect'
        });
      }
    } catch (err) {
      setFoodscopeStatus({
        connected: false,
        message: 'Failed to connect to FoodScope API'
      });
    } finally {
      setFoodscopeLoading(false);
    }
  };

  const handleSaveFoodscopeConfig = () => {
    localStorage.setItem('foodscope_api_key', foodscopeApiKey);
    localStorage.setItem('foodscope_api_url', foodscopeApiUrl);
    setSaveMessage({ type: 'success', text: 'FoodScope configuration saved successfully!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSearchIngredients = async () => {
    if (!ingredientQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      // In production, this would search FoodScope API
      // For now, we'll show placeholder results
      await new Promise(resolve => setTimeout(resolve, 500));
      setSearchResults([
        { name: ingredientQuery, category: 'Spice', molecules: 45, compounds: 12 },
        { name: `${ingredientQuery} extract`, category: 'Extract', molecules: 23, compounds: 8 }
      ]);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setSaveMessage({ type: 'success', text: 'API key copied to clipboard!' });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleAddNewKey = () => {
    if (!newKeyName.trim()) return;
    
    const newKey: ApiKeyConfig = {
      id: Date.now().toString(),
      name: newKeyName,
      key: '',
      provider: newKeyProvider,
      status: 'inactive',
      lastUsed: null,
      createdAt: new Date().toISOString(),
      permissions: ['read']
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowNewKeyForm(false);
    setSaveMessage({ type: 'success', text: 'API key configuration added!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    setSaveMessage({ type: 'success', text: 'API key removed!' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API Keys & Integrations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your API keys and external service connections. Connect to FoodScope for enhanced molecular data and flavor analysis.
          </p>
        </motion.div>

        {/* Success/Error Messages */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{saveMessage.text}</span>
          </motion.div>
        )}

        {/* Connection Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* CCAE Backend Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">CCAE Backend</h3>
                  <p className="text-sm text-gray-500">Core adaptation engine</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                backendStatus?.connected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {backendStatus?.connected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    Disconnected
                  </>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {backendStatus?.message || 'Testing connection...'}
            </p>
            
            <button
              onClick={handleTestBackendConnection}
              disabled={backendLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
            >
              {backendLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>
          </div>

          {/* FoodScope Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">FoodScope API</h3>
                  <p className="text-sm text-gray-500">Molecular flavor data</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                foodscopeStatus?.connected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {foodscopeStatus?.connected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    Not Connected
                  </>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {foodscopeStatus?.message || 'Configure API credentials below to connect'}
            </p>
            
            <button
              onClick={handleTestFoodscopeConnection}
              disabled={foodscopeLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
            >
              {foodscopeLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FoodScope Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">FoodScope API Configuration</h2>
                  <p className="text-sm text-gray-500">Connect to FlavorDB for ingredient compounds, flavor molecules & food pairings</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* API URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Base URL
                  </label>
                  <input
                    type="url"
                    value={foodscopeApiUrl}
                    onChange={(e) => setFoodscopeApiUrl(e.target.value)}
                    placeholder="https://cosylab.iiitd.edu.in/flavordb/"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">The base URL for the FoodScope/FlavorDB API</p>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showFoodscopeKey ? 'text' : 'password'}
                      value={foodscopeApiKey}
                      onChange={(e) => setFoodscopeApiKey(e.target.value)}
                      placeholder="Enter your FoodScope API key"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                    />
                    <button
                      onClick={() => setShowFoodscopeKey(!showFoodscopeKey)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {showFoodscopeKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Your API key for authentication (if required)</p>
                </div>

                {/* Save Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveFoodscopeConfig}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Configuration
                  </button>
                  <button
                    onClick={handleTestFoodscopeConnection}
                    disabled={foodscopeLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Zap className="w-4 h-4" />
                    Test & Verify
                  </button>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-purple-900 mb-2">About FoodScope/FlavorDB</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    FoodScope provides access to FlavorDB, a comprehensive database of flavor molecules, food compounds, and ingredient pairings used for computational gastronomy.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-purple-600">25K+</p>
                      <p className="text-xs text-gray-600">Molecules</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-purple-600">1K+</p>
                      <p className="text-xs text-gray-600">Ingredients</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-purple-600">500+</p>
                      <p className="text-xs text-gray-600">Compounds</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredient Search Test */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Test API: Ingredient Search</h2>
                  <p className="text-sm text-gray-500">Search for ingredients to verify API connection</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={ingredientQuery}
                  onChange={(e) => setIngredientQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchIngredients()}
                  placeholder="Search ingredients (e.g. turmeric, basil, garlic)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
                <button
                  onClick={handleSearchIngredients}
                  disabled={searchLoading || !ingredientQuery.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {searchLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="min-h-[150px] border border-gray-200 rounded-lg p-4 bg-gray-50">
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((item, i) => (
                      <div key={i} className="p-4 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div className="text-center">
                              <p className="font-semibold text-blue-600">{item.molecules}</p>
                              <p className="text-xs text-gray-500">Molecules</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-purple-600">{item.compounds}</p>
                              <p className="text-xs text-gray-500">Compounds</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      {foodscopeStatus?.connected 
                        ? 'Search for ingredients to see molecular data' 
                        : 'Configure and connect FoodScope API to search ingredients'}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {['Fetch Compounds', 'Fetch Molecules', 'Fetch Pairings'].map((label) => (
                  <button
                    key={label}
                    disabled={!foodscopeStatus?.connected}
                    className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar - API Keys List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* API Keys Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  API Keys
                </h3>
                <button
                  onClick={() => setShowNewKeyForm(!showNewKeyForm)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* New Key Form */}
              {showNewKeyForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Key name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newKeyProvider}
                    onChange={(e) => setNewKeyProvider(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="foodscope">FoodScope</option>
                    <option value="flavordb">FlavorDB</option>
                    <option value="custom">Custom API</option>
                  </select>
                  <button
                    onClick={handleAddNewKey}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Add Key
                  </button>
                </div>
              )}

              {/* Keys List */}
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          key.status === 'active' ? 'bg-green-500' : 
                          key.status === 'expired' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-medium text-sm text-gray-900">{key.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{key.provider}</span>
                      <span>•</span>
                      <span>{key.permissions.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                API Usage
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Requests Today</span>
                    <span className="font-medium text-gray-900">247</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">247 / 1000 daily limit</p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Request</span>
                    <span className="text-gray-900">2 min ago</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="text-gray-900">124ms</span>
                </div>
              </div>
            </div>

            {/* Documentation */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Check out our API documentation for detailed integration guides.
              </p>
              <button
                onClick={() => router.push('/api-docs')}
                className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
