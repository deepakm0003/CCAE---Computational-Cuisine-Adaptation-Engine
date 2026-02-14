"""
MVP Adaptation Engine with Exact Mathematical Formulas

Formulas Implemented:
1. Identity Score: IS = cos(V_r, V_source)
2. Compatibility Score: CS = cos(V_r, V_target)
3. Adaptation Distance: AD = |I_original - I_modified| / |I_original|
4. Flavor Coherence Score: FCS = (M_r · M_m) / (||M_r|| × ||M_m||)
5. Replacement Priority: P(i) = 1 - C(i)
6. Multi-objective Score: Score = α·CS + β·IS - γ·AD + δ·FCS
"""

import numpy as np
from collections import Counter
from sqlalchemy.orm import Session
from typing import Dict, List, Tuple, Any, Optional

from app.models.cuisine import Cuisine, CuisineEmbedding
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.molecule import FlavorMolecule, IngredientMolecule
from app.models.adaptation import AdaptationResult
from app.services.mvp_identity import compute_cosine_similarity, compute_term_frequency, compute_molecular_distribution
from app.core.config import logger


def get_cuisine_vector(db: Session, cuisine_name: str) -> Optional[np.ndarray]:
    """Get cuisine embedding vector from database."""
    cuisine = db.query(Cuisine).filter(Cuisine.name == cuisine_name.lower()).first()
    if not cuisine:
        return None
    
    embedding = db.query(CuisineEmbedding).filter(CuisineEmbedding.cuisine_id == cuisine.id).first()
    if not embedding or not embedding.embedding_vector:
        return None
    
    return np.array(embedding.embedding_vector, dtype=float)


def get_recipe_ingredients(db: Session, recipe_id: int) -> List[str]:
    """Get ingredient names for a recipe."""
    rows = (
        db.query(Ingredient.name)
        .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
        .filter(RecipeIngredient.recipe_id == recipe_id)
        .all()
    )
    return [row[0] for row in rows]


def get_ingredient_molecules(db: Session, ingredient_name: str) -> Dict[str, float]:
    """Get molecule profile for an ingredient."""
    ingredient = db.query(Ingredient).filter(Ingredient.name == ingredient_name.lower()).first()
    if not ingredient:
        return {}
    
    rows = (
        db.query(FlavorMolecule.name, IngredientMolecule.intensity_score)
        .join(IngredientMolecule, IngredientMolecule.molecule_id == FlavorMolecule.id)
        .filter(IngredientMolecule.ingredient_id == ingredient.id)
        .all()
    )
    
    return {name: score for name, score in rows}


def compute_molecular_compatibility(
    db: Session,
    ingredient_a: str,
    ingredient_b: str
) -> float:
    """
    Compute molecular compatibility between two ingredients.
    Based on shared molecules and intensity scores.
    """
    mol_a = get_ingredient_molecules(db, ingredient_a)
    mol_b = get_ingredient_molecules(db, ingredient_b)
    
    if not mol_a or not mol_b:
        return 0.5  # Neutral score if no data
    
    # Find shared molecules
    shared_molecules = set(mol_a.keys()) & set(mol_b.keys())
    
    if not shared_molecules:
        return 0.2  # Low compatibility if no shared molecules
    
    # Compute compatibility based on shared molecules
    total_similarity = 0.0
    for mol in shared_molecules:
        # Use harmonic mean of intensities
        intensity_a = mol_a[mol]
        intensity_b = mol_b[mol]
        harmonic_mean = 2 * (intensity_a * intensity_b) / (intensity_a + intensity_b) if (intensity_a + intensity_b) > 0 else 0
        total_similarity += harmonic_mean
    
    # Normalize by maximum possible similarity
    max_possible = len(shared_molecules)
    compatibility = total_similarity / max_possible if max_possible > 0 else 0.0
    
    return min(compatibility, 1.0)  # Cap at 1.0


def compute_recipe_vector(
    ingredients: List[str],
    db: Session
) -> np.ndarray:
    """
    Compute recipe vector from ingredient frequencies and molecules.
    """
    # Compute TF for ingredients
    ingredient_frequencies = compute_term_frequency(ingredients)
    
    # Compute molecular distribution
    molecular_distribution = compute_molecular_distribution(ingredient_frequencies, db)
    
    # Create combined vector (same as cuisine vector creation)
    all_features = set(ingredient_frequencies.keys()) | set(molecular_distribution.keys())
    vector = []
    
    for feature in all_features:
        ing_val = ingredient_frequencies.get(feature, 0.0)
        mol_val = molecular_distribution.get(feature, 0.0)
        vector.append(ing_val + mol_val)
    
    return np.array(vector, dtype=float)


