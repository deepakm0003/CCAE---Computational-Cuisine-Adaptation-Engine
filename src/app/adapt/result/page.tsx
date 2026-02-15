'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, AlertTriangle, RefreshCw, CheckCircle, TrendingUp, Zap, Globe } from 'lucide-react';

// Flavor categories for heatmap
const flavorCategories = ['Sweet', 'Sour', 'Salty', 'Bitter', 'Umami', 'Spicy', 'Aromatic', 'Earthy'];

export default function AdaptResultPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdaptationResult();
  }, []);

  useEffect(() => {
    if (result && canvasRef.current) {
      drawFlavorHeatmap();
    }
  }, [result]);

  const fetchAdaptationResult = () => {
    try {
      // Get result from localStorage
      const storedResult = localStorage.getItem('adaptationResult');
      
      if (storedResult) {
        const parsedResult = JSON.parse(storedResult);
        setResult(parsedResult);
      } else {
        // Redirect to adapt page if no result found
        router.push('/adapt');
        return;
      }
    } catch (err) {
      console.error('Failed to fetch adaptation result:', err);
      setError('Failed to load adaptation result');
    } finally {
      setLoading(false);
    }
  };

  const drawFlavorHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Generate flavor profiles based on ingredients
    const originalIngredients = result.original_ingredients || [];
    const adaptedIngredients = result.adapted_ingredients || [];
    
    // Simple heuristics for flavor scoring based on ingredient keywords
    const getFlavorProfile = (ingredients: string[]) => {
      const profile: Record<string, number> = {};
      flavorCategories.forEach(cat => profile[cat] = 0.2 + Math.random() * 0.3); // Base randomness
      
      ingredients.forEach(ing => {
        const ingLower = ing.toLowerCase();
        if (/sugar|honey|sweet|maple|caramel|fruit/i.test(ingLower)) profile['Sweet'] += 0.15;
        if (/lemon|lime|vinegar|citrus|tamarind/i.test(ingLower)) profile['Sour'] += 0.15;
        if (/salt|soy|fish sauce|miso/i.test(ingLower)) profile['Salty'] += 0.15;
        if (/coffee|cocoa|bitter|kale/i.test(ingLower)) profile['Bitter'] += 0.15;
        if (/mushroom|tomato|parmesan|dashi|msg/i.test(ingLower)) profile['Umami'] += 0.15;
        if (/chili|pepper|cayenne|jalapeno|sriracha/i.test(ingLower)) profile['Spicy'] += 0.15;
        if (/basil|thyme|oregano|cilantro|mint|rosemary/i.test(ingLower)) profile['Aromatic'] += 0.15;
        if (/potato|carrot|beet|truffle|mushroom/i.test(ingLower)) profile['Earthy'] += 0.15;
      });
      
      // Normalize to 0-1
      flavorCategories.forEach(cat => {
        profile[cat] = Math.min(1, profile[cat]);
      });
      
      return profile;
    };
    
    const originalProfile = getFlavorProfile(originalIngredients);
    const adaptedProfile = getFlavorProfile(adaptedIngredients);
    
    // Draw heatmap
    const cellWidth = width / flavorCategories.length;
    const cellHeight = height / 2;
    
    // Original cuisine row
    flavorCategories.forEach((cat, i) => {
      const intensity = originalProfile[cat];
      const hue = 220; // Blue
      ctx.fillStyle = `hsla(${hue}, 70%, ${90 - intensity * 50}%, 1)`;
      ctx.fillRect(i * cellWidth, 0, cellWidth - 2, cellHeight - 2);
      
      // Value text
      ctx.fillStyle = intensity > 0.6 ? '#fff' : '#1e293b';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((intensity * 100).toFixed(0) + '%', i * cellWidth + cellWidth / 2, cellHeight / 2 + 5);
    });
    
    // Adapted cuisine row
    flavorCategories.forEach((cat, i) => {
      const intensity = adaptedProfile[cat];
      const hue = 142; // Green
      ctx.fillStyle = `hsla(${hue}, 70%, ${90 - intensity * 50}%, 1)`;
      ctx.fillRect(i * cellWidth, cellHeight, cellWidth - 2, cellHeight - 2);
      
      // Value text
      ctx.fillStyle = intensity > 0.6 ? '#fff' : '#1e293b';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((intensity * 100).toFixed(0) + '%', i * cellWidth + cellWidth / 2, cellHeight + cellHeight / 2 + 5);
    });
  };

  const handleDownload = () => {
    if (!result) return;
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `adaptation-result-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleNewAdaptation = () => {
    localStorage.removeItem('adaptationResult');
    localStorage.removeItem('selectedRecipe');
    localStorage.removeItem('targetCuisine');
    router.push('/adapt');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading adaptation result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600 mb-4">{error || 'No adaptation result found'}</p>
          <button
            onClick={() => router.push('/adapt')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start New Adaptation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Adaptation Complete!
          </h1>
          <p className="text-xl text-gray-600">
            Your recipe has been successfully adapted with AI-powered analysis.
          </p>
        </motion.div>

        {/* Result Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adaptation Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Identity Score</span>
                <span className="font-medium">{((result.scores?.identity_score || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compatibility Score</span>
                <span className="font-medium">{((result.scores?.compatibility_score || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Adaptation Distance</span>
                <span className="font-medium">{(result.scores?.adaptation_distance || 0).toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Multi-Objective Score</span>
                <span className="font-medium">{((result.scores?.multi_objective_score || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredient Changes</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Ingredients</span>
                <span className="font-medium">{Array.isArray(result.original_ingredients) ? result.original_ingredients.length : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Adapted Ingredients</span>
                <span className="font-medium">{Array.isArray(result.adapted_ingredients) ? result.adapted_ingredients.length : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Substitutions Made</span>
                <span className="font-medium">{result.substitution_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Intensity</span>
                <span className="font-medium">{((result.intensity || 0.5) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flavor Profile Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Flavor Profile Comparison</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Visual comparison of flavor characteristics between original and adapted recipes
          </p>
          
          {/* Heatmap Labels */}
          <div className="flex gap-1 mb-2 pl-24">
            {flavorCategories.map((cat, i) => (
              <div key={i} className="flex-1 text-center text-xs font-medium text-gray-600">{cat}</div>
            ))}
          </div>
          
          {/* Heatmap Canvas Container */}
          <div className="flex items-stretch gap-2">
            {/* Row Labels */}
            <div className="w-20 flex flex-col justify-around text-right pr-2">
              <div className="h-12 flex items-center justify-end">
                <span className="text-sm font-medium text-blue-600">{result.source_cuisine || 'Original'}</span>
              </div>
              <div className="h-12 flex items-center justify-end">
                <span className="text-sm font-medium text-green-600">{result.target_cuisine || 'Adapted'}</span>
              </div>
            </div>
            
            {/* Canvas */}
            <div className="flex-1">
              <canvas 
                ref={canvasRef} 
                width={560} 
                height={100}
                className="w-full rounded-lg"
              />
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200"></div>
              <span className="text-xs text-gray-600">Low Intensity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-400"></div>
              <span className="text-xs text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-xs text-gray-600">High Intensity</span>
            </div>
          </div>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Adapted Recipe: {result.recipe_name}</h3>
          
          <div className="prose max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Original Recipe</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Cuisine:</strong> {result.source_cuisine || 'Unknown'}
                  </p>
                  <div className="mt-3">
                    <strong className="text-sm">Ingredients:</strong>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {Array.isArray(result.original_ingredients) ? result.original_ingredients.map((ing: string, i: number) => (
                        <li key={i}>• {ing}</li>
                      )) : <li>No ingredients</li>}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Adapted Recipe</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Cuisine:</strong> {result.target_cuisine || 'Unknown'}
                  </p>
                  <div className="mt-3">
                    <strong className="text-sm">Ingredients:</strong>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {Array.isArray(result.adapted_ingredients) ? result.adapted_ingredients.map((ing: string, i: number) => (
                        <li key={i}>• {ing}</li>
                      )) : <li>No ingredients</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Substitutions */}
        {Array.isArray(result.substitutions) && result.substitutions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ML-Powered Substitutions</h3>
            <div className="space-y-4">
              {result.substitutions.map((sub: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 line-through">{sub.original}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-medium">{sub.replacement}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{sub.reason}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    Confidence: {((sub.confidence || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Results
          </button>
          
          <button
            onClick={handleNewAdaptation}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Start New Adaptation
          </button>
          
          <button
            onClick={() => router.push('/flavor-map')}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Flavor Map
          </button>
        </motion.div>
      </div>
    </div>
  );
}
