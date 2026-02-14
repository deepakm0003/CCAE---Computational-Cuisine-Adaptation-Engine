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
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
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
  const response = await api.get('/mvp/adaptations', { params });
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
  
  const response = await api.post('/mvp/upload/recipes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload Molecules
export const uploadMolecules = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/mvp/upload/molecules', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  } else if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
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
};

export default ccaeApi;