def compute_flavor_coherence(
    original_ingredients: List[str],
    adapted_ingredients: List[str],
    db: Session
) -> float:
    """
    Compute Flavor Coherence Score.
    
    Formula: FCS = (M_r · M_m) / (||M_r|| × ||M_m||)
    where M_r = original molecular vector, M_m = modified molecular vector
    """
    # Compute molecular vectors
    original_freq = compute_term_frequency(original_ingredients)
    adapted_freq = compute_term_frequency(adapted_ingredients)
    
    original_mol = compute_molecular_distribution(original_freq, db)
    adapted_mol = compute_molecular_distribution(adapted_freq, db)
    
    # Convert to vectors
    all_molecules = set(original_mol.keys()) | set(adapted_mol.keys())
    
    original_vector = np.array([original_mol.get(mol, 0.0) for mol in all_molecules])
    adapted_vector = np.array([adapted_mol.get(mol, 0.0) for mol in all_molecules])
    
    # Compute cosine similarity
    return compute_cosine_similarity(original_vector, adapted_vector)


def rank_ingredients_for_replacement(
    ingredients: List[str],
    centrality_scores: Dict[str, float],
    intensity: float
) -> List[str]:
    """
    Rank ingredients by replacement priority.
    
    Formula: P(i) = 1 - C(i)
    Lower centrality → higher replacement priority
    """
    # Compute replacement probabilities
    ingredient_priorities = []
    for ingredient in ingredients:
        centrality = centrality_scores.get(ingredient, 0.0)
        priority = 1.0 - centrality  # Lower centrality = higher priority
        ingredient_priorities.append((ingredient, priority))
    
    # Sort by priority (descending)
    ingredient_priorities.sort(key=lambda x: -x[1])
    
    # Select top ingredients based on intensity
    num_to_replace = max(1, int(len(ingredients) * intensity * 0.6))
    
    return [ing for ing, _ in ingredient_priorities[:num_to_replace]]


def select_replacement_ingredients(
    ingredients_to_replace: List[str],
    target_ingredients: List[str],
    db: Session
) -> List[Tuple[str, str, float]]:
    """
    Select best replacement ingredients based on molecular compatibility.
    Returns list of (original, replacement, compatibility_score)
    """
    replacements = []
    available_targets = [ing for ing in target_ingredients if ing not in ingredients_to_replace]
    
    for original in ingredients_to_replace:
        if not available_targets:
            break
        
        # Find best molecular match
        best_match = None
        best_score = -1.0
        
        for candidate in available_targets[:10]:  # Check top 10 candidates
            compatibility = compute_molecular_compatibility(db, original, candidate)
            if compatibility > best_score:
                best_score = compatibility
                best_match = candidate
        
        if best_match:
            replacements.append((original, best_match, best_score))
            available_targets.remove(best_match)
    
    return replacements


def compute_adaptation_distance(
    original_ingredients: List[str],
    adapted_ingredients: List[str]
) -> float:
    """
    Compute Adaptation Distance.
    
    Formula: AD = |I_original - I_modified| / |I_original|
    """
    if not original_ingredients:
        return 0.0
    
    # Count differences
    original_set = set(original_ingredients)
    adapted_set = set(adapted_ingredients)
    
    differences = len(original_set.symmetric_difference(adapted_set))
    distance = differences / len(original_set)
    
    return distance


def compute_multi_objective_score(
    identity_score: float,
    compatibility_score: float,
    adaptation_distance: float,
    flavor_coherence: float,
    weights: Dict[str, float] = None
) -> float:
    """
    Compute multi-objective optimization score.
    
    Formula: Score = α·CS + β·IS - γ·AD + δ·FCS
    
    Default weights:
    α = 0.4 (compatibility)
    β = 0.3 (identity)
    γ = 0.2 (adaptation distance penalty)
    δ = 0.1 (flavor coherence)
    """
    if weights is None:
        weights = {"compatibility": 0.4, "identity": 0.3, "distance": 0.2, "coherence": 0.1}
    
    score = (
        weights["compatibility"] * compatibility_score +
        weights["identity"] * identity_score -
        weights["distance"] * adaptation_distance +
        weights["coherence"] * flavor_coherence
    )
    
    return score


