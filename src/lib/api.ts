/**
 * Centralized API Layer
 * 
 * All frontend API calls must go through this file.
 * No direct fetch anywhere else.
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

// Request interceptor for logging in development
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API Types
export interface StatsResponse {
  total_cuisines: number;
  total_recipes: number;
  total_ingredients: number;
  total_molecules: number;
  last_recompute: string;
}

export interface FlavorMapResponse {
  matrix: number[][];
  metadata: {
    cuisines: string[];
    total_cuisines: number;
    matrix_size: string;
    computation_time: number;
    similarity_metric: string;
  };
  analysis: {
    statistics: {
      mean_similarity: number;
      median_similarity: number;
      std_similarity: number;
      min_similarity: number;
      max_similarity: number;
    };
    most_similar_pairs: Array<{
      cuisine_1: string;
      cuisine_2: string;
      similarity: number;
    }>;
  };
  heatmap_data: {
    x_labels: string[];
    y_labels: string[];
    z_values: number[][];
    color_scale: {
      min: number;
      max: number;
      midpoint: number;
    };
  };
}

export interface CuisineIdentityResponse {
  cuisine_name: string;
  embedding_2d: number[];
  ingredient_frequencies: Record<string, number>;
  molecular_distribution: Record<string, number>;
  centrality_scores: Record<string, number>;
  identity_score: number;
  stats: {
    ingredient_count: number;
    molecule_count: number;
    centrality_nodes: number;
    tf_entropy: number;
    molecular_entropy: number;
    centrality_mean: number;
    centrality_std: number;
  };
  computation_time: number;
}

export interface Recipe {
  id: number;
  name: string;
  cuisine_name: string;
  ingredient_count: number;
}

export interface CuisineOption {
  name: string;
  recipe_count: number;
}

export interface CompatibilityPreviewRequest {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
}

export interface CompatibilityPreviewResponse {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  mathematical_scores: {
    identity_score: number;
    compatibility_score: number;
    cuisine_similarity: number;
    compatibility_ratio: number;
  };
  ingredient_analysis: {
    recipe_ingredients: number;
    source_overlap_count: number;
    target_overlap_count: number;
    source_overlap_ratio: number;
    target_overlap_ratio: number;
    overlap_ratio: number;
    shared_ingredients: string[];
    recipe_unique_ingredients: string[];
    target_unique_ingredients: string[];
  };
  compatibility_level: string;
  recommendation: string;
  validation: {
    scores_valid: boolean;
    mathematical_soundness: boolean;
  };
}

export interface ImpactPreviewRequest {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  intensity: number;
}

export interface ImpactPreviewResponse {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  intensity: number;
  impact_metrics: {
    base_impact: number;
    intensity_adjusted_impact: number;
    impact_level: string;
    estimated_substitutions: number;
    total_ingredients: number;
    substitution_percentage: number;
  };
  quality_metrics: {
    quality_preservation: number;
    authenticity_retention: number;
    success_probability: number;
  };
  difficulty_assessment: {
    difficulty: string;
    complexity_factors: string[];
  };
  recommendations: string[];
  validation: {
    intensity_valid: boolean;
    metrics_valid: boolean;
  };
}

export interface RiskPreviewRequest {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  intensity: number;
}

export interface RiskPreviewResponse {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  intensity: number;
  risk_analysis: Array<{
    ingredient: string;
    centrality_score: number;
    centrality_percentile: number;
    risk_score: number;
    risk_level: string;
    substitution_likelihood: string;
    preservation_priority: string;
  }>;
  overall_risk: {
    overall_risk_score: number;
    overall_risk_level: string;
    risk_distribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
  risk_summary: {
    total_ingredients: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
  recommendations: string[];
  validation: {
    centrality_valid: boolean;
    risk_scores_valid: boolean;
  };
}

export interface AdaptationRequest {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  replacement_ratio: number;
}

export interface AdaptationResponse {
  recipe_id: number;
  source_cuisine: string;
  target_cuisine: string;
  replacement_ratio: number;
  identity_score: {
    original: number;
    adapted: number;
    change: number;
  };
  compatibility_score: {
    original: number;
    adapted: number;
    improvement: number;
  };
  adaptation_distance: number;
  flavor_coherence_score: number;
  ingredients: {
    original: string[];
    adapted: string[];
    replacements: Array<{
      original: string;
      replacement: string;
      centrality: number;
      replacement_probability: number;
    }>;
  };
  vectors: {
    recipe_vector: number[];
    source_vector: number[];
    target_vector: number[];
    adapted_vector: number[];
  };
  validation: {
    score_ranges: {
      identity_score_valid: boolean;
      compatibility_score_valid: boolean;
      adaptation_distance_valid: boolean;
      flavor_coherence_valid: boolean;
    };
    mathematical_properties: {
      adaptation_distance_reasonable: boolean;
      flavor_coherence_preserved: boolean;
      scores_computed: boolean;
    };
  };
}

export interface RecipeScoresResponse {
  recipe_id: number;
  recipe_name: string;
  identity_score: number;
  compatibility_scores: { [cuisine: string]: number };
  adaptation_potential: number;
  last_updated: string;
}

export interface ScoresResponse {
  average_identity_score: number;
  average_compatibility_score: number;
  average_adaptation_distance: number;
  average_flavor_coherence: number;
  average_processing_time: number;
  total_recipes: number;
  total_cuisines: number;
  last_updated: string;
}

export interface HealthResponse {
  api_status: 'healthy' | 'warning' | 'error';
  inference_load: number;
  latency: number;
  model_stability: number;
  uptime: number;
  timestamp: string;
}

export interface UploadResponse {
  message: string;
  summary: {
    recipes_uploaded: number;
    ingredients_processed: number;
    molecules_processed: number;
  };
  recompute_triggered: boolean;
}

// API Functions

// Stats
export const getStats = async (): Promise<StatsResponse> => {
  const response = await api.get('/stats');
  return response.data;
};

// Flavor Map
export const getFlavorMap = async (forceRefresh = false): Promise<FlavorMapResponse> => {
  const response = await api.get('/transferability/transferability', {
    params: { force_refresh: forceRefresh }
  });
  return response.data;
};

// Cuisine Identity
export const getCuisineIdentity = async (cuisineName: string): Promise<CuisineIdentityResponse> => {
  const response = await api.get(`/cuisines/${cuisineName}/identity`);
  return response.data;
};

export const computeAllIdentities = async (): Promise<any> => {
  const response = await api.post('/cuisines/compute-all');
  return response.data;
};

// Recipes
export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await api.get('/recipes');
  return response.data;
};

// Cuisines
export const getCuisines = async (): Promise<CuisineOption[]> => {
  const response = await api.get('/cuisines');
  return response.data;
};

// Preview APIs
export const previewCompatibility = async (request: CompatibilityPreviewRequest): Promise<CompatibilityPreviewResponse> => {
  const response = await api.post('/mvp/preview/compatibility', request);
  return response.data;
};

export const previewImpact = async (request: ImpactPreviewRequest): Promise<ImpactPreviewResponse> => {
  const response = await api.post('/mvp/preview/impact', request);
  return response.data;
};

export const previewRisk = async (request: RiskPreviewRequest): Promise<RiskPreviewResponse> => {
  const response = await api.post('/mvp/preview/risk', request);
  return response.data;
};

// Adaptation
export const adaptRecipe = async (request: AdaptationRequest): Promise<AdaptationResponse> => {
  const response = await api.post('/mvp/adapt', request);
  return response.data;
};

export const getAdaptationResult = async (adaptationId: string): Promise<AdaptationResponse> => {
  const response = await api.get(`/adaptations/${adaptationId}`);
  return response.data;
};

// Recipe Scores
export const getRecipeScores = async (recipeId: number): Promise<RecipeScoresResponse> => {
  const response = await api.get(`/recipes/${recipeId}/scores`);
  return response.data;
};

export const getScores = async (): Promise<ScoresResponse> => {
  const response = await api.get('/scores');
  return response.data;
};

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await api.get('/health');
  return response.data;
};

// Data Upload
export const uploadRecipes = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/recipes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadMolecules = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/molecules', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const recomputeAll = async (): Promise<any> => {
  const response = await api.post('/cuisines/recompute-all');
  return response.data;
};

// Health Check
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await api.get('/health');
  return response.data;
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export default api;
