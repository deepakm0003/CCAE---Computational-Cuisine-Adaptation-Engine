"""
MVP Routes for CCAE Backend
Simplified endpoints that work with the MVP services.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Optional
import pandas as pd
import json
from io import StringIO

from app.core.database import get_db
from app.models.cuisine import Cuisine
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.molecule import FlavorMolecule
from app.models.adaptation import AdaptationResult
from app.services.mvp_identity import compute_cuisine_identity, compute_all_cuisine_identities
from app.services.mvp_adaptation import adapt_recipe

router = APIRouter(prefix="/mvp", tags=["MVP"])


# Pydantic schemas for MVP
from pydantic import BaseModel

class CuisineIdentityResponse(BaseModel):
    cuisine: str
    recipe_count: int
    ingredient_count: int
    top_ingredients: List[Dict[str, Any]]
    molecule_distribution: Dict[str, float]
    centrality_scores: Dict[str, float]
    embedding_2d: List[float]
    vector_dimension: int

class AdaptationRequest(BaseModel):
    recipe_id: int
    source_cuisine: str
    target_cuisine: str
    intensity: float = 0.5

class AdaptationResponse(BaseModel):
    id: int
    recipe_name: str
    source_cuisine: str
    target_cuisine: str
    intensity: float
    scores: Dict[str, float]
    original_ingredients: List[str]
    adapted_ingredients: List[str]
    substitutions: List[Dict[str, Any]]
    substitution_count: int
    created_at: Optional[str]

class UploadResponse(BaseModel):
    status: str
    message: str
    recipes_uploaded: int = 0
    ingredients_added: int = 0
    cuisines_added: int = 0


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Simple health check for MVP."""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        
        # Get basic stats
        cuisine_count = db.query(Cuisine).count()
        recipe_count = db.query(Recipe).count()
        ingredient_count = db.query(Ingredient).count()
        
        return {
            "status": "healthy",
            "database": "connected",
            "stats": {
                "cuisines": cuisine_count,
                "recipes": recipe_count,
                "ingredients": ingredient_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.get("/cuisines", response_model=List[str])
def list_cuisines(db: Session = Depends(get_db)):
    """List all available cuisines."""
    cuisines = db.query(Cuisine).order_by(Cuisine.name).all()
    return [c.name for c in cuisines]


@router.get("/cuisine/{cuisine_name}/identity", response_model=CuisineIdentityResponse)
def get_cuisine_identity(cuisine_name: str, db: Session = Depends(get_db)):
    """Compute and return cuisine identity using exact mathematical formulas."""
    result = compute_cuisine_identity(db, cuisine_name)
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result


@router.post("/cuisine/compute-all")
def compute_all_identities(db: Session = Depends(get_db)):
    """Compute identities for all cuisines."""
    result = compute_all_cuisine_identities(db)
    return result


@router.get("/recipes")
def list_recipes(
    cuisine: Optional[str] = Query(None, description="Filter by cuisine"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List recipes with optional cuisine filter."""
    query = db.query(Recipe)
    
    if cuisine:
        cuisine_obj = db.query(Cuisine).filter(Cuisine.name == cuisine.lower()).first()
        if cuisine_obj:
            query = query.filter(Recipe.cuisine_id == cuisine_obj.id)
    
    recipes = query.offset(offset).limit(limit).all()
    
    result = []
    for recipe in recipes:
        # Get ingredients for this recipe
        ingredients = (
            db.query(Ingredient.name)
            .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
            .filter(RecipeIngredient.recipe_id == recipe.id)
            .all()
        )
        
        # Get cuisine name
        cuisine_obj = db.query(Cuisine).filter(Cuisine.id == recipe.cuisine_id).first()
        
        result.append({
            "id": recipe.id,
            "name": recipe.name,
            "cuisine": cuisine_obj.name if cuisine_obj else "unknown",
            "ingredients": [ing[0] for ing in ingredients],
            "instruction_count": len(recipe.instructions.split('.')) if recipe.instructions else 0
        })
    
    return result


@router.get("/recipe/{recipe_id}")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Get detailed recipe information."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Get ingredients
    ingredients = (
        db.query(Ingredient.name, RecipeIngredient.quantity)
        .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
        .filter(RecipeIngredient.recipe_id == recipe.id)
        .all()
    )
    
    # Get cuisine
    cuisine = db.query(Cuisine).filter(Cuisine.id == recipe.cuisine_id).first()
    
    return {
        "id": recipe.id,
        "name": recipe.name,
        "cuisine": cuisine.name if cuisine else "unknown",
        "instructions": recipe.instructions,
        "ingredients": [
            {"name": ing[0], "quantity": ing[1]}
            for ing in ingredients
        ],
        "created_at": recipe.created_at.isoformat() if recipe.created_at else None
    }


@router.post("/adapt", response_model=AdaptationResponse)
def adapt_recipe_endpoint(request: AdaptationRequest, db: Session = Depends(get_db)):
    """Run recipe adaptation using exact mathematical formulas."""
    result = adapt_recipe(
        db=db,
        recipe_id=request.recipe_id,
        source_cuisine=request.source_cuisine,
        target_cuisine=request.target_cuisine,
        intensity=request.intensity
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/adaptations")
def list_adaptations(
    recipe_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List adaptation results."""
    query = db.query(AdaptationResult)
    
    if recipe_id:
        query = query.filter(AdaptationResult.recipe_id == recipe_id)
    
    adaptations = query.order_by(AdaptationResult.created_at.desc()).limit(limit).all()
    
    result = []
    for adaptation in adaptations:
        recipe = db.query(Recipe).filter(Recipe.id == adaptation.recipe_id).first()
        
        result.append({
            "id": adaptation.id,
            "recipe_name": recipe.name if recipe else "Unknown",
            "source_cuisine": adaptation.source_cuisine,
            "target_cuisine": adaptation.target_cuisine,
            "intensity": adaptation.intensity,
            "scores": {
                "identity_score": adaptation.identity_score,
                "compatibility_score": adaptation.compatibility_score,
                "adaptation_distance": adaptation.adaptation_distance,
                "flavor_coherence": adaptation.flavor_coherence
            },
            "substitution_count": len(adaptation.substitutions or []),
            "created_at": adaptation.created_at.isoformat() if adaptation.created_at else None
        })
    
    return result


@router.post("/upload/recipes", response_model=UploadResponse)
async def upload_recipes(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload recipes from CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        content = await file.read()
        df = pd.read_csv(StringIO(content.decode('utf-8')))
        
        # Validate required columns
        required_columns = ['recipe_name', 'cuisine', 'ingredients', 'instructions']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing_columns}")
        
        recipes_uploaded = 0
        ingredients_added = 0
        cuisines_added = 0
        
        for _, row in df.iterrows():
            # Get or create cuisine
            cuisine_name = row['cuisine'].strip().lower()
            cuisine = db.query(Cuisine).filter(Cuisine.name == cuisine_name).first()
            if not cuisine:
                cuisine = Cuisine(name=cuisine_name, region="", description="")
                db.add(cuisine)
                db.commit()
                db.refresh(cuisine)
                cuisines_added += 1
            
            # Create recipe
            recipe = Recipe(
                name=row['recipe_name'].strip(),
                cuisine_id=cuisine.id,
                instructions=row['instructions'].strip()
            )
            db.add(recipe)
            db.commit()
            db.refresh(recipe)
            
            # Process ingredients
            ingredients_list = [ing.strip().lower() for ing in str(row['ingredients']).split('|')]
            
            for ingredient_name in ingredients_list:
                if not ingredient_name:
                    continue
                
                # Get or create ingredient
                ingredient = db.query(Ingredient).filter(Ingredient.name == ingredient_name).first()
                if not ingredient:
                    ingredient = Ingredient(name=ingredient_name, category="")
                    db.add(ingredient)
                    db.commit()
                    db.refresh(ingredient)
                    ingredients_added += 1
                
                # Link recipe to ingredient
                from app.models.ingredient import RecipeIngredient
                link = RecipeIngredient(
                    recipe_id=recipe.id,
                    ingredient_id=ingredient.id,
                    quantity=""
                )
                db.add(link)
            
            recipes_uploaded += 1
        
        db.commit()
        
        return UploadResponse(
            status="success",
            message=f"Successfully uploaded {recipes_uploaded} recipes",
            recipes_uploaded=recipes_uploaded,
            ingredients_added=ingredients_added,
            cuisines_added=cuisines_added
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/upload/molecules", response_model=UploadResponse)
async def upload_molecules(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload molecule data from CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        content = await file.read()
        df = pd.read_csv(StringIO(content.decode('utf-8')))
        
        # Validate required columns
        required_columns = ['ingredient', 'molecule', 'category', 'intensity']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing_columns}")
        
        molecules_added = 0
        mappings_created = 0
        
        for _, row in df.iterrows():
            # Get or create molecule
            molecule_name = row['molecule'].strip().lower()
            molecule = db.query(FlavorMolecule).filter(FlavorMolecule.name == molecule_name).first()
            if not molecule:
                molecule = FlavorMolecule(
                    name=molecule_name,
                    category=row['category'].strip(),
                    formula=""
                )
                db.add(molecule)
                db.commit()
                db.refresh(molecule)
                molecules_added += 1
            
            # Get ingredient
            ingredient_name = row['ingredient'].strip().lower()
            ingredient = db.query(Ingredient).filter(Ingredient.name == ingredient_name).first()
            if not ingredient:
                continue  # Skip if ingredient doesn't exist
            
            # Create mapping
            from app.models.molecule import IngredientMolecule
            existing = db.query(IngredientMolecule).filter(
                IngredientMolecule.ingredient_id == ingredient.id,
                IngredientMolecule.molecule_id == molecule.id
            ).first()
            
            if not existing:
                mapping = IngredientMolecule(
                    ingredient_id=ingredient.id,
                    molecule_id=molecule.id,
                    intensity_score=float(row['intensity'])
                )
                db.add(mapping)
                mappings_created += 1
        
        db.commit()
        
        return UploadResponse(
            status="success",
            message=f"Successfully added {molecules_added} molecules and {mappings_created} mappings",
            molecules_added=molecules_added,
            mappings_created=mappings_created
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# Preview endpoints for MVP
@router.get("/preview/compatibility")
def preview_compatibility(
    source_cuisine: str = Query(..., description="Source cuisine name"),
    target_cuisine: str = Query(..., description="Target cuisine name"),
    db: Session = Depends(get_db)
):
    """Preview compatibility between two cuisines."""
    from app.services.preview import get_compatibility_preview
    result = get_compatibility_preview(db, source_cuisine, target_cuisine)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/preview/adaptation-impact")
def preview_adaptation_impact(
    request: dict,
    db: Session = Depends(get_db)
):
    """Estimate adaptation impact before running full adaptation."""
    from app.services.preview import get_adaptation_impact
    source_cuisine = request.get("source_cuisine", "")
    target_cuisine = request.get("target_cuisine", "")
    intensity = request.get("intensity", 0.5)
    result = get_adaptation_impact(db, source_cuisine, target_cuisine, intensity)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/preview/ingredient-risk")
def preview_ingredient_risk(
    request: dict,
    db: Session = Depends(get_db)
):
    """Assess risk level of ingredients for adaptation."""
    from app.services.preview import get_ingredient_risk
    target_cuisine = request.get("target_cuisine", "")
    result = get_ingredient_risk(db, target_cuisine)
    return {"cuisine": target_cuisine, "risk_assessment": result}


@router.get("/formulas")
def get_mathematical_formulas():
    """Return the exact mathematical formulas used in the MVP."""
    return {
        "title": "CCAE MVP Mathematical Formulas",
        "formulas": {
            "term_frequency": {
                "name": "Term Frequency (TF)",
                "formula": "TF_i = count_i / total_count",
                "description": "Frequency of ingredient i in cuisine"
            },
            "molecular_distribution": {
                "name": "Molecular Distribution",
                "formula": "M_j = Σ(TF_i × molecule_i,j)",
                "description": "Distribution of molecule j across ingredients"
            },
            "centrality": {
                "name": "Degree Centrality",
                "formula": "C(i) = deg(i) / (N-1)",
                "description": "Importance of ingredient i in co-occurrence network"
            },
            "cosine_similarity": {
                "name": "Cosine Similarity",
                "formula": "cos(A,B) = (A·B) / (||A|| × ||B||)",
                "description": "Similarity between two vectors"
            },
            "identity_score": {
                "name": "Identity Score",
                "formula": "IS = cos(V_r, V_source)",
                "description": "How well recipe matches source cuisine"
            },
            "compatibility_score": {
                "name": "Compatibility Score",
                "formula": "CS = cos(V_r, V_target)",
                "description": "How well recipe fits target cuisine"
            },
            "adaptation_distance": {
                "name": "Adaptation Distance",
                "formula": "AD = |I_original - I_modified| / |I_original|",
                "description": "How much the recipe changed"
            },
            "flavor_coherence": {
                "name": "Flavor Coherence Score",
                "formula": "FCS = (M_r · M_m) / (||M_r|| × ||M_m||)",
                "description": "Preservation of molecular profile"
            },
            "replacement_priority": {
                "name": "Replacement Priority",
                "formula": "P(i) = 1 - C(i)",
                "description": "Likelihood of replacing ingredient i"
            },
            "multi_objective_score": {
                "name": "Multi-objective Score",
                "formula": "Score = α·CS + β·IS - γ·AD + δ·FCS",
                "description": "Overall adaptation quality score",
                "weights": {
                    "α": 0.4,  # compatibility
                    "β": 0.3,  # identity
                    "γ": 0.2,  # adaptation distance penalty
                    "δ": 0.1   # flavor coherence
                }
            }
        }
    }
