import numpy as np
from collections import Counter
from scipy.spatial.distance import cosine
from sqlalchemy.orm import Session

from app.models.cuisine import Cuisine, CuisineEmbedding
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.molecule import IngredientMolecule, FlavorMolecule
from app.models.adaptation import AdaptationResult
from app.core.config import logger


def _get_cuisine_vector(db: Session, cuisine_name: str) -> tuple:
    """Get cuisine embedding vector and metadata."""
    cuisine = db.query(Cuisine).filter(Cuisine.name == cuisine_name.lower()).first()
    if not cuisine:
        return None, None, None
    emb = db.query(CuisineEmbedding).filter(CuisineEmbedding.cuisine_id == cuisine.id).first()
    if not emb or not emb.embedding_vector:
        return cuisine, None, None
    return cuisine, np.array(emb.embedding_vector, dtype=float), emb


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity, handling zero vectors."""
    if a is None or b is None:
        return 0.0
    max_len = max(len(a), len(b))
    a_padded = np.zeros(max_len)
    b_padded = np.zeros(max_len)
    a_padded[:len(a)] = a
    b_padded[:len(b)] = b
    norm_a = np.linalg.norm(a_padded)
    norm_b = np.linalg.norm(b_padded)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_padded, b_padded) / (norm_a * norm_b))


def _get_recipe_ingredients(db: Session, recipe_id: int) -> list:
    """Get ingredient names for a recipe."""
    rows = (
        db.query(Ingredient.name)
        .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
        .filter(RecipeIngredient.recipe_id == recipe_id)
        .all()
    )
    return [r[0] for r in rows]


def _get_ingredient_molecule_profile(db: Session, ingredient_name: str) -> dict:
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


def _molecular_compatibility(db: Session, ing1: str, ing2: str) -> float:
    """Compute molecular compatibility between two ingredients."""
    profile1 = _get_ingredient_molecule_profile(db, ing1)
    profile2 = _get_ingredient_molecule_profile(db, ing2)
    if not profile1 or not profile2:
        return 0.5  # neutral if no data
    shared = set(profile1.keys()) & set(profile2.keys())
    if not shared:
        return 0.2
    total = set(profile1.keys()) | set(profile2.keys())
    return len(shared) / len(total) if total else 0.0


def adapt_recipe(db: Session, recipe_id: int, source_cuisine: str, target_cuisine: str, intensity: float = 0.5) -> dict:
    """
    Core adaptation engine.
    1. Fetch recipe ingredients
    2. Fetch source/target cuisine vectors
    3. Compute identity & compatibility scores
    4. Rank ingredients by centrality
    5. Replace low-centrality ingredients with high-frequency target ingredients
    6. Match molecular compatibility
    7. Store result
    """
    # Validate recipe
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        return {"error": f"Recipe {recipe_id} not found"}

    original_ingredients = _get_recipe_ingredients(db, recipe_id)
    if not original_ingredients:
        return {"error": "Recipe has no ingredients"}

    # Get cuisine vectors
    src_cuisine, src_vec, src_emb = _get_cuisine_vector(db, source_cuisine)
    tgt_cuisine, tgt_vec, tgt_emb = _get_cuisine_vector(db, target_cuisine)

    if not src_cuisine:
        return {"error": f"Source cuisine '{source_cuisine}' not found"}
    if not tgt_cuisine:
        return {"error": f"Target cuisine '{target_cuisine}' not found"}

    # Compute identity score (how similar source and target are)
    identity_score = _cosine_similarity(src_vec, tgt_vec) if src_vec is not None and tgt_vec is not None else 0.5

    # Get target cuisine ingredient frequencies and centrality
    tgt_freq = dict(tgt_emb.ingredient_frequency) if tgt_emb and tgt_emb.ingredient_frequency else {}
    tgt_centrality = dict(tgt_emb.centrality_scores) if tgt_emb and tgt_emb.centrality_scores else {}
    src_centrality = dict(src_emb.centrality_scores) if src_emb and src_emb.centrality_scores else {}

    # Rank original ingredients by centrality in source cuisine
    ingredient_centrality = []
    for ing in original_ingredients:
        c = src_centrality.get(ing, 0.0)
        ingredient_centrality.append((ing, c))
    ingredient_centrality.sort(key=lambda x: x[1])

    # Determine how many to replace based on intensity
    num_to_replace = max(1, int(len(original_ingredients) * intensity * 0.6))
    to_replace = [ic[0] for ic in ingredient_centrality[:num_to_replace]]

    # Get top target ingredients sorted by frequency
    target_candidates = sorted(tgt_freq.items(), key=lambda x: -x[1])
    target_pool = [t[0] for t in target_candidates if t[0] not in original_ingredients]

    # Perform substitutions
    substitutions = []
    adapted_ingredients = list(original_ingredients)

    for i, orig_ing in enumerate(to_replace):
        if not target_pool:
            break

        # Find best molecular match from target pool
        best_match = None
        best_compat = -1.0
        for candidate in target_pool[:10]:
            compat = _molecular_compatibility(db, orig_ing, candidate)
            if compat > best_compat:
                best_compat = compat
                best_match = candidate

        if best_match:
            idx = adapted_ingredients.index(orig_ing)
            adapted_ingredients[idx] = best_match
            target_pool.remove(best_match)

            reason = "low centrality in source, high frequency in target"
            if best_compat > 0.5:
                reason += ", good molecular compatibility"

            substitutions.append({
                "original": orig_ing,
                "replacement": best_match,
                "reason": reason,
                "confidence": round(min(best_compat + 0.3, 1.0), 3),
            })

    # Compute final scores
    # Compatibility: how well adapted recipe fits target cuisine
    adapted_in_target = sum(1 for ing in adapted_ingredients if ing in tgt_freq)
    compatibility_score = adapted_in_target / len(adapted_ingredients) if adapted_ingredients else 0.0

    # Adaptation distance: how much the recipe changed
    changed = sum(1 for a, b in zip(original_ingredients, adapted_ingredients) if a != b)
    adaptation_distance = changed / len(original_ingredients) if original_ingredients else 0.0

    # Flavor coherence: average molecular compatibility of adapted ingredients
    coherence_scores = []
    for i in range(len(adapted_ingredients)):
        for j in range(i + 1, min(i + 3, len(adapted_ingredients))):
            c = _molecular_compatibility(db, adapted_ingredients[i], adapted_ingredients[j])
            coherence_scores.append(c)
    flavor_coherence = float(np.mean(coherence_scores)) if coherence_scores else 0.5

    # Store result
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
        substitutions=substitutions,
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    logger.info(f"Adaptation complete: recipe={recipe.name}, {source_cuisine}->{target_cuisine}, subs={len(substitutions)}")

    return {
        "id": result.id,
        "recipe_name": recipe.name,
        "source_cuisine": source_cuisine.lower(),
        "target_cuisine": target_cuisine.lower(),
        "intensity": intensity,
        "identity_score": round(identity_score, 4),
        "compatibility_score": round(compatibility_score, 4),
        "adaptation_distance": round(adaptation_distance, 4),
        "flavor_coherence": round(flavor_coherence, 4),
        "original_ingredients": original_ingredients,
        "adapted_ingredients": adapted_ingredients,
        "substitutions": substitutions,
        "created_at": result.created_at,
    }