def adapt_recipe(
    db: Session,
    recipe_id: int,
    source_cuisine: str,
    target_cuisine: str,
    intensity: float = 0.5
) -> Dict[str, Any]:
    """
    Main adaptation function implementing the complete MVP algorithm.
    """
    logger.info(f"Adapting recipe {recipe_id}: {source_cuisine} -> {target_cuisine} (intensity: {intensity})")
    
    # Validate recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        return {"error": f"Recipe {recipe_id} not found"}
    
    # Get original ingredients
    original_ingredients = get_recipe_ingredients(db, recipe_id)
    if not original_ingredients:
        return {"error": "Recipe has no ingredients"}
    
    # Get cuisine vectors
    source_vector = get_cuisine_vector(db, source_cuisine)
    target_vector = get_cuisine_vector(db, target_cuisine)
    
    if source_vector is None:
        return {"error": f"Source cuisine '{source_cuisine}' not found or not computed"}
    if target_vector is None:
        return {"error": f"Target cuisine '{target_cuisine}' not found or not computed"}
    
    # Compute recipe vector
    recipe_vector = compute_recipe_vector(original_ingredients, db)
    
    # 1. Compute Identity Score
    identity_score = compute_cosine_similarity(recipe_vector, source_vector)
    
    # 2. Compute Compatibility Score
    compatibility_score = compute_cosine_similarity(recipe_vector, target_vector)
    
    # 3. Get target cuisine data for replacement
    target_cuisine_obj = db.query(Cuisine).filter(Cuisine.name == target_cuisine.lower()).first()
    target_embedding = db.query(CuisineEmbedding).filter(CuisineEmbedding.cuisine_id == target_cuisine_obj.id).first()
    
    if not target_embedding or not target_embedding.ingredient_frequency:
        return {"error": f"Target cuisine '{target_cuisine}' has no ingredient data"}
    
    target_ingredients = list(target_embedding.ingredient_frequency.keys())
    centrality_scores = target_embedding.centrality_scores or {}
    
    # 4. Select ingredients to replace
    ingredients_to_replace = rank_ingredients_for_replacement(
        original_ingredients, centrality_scores, intensity
    )
    
    # 5. Select replacement ingredients
    replacements = select_replacement_ingredients(
        ingredients_to_replace, target_ingredients, db
    )
    
    # 6. Create adapted ingredients list
    adapted_ingredients = original_ingredients.copy()
    substitution_details = []
    
    for original, replacement, compatibility in replacements:
        if original in adapted_ingredients:
            idx = adapted_ingredients.index(original)
            adapted_ingredients[idx] = replacement
            
            reason = "low centrality in source, high frequency in target"
            if compatibility > 0.5:
                reason += ", good molecular compatibility"
            
            substitution_details.append({
                "original": original,
                "replacement": replacement,
                "reason": reason,
                "confidence": round(min(compatibility + 0.3, 1.0), 3)
            })
    
    # 7. Compute Adaptation Distance
    adaptation_distance = compute_adaptation_distance(original_ingredients, adapted_ingredients)
    
    # 8. Compute Flavor Coherence Score
    flavor_coherence = compute_flavor_coherence(original_ingredients, adapted_ingredients, db)
    
    # 9. Compute Multi-objective Score
    multi_score = compute_multi_objective_score(
        identity_score, compatibility_score, adaptation_distance, flavor_coherence
    )
    
    # 10. Store result in database
    result = AdaptationResult(
        recipe_id=recipe_id,
        source_cuisine=source_cuisine.lower(),
        target_cuisine=target_cuisine.lower(),
        intensity=intensity,
        identity_score=round(identity_score, 4),
        compatibility_score=round(compatibility_score, 4),
        adaptation_distance=round(adaptation_distance, 4),
        flavor_coherence=round(flavor_coherence, 4),
        original_ingredients=original_ingredients,
        adapted_ingredients=adapted_ingredients,
        substitutions=substitution_details,
    )
    
    db.add(result)
    db.commit()
    db.refresh(result)
    
    logger.info(f"Adaptation complete: {len(substitution_details)} substitutions made")
    
    return {
        "id": result.id,
        "recipe_name": recipe.name,
        "source_cuisine": source_cuisine.lower(),
        "target_cuisine": target_cuisine.lower(),
        "intensity": intensity,
        "scores": {
            "identity_score": round(identity_score, 4),
            "compatibility_score": round(compatibility_score, 4),
            "adaptation_distance": round(adaptation_distance, 4),
            "flavor_coherence": round(flavor_coherence, 4),
            "multi_objective_score": round(multi_score, 4)
        },
        "original_ingredients": original_ingredients,
        "adapted_ingredients": adapted_ingredients,
        "substitutions": substitution_details,
        "substitution_count": len(substitution_details),
        "created_at": result.created_at.isoformat() if result.created_at else None
    }
