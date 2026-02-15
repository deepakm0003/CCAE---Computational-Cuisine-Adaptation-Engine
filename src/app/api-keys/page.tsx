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
  Activity,
  Beaker
} from 'lucide-react';
import ccaeApi, { handleApiError } from '@/lib/api';
import foodscopeApi, { searchIngredients as searchFlavorDB, testConnection as testFlavorDBConnection } from '@/lib/foodscopeApi';

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
  const [searchPerformed, setSearchPerformed] = useState(false);
  
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
      // Save config first so the API module can use it
      if (foodscopeApiUrl) {
        localStorage.setItem('foodscope_api_url', foodscopeApiUrl);
      }
      if (foodscopeApiKey) {
        localStorage.setItem('foodscope_api_key', foodscopeApiKey);
      }
      
      // Test real connection to FlavorDB
      const result = await testFlavorDBConnection();
      setFoodscopeStatus({
        connected: result.connected,
        message: result.message
      });
    } catch (err: any) {
      setFoodscopeStatus({
        connected: false,
        message: `Failed to connect: ${err.message || 'Unknown error'}`
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
    setSearchPerformed(true);
    try {
      const query = ingredientQuery.toLowerCase().trim();
      const results: any[] = [];
      
      // First, search FlavorDB if connected
      if (foodscopeStatus?.connected) {
        try {
          const flavorDBResults = await searchFlavorDB(query);
          if (flavorDBResults && flavorDBResults.length > 0) {
            flavorDBResults.forEach(item => {
              results.push({
                type: 'flavordb',
                source: 'FlavorDB',
                id: item.id,
                name: item.name,
                category: item.category,
                flavorProfile: item.flavorProfile,
                molecules: item.molecules,
                matchType: 'flavordb',
                ingredientCount: item.molecules?.length || 0
              });
            });
          }
        } catch (err) {
          console.warn('FlavorDB search failed:', err);
        }
      }
      
      // Then search CCAE backend recipes
      const recipes = await ccaeApi.getRecipes();
      
      // Flavor keywords mapping
      const flavorKeywords: Record<string, string[]> = {
        'spicy': ['chili', 'pepper', 'cayenne', 'jalapeño', 'habanero', 'sriracha', 'hot sauce', 'paprika', 'cumin', 'curry', 'spices', 'garam masala'],
        'sweet': ['sugar', 'honey', 'maple', 'chocolate', 'caramel', 'vanilla', 'cinnamon', 'fruit', 'berry', 'apple', 'mango', 'pineapple'],
        'savory': ['soy sauce', 'miso', 'mushroom', 'parmesan', 'bacon', 'anchovy', 'worcestershire', 'tomato paste', 'beef', 'pork'],
        'umami': ['soy sauce', 'miso', 'fish sauce', 'mushroom', 'parmesan', 'tomato', 'anchovy', 'seaweed', 'dashi', 'oyster sauce'],
        'sour': ['lemon', 'lime', 'vinegar', 'tamarind', 'yogurt', 'buttermilk', 'citrus', 'pickle'],
        'bitter': ['coffee', 'cocoa', 'kale', 'arugula', 'radicchio', 'beer', 'hoppy'],
        'fresh': ['mint', 'basil', 'cilantro', 'parsley', 'lemon', 'lime', 'cucumber', 'lettuce', 'fresh'],
        'aromatic': ['garlic', 'onion', 'ginger', 'cinnamon', 'cardamom', 'clove', 'star anise', 'lemongrass', 'galangal'],
        'creamy': ['cream', 'milk', 'butter', 'cheese', 'coconut milk', 'yogurt', 'mayonnaise', 'heavy cream'],
        'smoky': ['smoked', 'bacon', 'chipotle', 'paprika', 'bbq', 'grilled', 'charred']
      };
      
      // Check if query is a flavor term
      const flavorIngredients = flavorKeywords[query] || [];
      const isFlavorSearch = flavorIngredients.length > 0;
      
      // Find recipes containing the search term in ingredients, recipe name, cuisine, OR flavor
      const matchingRecipes = recipes.map((recipe: any) => {
        const ingredients = recipe.ingredients || [];
        const matchedIngredient = ingredients.find((ing: string) => 
          ing.toLowerCase().includes(query)
        );
        const matchesName = recipe.name?.toLowerCase().includes(query);
        const matchesCuisine = recipe.cuisine?.toLowerCase().includes(query);
        
        // Check for flavor match
        let matchedFlavor: string | null = null;
        let flavorMatchedIngredient: string | null = null;
        
        if (isFlavorSearch) {
          for (const ing of ingredients) {
            const ingLower = ing.toLowerCase();
            for (const flavorIng of flavorIngredients) {
              if (ingLower.includes(flavorIng)) {
                matchedFlavor = query;
                flavorMatchedIngredient = ing;
                break;
              }
            }
            if (matchedFlavor) break;
          }
        }
        
        // Always detect flavors from ingredients for display
        const detectedFlavors: string[] = [];
        for (const [flavor, keywords] of Object.entries(flavorKeywords)) {
          for (const ing of ingredients) {
            if (keywords.some(k => ing.toLowerCase().includes(k))) {
              if (!detectedFlavors.includes(flavor)) {
                detectedFlavors.push(flavor);
                break;
              }
            }
          }
        }
        
        const hasMatch = matchedIngredient || matchesName || matchesCuisine || matchedFlavor;
        
        return {
          recipe,
          matchedIngredient,
          matchesName,
          matchesCuisine,
          matchedFlavor,
          flavorMatchedIngredient,
          detectedFlavors,
          matchType: matchesName ? 'name' : (matchesCuisine ? 'cuisine' : (matchedIngredient ? 'ingredient' : (matchedFlavor ? 'flavor' : null))),
          hasMatch
        };
      }).filter(r => r.hasMatch).slice(0, 10);
      
      // Add recipe results
      matchingRecipes.forEach((result: any) => {
        results.push({
          type: 'recipe',
          source: 'CCAE',
          id: result.recipe.id,
          name: result.recipe.name,
          cuisine: result.recipe.cuisine,
          ingredients: result.recipe.ingredients || [],
          matchedIngredient: result.matchedIngredient || result.flavorMatchedIngredient || query,
          matchType: result.matchType,
          matchedFlavor: result.matchedFlavor,
          detectedFlavors: result.detectedFlavors,
          ingredientCount: result.recipe.ingredients?.length || 0
        });
      });
      
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAdaptRecipe = (item: any) => {
    // Store recipe selection and redirect to adapt page
    localStorage.setItem('selectedRecipe', item.id.toString());
    localStorage.setItem('sourceCuisine', item.cuisine);
    localStorage.setItem('searchIngredient', item.matchedIngredient || '');
    router.push('/adapt');
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
                  onChange={(e) => {
                    setIngredientQuery(e.target.value);
                    if (!e.target.value.trim()) setSearchPerformed(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchIngredients()}
                  placeholder="Search ingredients (e.g. chicken, butter, basil, tomato)"
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
                    {/* FlavorDB Results */}
                    {searchResults.filter(item => item.source === 'FlavorDB').length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Beaker className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-700">FlavorDB Results</span>
                          <span className="text-xs text-gray-400">({searchResults.filter(item => item.source === 'FlavorDB').length})</span>
                        </div>
                        {searchResults.filter(item => item.source === 'FlavorDB').map((item, i) => (
                          <div key={`fdb-${i}`} className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors mb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">FlavorDB</span>
                                  {item.category && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded capitalize">{item.category}</span>
                                  )}
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                </div>
                                {item.flavorProfile && item.flavorProfile.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-400">Flavors:</span>
                                    {item.flavorProfile.slice(0, 5).map((f: string, idx: number) => (
                                      <span key={idx} className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[10px] rounded capitalize">{f}</span>
                                    ))}
                                  </div>
                                )}
                                {item.molecules && item.molecules.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {item.molecules.length} molecules
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1">
                                  <Beaker className="w-3 h-3" />
                                  View Molecules
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CCAE Recipe Results */}
                    {searchResults.filter(item => item.source === 'CCAE').length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">CCAE Recipes</span>
                          <span className="text-xs text-gray-400">({searchResults.filter(item => item.source === 'CCAE').length})</span>
                        </div>
                        {searchResults.filter(item => item.source === 'CCAE').map((item, i) => (
                          <div key={`ccae-${i}`} className="p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors mb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">{item.cuisine}</span>
                                  {item.matchType === 'name' && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Name Match</span>
                                  )}
                                  {item.matchType === 'cuisine' && (
                                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-medium rounded">Cuisine Match</span>
                                  )}
                                  {item.matchType === 'ingredient' && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">Ingredient Match</span>
                                  )}
                                  {item.matchType === 'flavor' && (
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">Flavor: {item.matchedFlavor}</span>
                                  )}
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {item.ingredientCount} ingredients
                                  {item.matchedIngredient && item.matchType === 'ingredient' && (
                                    <span className="text-orange-600 ml-2">• matched: "{item.matchedIngredient}"</span>
                                  )}
                                </p>
                                {item.detectedFlavors && item.detectedFlavors.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-400">Flavors:</span>
                                    {item.detectedFlavors.slice(0, 4).map((f: string) => (
                                      <span key={f} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded capitalize">{f}</span>
                                    ))}
                                  </div>
                                )}
                                {item.ingredients && (
                                  <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                                    {item.ingredients.slice(0, 6).join(', ')}{item.ingredients.length > 6 ? ` +${item.ingredients.length - 6} more` : ''}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleAdaptRecipe(item)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                                >
                                  <Zap className="w-4 h-4" />
                                  Adapt
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    {searchPerformed ? (
                      <div>
                        <p className="text-gray-700 font-medium mb-1">No recipes found for "{ingredientQuery}"</p>
                        <p className="text-gray-500 text-sm mb-3">
                          Try searching for ingredients, recipe names, or flavors
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {['chicken', 'garlic', 'spicy', 'tomato', 'cream', 'sweet'].map(term => (
                            <button
                              key={term}
                              onClick={() => { setIngredientQuery(term); }}
                              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        {backendStatus?.connected 
                          ? 'Search for ingredients, recipe names, or flavors (spicy, sweet, etc.)' 
                          : 'Connect to CCAE backend to search ingredients'}
                      </p>
                    )}
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
