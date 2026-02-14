import { create } from 'zustand';
import { getFlavorMap, FlavorMapResponse } from './api';

export interface Cuisine {
  name: string;
  x: number;
  y: number;
  central_ingredients: string[];
  similarity_score: number;
}

export interface FlavorMapData {
  cuisines: Cuisine[];
  similarity_matrix: Record<string, any>;
  metadata: {
    cuisines: string[];
    total_cuisines: number;
    matrix_size: string;
    computation_time: number;
    similarity_metric: string;
  };
}

interface FlavorMapStore {
  data: FlavorMapData | null;
  loading: boolean;
  error: string | null;
  filteredCuisines: Cuisine[];
  similarityThreshold: number;
  searchQuery: string;
  selectedCuisine: Cuisine | null;
  hoveredCuisine: Cuisine | null;
  
  // Actions
  fetchData: () => Promise<void>;
  setSimilarityThreshold: (threshold: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCuisine: (cuisine: Cuisine | null) => void;
  setHoveredCuisine: (cuisine: Cuisine | null) => void;
  resetFilters: () => void;
}

export const useFlavorMapStore = create<FlavorMapStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  filteredCuisines: [],
  similarityThreshold: 0,
  searchQuery: '',
  selectedCuisine: null,
  hoveredCuisine: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      // Call real API
      const apiResponse: FlavorMapResponse = await getFlavorMap();
      
      // Transform API response to store format
      const transformedData: FlavorMapData = {
        cuisines: apiResponse.metadata.cuisines.map((cuisineName, index) => ({
          name: cuisineName,
          // Use first two dimensions from the matrix if available, otherwise use embeddings
          x: apiResponse.matrix[index]?.[0] || 0,
          y: apiResponse.matrix[index]?.[1] || 0,
          central_ingredients: [], // Will be populated from cuisine identity API
          similarity_score: apiResponse.analysis.statistics.mean_similarity
        })),
        similarity_matrix: apiResponse.matrix,
        metadata: apiResponse.metadata
      };
      
      set({ 
        data: transformedData, 
        loading: false,
        filteredCuisines: transformedData.cuisines 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch flavor map data', 
        loading: false 
      });
    }
  },

  setSimilarityThreshold: (threshold) => {
    set({ similarityThreshold: threshold });
    const { data, searchQuery } = get();
    if (data) {
      const filtered = data.cuisines.filter(
        cuisine => cuisine.similarity_score >= threshold && 
        cuisine.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      set({ filteredCuisines: filtered });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    const { data, similarityThreshold } = get();
    if (data) {
      const filtered = data.cuisines.filter(
        cuisine => cuisine.similarity_score >= similarityThreshold && 
        cuisine.name.toLowerCase().includes(query.toLowerCase())
      );
      set({ filteredCuisines: filtered });
    }
  },

  setSelectedCuisine: (cuisine) => set({ selectedCuisine: cuisine }),
  setHoveredCuisine: (cuisine) => set({ hoveredCuisine: cuisine }),

  resetFilters: () => {
    set({ 
      similarityThreshold: 0, 
      searchQuery: '',
      selectedCuisine: null,
      hoveredCuisine: null
    });
    const { data } = get();
    if (data) {
      set({ filteredCuisines: data.cuisines });
    }
  }
}));
