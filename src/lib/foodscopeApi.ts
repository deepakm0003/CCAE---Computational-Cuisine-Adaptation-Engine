/**
 * FoodScope API Integration
 * 
 * This module integrates with the FlavorDB API for flavor molecule data.
 * Uses local proxy at /api/flavordb to avoid CORS issues.
 * 
 * FlavorDB API provides:
 * - Ingredient flavor compound data
 * - Flavor molecule profiles
 * - Food entity information
 */

import axios from 'axios';

// Use local proxy to avoid CORS
const PROXY_URL = '/api/flavordb';

// Get saved config (for display purposes)
const getConfig = () => {
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('foodscope_api_url') : null;
  
  return {
    baseUrl: savedUrl || 'https://cosylab.iiitd.edu.in/flavordb',
  };
};

// --- Ingredient/Entity Endpoints ---

export interface FlavorDBEntity {
  entity_id: number;
  entity_alias_readable: string;
  entity_alias: string;
  category: string;
  natural_source_name?: string;
  molecules?: FlavorMolecule[];
}

export interface FlavorMolecule {
  pubchem_id: number;
  common_name: string;
  flavor_profile: string;
  fooddb_flavor_profile?: string;
  natural_sources?: string[];
}

export interface IngredientCompound {
  id: string;
  name: string;
  category: string;
  flavorProfile: string[];
  molecules: string[];
}

// Search entities/ingredients in FlavorDB via proxy
export async function searchIngredients(query: string): Promise<IngredientCompound[]> {
  try {
    const response = await axios.get(PROXY_URL, {
      params: { endpoint: 'entities', search: query, limit: 20 },
      timeout: 15000
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((entity: any) => ({
        id: entity.entity_id?.toString() || entity.id?.toString() || '',
        name: entity.entity_alias_readable || entity.name || entity.entity_alias || '',
        category: entity.category || 'ingredient',
        flavorProfile: entity.flavor_profile ? [entity.flavor_profile] : [],
        molecules: entity.molecules?.map((m: any) => m.common_name || m.name) || []
      }));
    }
    return [];
  } catch (err: any) {
    console.log(`[FlavorDB] Search failed for "${query}":`, err.message);
    return [];
  }
}

// Get entity details by ID via proxy
export async function getIngredientById(id: string): Promise<IngredientCompound | null> {
  try {
    const response = await axios.get(PROXY_URL, {
      params: { endpoint: 'entity_details', id },
      timeout: 15000
    });

    if (response.data) {
      const entity = response.data;
      return {
        id: entity.entity_id?.toString() || id,
        name: entity.entity_alias_readable || entity.name || '',
        category: entity.category || 'ingredient',
        flavorProfile: entity.flavor_profile ? [entity.flavor_profile] : [],
        molecules: entity.molecules?.map((m: any) => m.common_name) || []
      };
    }
    return null;
  } catch (err) {
    console.log(`[FlavorDB] getIngredientById failed for "${id}"`);
    return null;
  }
}

// Get flavor molecules for an entity via proxy
export async function getFlavorMolecules(entityId: string): Promise<FlavorMolecule[]> {
  try {
    const response = await axios.get(PROXY_URL, {
      params: { endpoint: 'entity_details', id: entityId },
      timeout: 15000
    });

    if (response.data?.molecules) {
      return response.data.molecules.map((m: any) => ({
        pubchem_id: m.pubchem_id || 0,
        common_name: m.common_name || m.name || '',
        flavor_profile: m.flavor_profile || m.fooddb_flavor_profile || '',
        fooddb_flavor_profile: m.fooddb_flavor_profile || '',
        natural_sources: m.natural_sources || []
      }));
    }
    return [];
  } catch (err) {
    console.log(`[FlavorDB] getFlavorMolecules failed for "${entityId}"`);
    return [];
  }
}

// Get all entities (paginated) via proxy
export async function getAllEntities(page: number = 1, limit: number = 50): Promise<FlavorDBEntity[]> {
  try {
    const response = await axios.get(PROXY_URL, {
      params: { endpoint: 'entities', page, limit },
      timeout: 15000
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (err) {
    console.log('[FlavorDB] getAllEntities failed');
    return [];
  }
}

// --- Food Pairing Endpoints ---

export interface FoodPairing {
  ingredient1: string;
  ingredient2: string;
  sharedMolecules: number;
  compatibilityScore: number;
}

// Get food pairings via proxy
export async function getFoodPairings(ingredientId: string): Promise<FoodPairing[]> {
  try {
    const response = await axios.get(PROXY_URL, {
      params: { endpoint: 'pairing', id: ingredientId },
      timeout: 15000
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((p: any) => ({
        ingredient1: p.entity1_name || ingredientId,
        ingredient2: p.entity2_name || p.paired_entity || '',
        sharedMolecules: p.shared_molecules || p.shared_count || 0,
        compatibilityScore: p.compatibility_score || p.score || 0
      }));
    }
    return [];
  } catch (err) {
    console.log(`[FlavorDB] getFoodPairings failed for "${ingredientId}"`);
    return [];
  }
}

// --- Connection Test ---

export async function testConnection(): Promise<{ connected: boolean; message: string; stats?: any }> {
  try {
    // Use proxy to test connection
    const response = await axios.post(PROXY_URL, {}, { timeout: 15000 });

    if (response.data?.connected) {
      return { 
        connected: true, 
        message: response.data.message || 'Connected to FlavorDB',
        stats: response.data.stats
      };
    }
    
    // Fallback: try GET request
    const getResponse = await axios.get(PROXY_URL, {
      params: { endpoint: 'entities', limit: 5 },
      timeout: 15000
    });
    
    if (getResponse.status === 200) {
      const count = Array.isArray(getResponse.data) ? getResponse.data.length : 0;
      return { 
        connected: true, 
        message: `Connected to FlavorDB (${count} entities)`,
        stats: { entities: count }
      };
    }
    return { connected: false, message: 'Connection test failed' };
  } catch (err: any) {
    return { connected: false, message: `Connection failed: ${err.message}` };
  }
}

// Export for use in components
export default {
  searchIngredients,
  getIngredientById,
  getFlavorMolecules,
  getAllEntities,
  getFoodPairings,
  testConnection
};
