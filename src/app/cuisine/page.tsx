'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Globe, ChefHat, Star, Clock, Users, TrendingUp, Filter, Search } from 'lucide-react';

interface Cuisine {
  id: string;
  name: string;
  region: string;
  description: string;
  popularDishes: string[];
  complexity: number;
  flavorProfile: string[];
  adaptations: number;
  avgRating: number;
}

export default function CuisinePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchCuisines();
  }, [user, isLoading, router]);

  const fetchCuisines = async () => {
    try {
      // Mock data - replace with real API call
      const mockCuisines: Cuisine[] = [
        {
          id: '1',
          name: 'Italian',
          region: 'Europe',
          description: 'Known for pasta, pizza, and rich flavors using olive oil, tomatoes, and fresh herbs.',
          popularDishes: ['Margherita Pizza', 'Carbonara', 'Risotto'],
          complexity: 6,
          flavorProfile: ['Herbal', 'Rich', 'Savory'],
          adaptations: 156,
          avgRating: 4.7
        },
        {
          id: '2',
          name: 'Japanese',
          region: 'Asia',
          description: 'Emphasizes seasonal ingredients, precise preparation, and balanced flavors.',
          popularDishes: ['Sushi', 'Ramen', 'Tempura'],
          complexity: 8,
          flavorProfile: ['Umami', 'Clean', 'Subtle'],
          adaptations: 142,
          avgRating: 4.8
        },
        {
          id: '3',
          name: 'Mexican',
          region: 'Americas',
          description: 'Bold flavors with chili peppers, corn, beans, and vibrant spices.',
          popularDishes: ['Tacos', 'Enchiladas', 'Mole'],
          complexity: 5,
          flavorProfile: ['Spicy', 'Bold', 'Earthy'],
          adaptations: 128,
          avgRating: 4.6
        },
        {
          id: '4',
          name: 'Indian',
          region: 'Asia',
          description: 'Complex spice blends, regional diversity, and vegetarian traditions.',
          popularDishes: ['Butter Chicken', 'Biryani', 'Paneer Tikka'],
          complexity: 9,
          flavorProfile: ['Spicy', 'Aromatic', 'Complex'],
          adaptations: 134,
          avgRating: 4.7
        },
        {
          id: '5',
          name: 'Thai',
          region: 'Asia',
          description: 'Balance of sweet, sour, spicy, salty, and bitter flavors.',
          popularDishes: ['Pad Thai', 'Tom Yum', 'Green Curry'],
          complexity: 7,
          flavorProfile: ['Spicy', 'Sour', 'Sweet'],
          adaptations: 98,
          avgRating: 4.5
        },
        {
          id: '6',
          name: 'French',
          region: 'Europe',
          description: 'Techniques-driven cuisine with butter, cream, and wine.',
          popularDishes: ['Coq au Vin', 'Ratatouille', 'Crème Brûlée'],
          complexity: 8,
          flavorProfile: ['Rich', 'Buttery', 'Elegant'],
          adaptations: 112,
          avgRating: 4.8
        }
      ];

      setCuisines(mockCuisines);
    } catch (error) {
      console.error('Failed to fetch cuisines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCuisines = cuisines.filter(cuisine => {
    const matchesSearch = cuisine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cuisine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || cuisine.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const regions = ['all', 'Europe', 'Asia', 'Americas', 'Africa', 'Middle Eastern'];

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'bg-green-500';
    if (complexity <= 6) return 'bg-yellow-500';
    if (complexity <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cuisines...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            World Cuisines
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore diverse culinary traditions from around the world and discover their unique characteristics
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Cuisines Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCuisines.map((cuisine, index) => (
            <motion.div
              key={cuisine.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{cuisine.name}</h3>
                  <p className="text-sm text-gray-500">{cuisine.region}</p>
                </div>
                <Globe className="w-6 h-6 text-blue-600" />
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {cuisine.description}
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Complexity</span>
                    <span className="text-sm font-medium text-gray-900">{cuisine.complexity}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getComplexityColor(cuisine.complexity)}`}
                      style={{ width: `${(cuisine.complexity / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">{cuisine.avgRating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">{cuisine.adaptations} adaptations</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900 mb-2">Popular Dishes:</p>
                <div className="flex flex-wrap gap-1">
                  {cuisine.popularDishes.slice(0, 3).map((dish, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900 mb-2">Flavor Profile:</p>
                <div className="flex flex-wrap gap-1">
                  {cuisine.flavorProfile.map((flavor, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      {flavor}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => router.push(`/flavor-map?cuisine=${cuisine.name}`)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Cuisine
              </button>
            </motion.div>
          ))}
        </motion.div>

        {filteredCuisines.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No cuisines found matching your criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
