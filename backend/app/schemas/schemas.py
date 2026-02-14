from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# --- Cuisine ---
class CuisineBase(BaseModel):
    name: str
    region: Optional[str] = None
    description: Optional[str] = None

class CuisineCreate(CuisineBase):
    pass

class CuisineOut(CuisineBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# --- Recipe ---
class RecipeBase(BaseModel):
    name: str
    cuisine_id: int
    instructions: Optional[str] = None

class RecipeCreate(RecipeBase):
    ingredients: List[str] = []

class RecipeOut(RecipeBase):
    id: int
    created_at: Optional[datetime] = None
    ingredients: List[str] = []
    cuisine_name: Optional[str] = None
    model_config = {"from_attributes": True}


# --- Ingredient ---
class IngredientBase(BaseModel):
    name: str
    category: Optional[str] = None

class IngredientOut(IngredientBase):
    id: int
    model_config = {"from_attributes": True}


# --- Molecule ---
class MoleculeBase(BaseModel):
    name: str
    category: Optional[str] = None
    formula: Optional[str] = None
    flavor_descriptor: Optional[str] = None

class MoleculeOut(MoleculeBase):
    id: int
    model_config = {"from_attributes": True}


# --- Upload ---
class UploadResponse(BaseModel):
    status: str
    recipes_inserted: int = 0
    ingredients_inserted: int = 0
    cuisines_inserted: int = 0
    molecules_inserted: int = 0
    mappings_created: int = 0
    errors: List[str] = []

class MoleculeUploadResponse(BaseModel):
    status: str
    molecules_inserted: int = 0
    mappings_created: int = 0
    errors: List[str] = []


# --- Cuisine Identity ---
class CuisineIdentityOut(BaseModel):
    cuisine: str
    top_ingredients: List[Dict[str, Any]]
    molecule_distribution: Dict[str, float]
    centrality_scores: Dict[str, float]
    embedding_2d: Optional[List[float]] = None
    ingredient_count: int = 0
    recipe_count: int = 0


# --- Adaptation ---
class AdaptationRequest(BaseModel):
    recipe_id: int
    source_cuisine: str
    target_cuisine: str
    intensity: float = Field(default=0.5, ge=0.0, le=1.0)

class SubstitutionOut(BaseModel):
    original: str
    replacement: str
    reason: str
    confidence: float

class AdaptationOut(BaseModel):
    id: int
    recipe_name: str
    source_cuisine: str
    target_cuisine: str
    intensity: float
    identity_score: float
    compatibility_score: float
    adaptation_distance: float
    flavor_coherence: float
    original_ingredients: List[str]
    adapted_ingredients: List[str]
    substitutions: List[SubstitutionOut]
    created_at: Optional[datetime] = None


# --- Preview ---
class CompatibilityPreview(BaseModel):
    source_cuisine: str
    target_cuisine: str
    compatibility_score: float
    shared_ingredients: int
    shared_molecules: int

class IngredientRisk(BaseModel):
    ingredient: str
    centrality: float
    risk_level: str
    replaceable: bool

class AdaptationImpact(BaseModel):
    estimated_identity_change: float
    estimated_flavor_shift: float
    risk_ingredients: List[str]


# --- Transferability ---
class TransferabilityMatrix(BaseModel):
    cuisines: List[str]
    matrix: List[List[float]]


# --- ML ---
class MLTrainResponse(BaseModel):
    status: str
    model_type: str
    dimensions: int
    ingredients_trained: int
    training_time_seconds: float

class MLStatusOut(BaseModel):
    model_trained: bool
    model_type: Optional[str] = None
    last_trained: Optional[datetime] = None
    dimensions: Optional[int] = None
    ingredients_count: Optional[int] = None


# --- Health ---
class HealthOut(BaseModel):
    status: str
    database: str
    tables: int
    cuisines: int
    recipes: int
    ingredients: int
    molecules: int
