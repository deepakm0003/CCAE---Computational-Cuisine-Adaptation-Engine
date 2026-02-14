import numpy as np
from sqlalchemy.orm import Session
from app.models.cuisine import Cuisine, CuisineEmbedding
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.molecule import IngredientMolecule, FlavorMolecule
from app.models.recipe import Recipe
from app.services.adaptation import _cosine_similarity, _get_cuisine_vector
from app.core.config import logger


def get_compatibility_preview(db: Session, source_cuisine: str, target_cuisine: str) -> dict:
    """Compute compatibility between two cuisines."""
    src, src_vec, src_emb = _get_cuisine_vector(db, source_cuisine)
    tgt, tgt_vec, tgt_emb = _get_cuisine_vector(db, target_cuisine)

    if not src or not tgt:
        return {"error": "One or both cuisines not found"}

    compatibility = _cosine_similarity(src_vec, tgt_vec)

    # Shared ingredients
    src_freq = set((src_emb.ingredient_frequency or {}).keys()) if src_emb else set()
    tgt_freq = set((tgt_emb.ingredient_frequency or {}).keys()) if tgt_emb else set()
    shared_ingredients = len(src_freq & tgt_freq)

    # Shared molecules
    src_mol = set((src_emb.molecule_distribution or {}).keys()) if src_emb else set()
    tgt_mol = set((tgt_emb.molecule_distribution or {}).keys()) if tgt_emb else set()
    shared_molecules = len(src_mol & tgt_mol)

    return {
        "source_cuisine": source_cuisine.lower(),
        "target_cuisine": target_cuisine.lower(),
        "compatibility_score": round(compatibility, 4),
        "shared_ingredients": shared_ingredients,
        "shared_molecules": shared_molecules,
    }


def get_adaptation_impact(db: Session, source_cuisine: str, target_cuisine: str, intensity: float) -> dict:
    """Estimate adaptation impact before running full adaptation."""
    src, src_vec, src_emb = _get_cuisine_vector(db, source_cuisine)
    tgt, tgt_vec, tgt_emb = _get_cuisine_vector(db, target_cuisine)

    if not src or not tgt:
        return {"error": "One or both cuisines not found"}

    identity_sim = _cosine_similarity(src_vec, tgt_vec)

    # Estimate identity change based on distance and intensity
    distance = 1.0 - identity_sim
    estimated_identity_change = round(distance * intensity, 4)
    estimated_flavor_shift = round(distance * intensity * 0.8, 4)

    # Find risk ingredients (low centrality in source, absent in target)
    src_centrality = dict(src_emb.centrality_scores or {}) if src_emb else {}
    tgt_freq = set((tgt_emb.ingredient_frequency or {}).keys()) if tgt_emb else set()

    risk_ingredients = [
        ing for ing, cent in sorted(src_centrality.items(), key=lambda x: x[1])[:10]
        if ing not in tgt_freq
    ][:5]

    return {
        "estimated_identity_change": estimated_identity_change,
        "estimated_flavor_shift": estimated_flavor_shift,
        "risk_ingredients": risk_ingredients,
    }


def get_ingredient_risk(db: Session, cuisine_name: str) -> list:
    """Assess risk level of each ingredient in a cuisine based on centrality."""
    cuisine = db.query(Cuisine).filter(Cuisine.name == cuisine_name.lower()).first()
    if not cuisine:
        return []

    emb = db.query(CuisineEmbedding).filter(CuisineEmbedding.cuisine_id == cuisine.id).first()
    if not emb or not emb.centrality_scores:
        return []

    centrality = emb.centrality_scores
    values = list(centrality.values())
    if not values:
        return []

    p25 = float(np.percentile(values, 25))
    p75 = float(np.percentile(values, 75))

    results = []
    for ing, cent in sorted(centrality.items(), key=lambda x: -x[1]):
        if cent >= p75:
            risk_level = "high"
            replaceable = False
        elif cent >= p25:
            risk_level = "medium"
            replaceable = True
        else:
            risk_level = "low"
            replaceable = True

        results.append({
            "ingredient": ing,
            "centrality": round(cent, 4),
            "risk_level": risk_level,
            "replaceable": replaceable,
        })

    return results
