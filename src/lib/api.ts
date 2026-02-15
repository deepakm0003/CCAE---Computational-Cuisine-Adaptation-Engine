/**
 * Centralized API Layer for CCAE Frontend
 * Connects to MVP Backend with exact mathematical formulas
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const API_TIMEOUT = 30000; // 30 seconds

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Remove Content-Type for FormData so browser can set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      if (!error.response) {
        console.error(`❌ Network Error: ${error.message || 'Failed to connect to server'}`, {
          url: error.config?.url,
          code: error.code
        });
      } else {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
      }
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface HealthResponse {
  status: string;
  database: string;
  stats: {
    cuisines: number;
    recipes: number;
    ingredients: number;
  };
}

export interface Cuisine {
  name: string;
}

export interface Recipe {
  id: number;
  name: string;
  cuisine: string;
  ingredients: string[];
  instruction_count: number;
}

export interface RecipeDetail {
  id: number;
  name: string;
  cuisine: string;
  instructions: string;
  ingredients: Array<{ name: string; quantity: string }>;
  created_at?: string;
}

export interface CuisineIdentity {
  name: string;
  recipe_count: number;
  ingredient_count: number;
  top_ingredients: Array<{
    name: string;
    frequency: number;
    centrality: number;
  }>;
  molecule_distribution: Record<string, number>;
  centrality_scores: Record<string, number>;
  embedding_2d: number[];
  vector_dimension: number;
}

export interface AdaptationRequest {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  intensity: number;
}

export interface AdaptationResponse {
  id: string;
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  original_recipe: {
    name: string;
    ingredients: string[];
  };
  adapted_recipe: {
    name: string;
    ingredients: string[];
  };
  substitutions: Array<{
    original: string;
    replacement: string;
    reason: string;
  }>;
  scores: {
    identity_score: number;
    compatibility_score: number;
    adaptation_distance: number;
    flavor_coherence: number;
    multi_objective_score: number;
  };
  metadata: {
    created_at: string;
    processing_time: number;
  };
}

export interface UploadResponse {
  message: string;
  recipes_uploaded?: number;
  ingredients_added?: number;
  cuisines_added?: number;
  molecules_added?: number;
  mappings_created?: number;
}

export interface TransferabilityResponse {
  source_cuisines: string[];
  target_cuisines: string[];
  matrix: number[][];
}

// API Functions - MVP Backend

// Health Check
export const getHealth = async (): Promise<HealthResponse> => {
  const response = await api.get('/mvp/health');
  return response.data;
};

// Cuisines
export const getCuisines = async (): Promise<Cuisine[]> => {
  const response = await api.get('/mvp/cuisines');
  return response.data;
};

// Recipes
export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await api.get('/mvp/recipes');
  return response.data;
};

// Cuisine Identity
export const getCuisineIdentity = async (cuisineName: string): Promise<CuisineIdentity> => {
  const response = await api.get(`/mvp/cuisine/${cuisineName}/identity`);
  return response.data;
};

// Compute All Identities
export const computeAllIdentities = async (): Promise<any> => {
  const response = await api.post('/mvp/cuisine/compute-all');
  return response.data;
};

// Recipe Adaptation
export const adaptRecipe = async (request: AdaptationRequest): Promise<AdaptationResponse> => {
  const response = await api.post('/mvp/adapt', request);
  return response.data;
};

// Get Adaptations
export const getAdaptations = async (params?: { limit?: number }): Promise<AdaptationResponse[]> => {
  // Backend has max limit of 100
  const safeParams = params ? { ...params, limit: Math.min(params.limit || 100, 100) } : { limit: 100 };
  const response = await api.get('/mvp/adaptations', { params: safeParams });
  return response.data;
};

// Get Adaptation Result
export const getAdaptationResult = async (adaptationId: string): Promise<AdaptationResponse> => {
  const response = await api.get(`/mvp/adapt/${adaptationId}`);
  return response.data;
};

// Compatibility Preview
export const getCompatibilityPreview = async (sourceCuisine: string, targetCuisine: string): Promise<any> => {
  const response = await api.get(`/mvp/preview/compatibility`, {
    params: { source_cuisine: sourceCuisine, target_cuisine: targetCuisine }
  });
  return response.data;
};

// Impact Preview
export const getImpactPreview = async (request: { recipe_id: number; source_cuisine: string; target_cuisine: string; intensity: number }): Promise<any> => {
  const response = await api.post('/mvp/preview/adaptation-impact', request);
  return response.data;
};

// Risk Preview
export const getRiskPreview = async (request: { recipe_id: number; target_cuisine: string; intensity: number }): Promise<any> => {
  const response = await api.post('/mvp/preview/ingredient-risk', request);
  return response.data;
};

// Transferability Matrix
export const getTransferability = async (): Promise<TransferabilityResponse> => {
  const response = await api.get('/mvp/transferability');
  return response.data;
};

// Upload Recipes
export const uploadRecipes = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/mvp/upload/recipes', formData);
  return response.data;
};

// Upload Molecules
export const uploadMolecules = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/mvp/upload/molecules', formData);
  return response.data;
};

// Recompute All
export const recomputeAll = async (): Promise<any> => {
  const response = await api.post('/mvp/recompute-all');
  return response.data;
};

// Get Mathematical Formulas
export const getFormulas = async (): Promise<any> => {
  const response = await api.get('/mvp/formulas');
  return response.data;
};

// Error handling utility
export const handleApiError = (error: any): string => {
  // Network error (no response from server)
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return 'Cannot connect to server. Please ensure the backend is running on http://localhost:8000';
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused. Backend server may not be running.';
    }
    return error.message || 'Network error occurred';
  }
  
  // Server returned an error response
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  } else if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.status) {
    return `Server error: ${error.response.status} ${error.response.statusText || ''}`;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

// ==================== ADAPTATION TRACKING ====================
// Track user adaptations in localStorage for dashboard stats

interface AdaptationRecord {
  id: string;
  timestamp: string;
  sourceCuisine: string;
  targetCuisine: string;
  recipeName: string;
  identityScore: number;
  compatibilityScore: number;
}

const ADAPTATIONS_STORAGE_KEY = 'ccae_adaptations';

export const trackAdaptation = (adaptation: Omit<AdaptationRecord, 'id' | 'timestamp'>): void => {
  try {
    const record: AdaptationRecord = {
      ...adaptation,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: new Date().toISOString()
    };
    
    const existing = localStorage.getItem(ADAPTATIONS_STORAGE_KEY);
    const adaptations: AdaptationRecord[] = existing ? JSON.parse(existing) : [];
    adaptations.unshift(record); // Add to beginning
    
    // Keep only last 100 adaptations
    const trimmed = adaptations.slice(0, 100);
    localStorage.setItem(ADAPTATIONS_STORAGE_KEY, JSON.stringify(trimmed));
    
    // Dispatch event for live updates
    window.dispatchEvent(new CustomEvent('adaptation-completed', { detail: record }));
  } catch (err) {
    console.warn('Failed to track adaptation:', err);
  }
};

export const getAdaptationHistory = (): AdaptationRecord[] => {
  try {
    const stored = localStorage.getItem(ADAPTATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const getAdaptationStats = (): { 
  total: number; 
  today: number; 
  thisWeek: number;
  avgIdentityScore: number;
  avgCompatibilityScore: number;
  topTargetCuisine: string;
} => {
  const history = getAdaptationHistory();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  
  const today = history.filter(a => new Date(a.timestamp).getTime() >= todayStart).length;
  const thisWeek = history.filter(a => new Date(a.timestamp).getTime() >= weekStart).length;
  
  const avgIdentityScore = history.length > 0 
    ? history.reduce((sum, a) => sum + (a.identityScore || 0), 0) / history.length 
    : 0;
  const avgCompatibilityScore = history.length > 0 
    ? history.reduce((sum, a) => sum + (a.compatibilityScore || 0), 0) / history.length 
    : 0;
  
  // Find most common target cuisine
  const cuisineCounts: Record<string, number> = {};
  history.forEach(a => {
    cuisineCounts[a.targetCuisine] = (cuisineCounts[a.targetCuisine] || 0) + 1;
  });
  const topTargetCuisine = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  
  return { 
    total: history.length, 
    today, 
    thisWeek, 
    avgIdentityScore, 
    avgCompatibilityScore,
    topTargetCuisine 
  };
};

// Consolidated API object for easier imports
const ccaeApi = {
  // Health
  getHealth,
  
  // Data
  getCuisines,
  getRecipes,
  getCuisineIdentity,
  computeAllIdentities,
  
  // Adaptation
  adaptRecipe,
  getAdaptations,
  getAdaptationResult,
  
  // Previews
  getCompatibilityPreview,
  getImpactPreview,
  getRiskPreview,
  
  // Analytics
  getTransferability,
  getFormulas,
  
  // Upload
  uploadRecipes,
  uploadMolecules,
  recomputeAll,
  
  // Tracking
  trackAdaptation,
  getAdaptationHistory,
  getAdaptationStats,
};

export default ccaeApi;
