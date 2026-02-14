import time
import numpy as np
from collections import defaultdict
from sklearn.decomposition import TruncatedSVD
from sqlalchemy.orm import Session

from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.recipe import Recipe
from app.core.config import logger

# In-memory model state
_model_state = {
    "trained": False,
    "model_type": None,
    "last_trained": None,
    "dimensions": None,
    "ingredients_count": None,
    "embeddings": {},  # ingredient_name -> vector
}


def get_model_status() -> dict:
    return {
        "model_trained": _model_state["trained"],
        "model_type": _model_state["model_type"],
        "last_trained": _model_state["last_trained"],
        "dimensions": _model_state["dimensions"],
        "ingredients_count": _model_state["ingredients_count"],
    }


def get_ingredient_embedding(name: str) -> list:
    return _model_state["embeddings"].get(name.lower(), [])


def train_ingredient_embeddings(db: Session, dimensions: int = 50) -> dict:
    """
    Train ingredient embeddings using co-occurrence matrix + Truncated SVD.
    
    1. Build co-occurrence matrix from recipe-ingredient relationships
    2. Apply TF-IDF-like weighting
    3. Reduce dimensionality with Truncated SVD
    4. Store embeddings in memory
    """
    start = time.time()

    # Get all ingredients
    ingredients = db.query(Ingredient).all()
    if len(ingredients) < 5:
        return {"status": "error", "message": f"Not enough ingredients ({len(ingredients)}). Need at least 5."}

    ing_index = {ing.name: i for i, ing in enumerate(ingredients)}
    n = len(ingredients)

    logger.info(f"Training embeddings for {n} ingredients...")

    # Build co-occurrence matrix
    cooccurrence = np.zeros((n, n), dtype=float)

    recipes = db.query(Recipe).all()
    for recipe in recipes:
        ri_rows = (
            db.query(Ingredient.name)
            .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
            .filter(RecipeIngredient.recipe_id == recipe.id)
            .all()
        )
        names = [r[0] for r in ri_rows if r[0] in ing_index]

        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                idx_i = ing_index[names[i]]
                idx_j = ing_index[names[j]]
                cooccurrence[idx_i][idx_j] += 1.0
                cooccurrence[idx_j][idx_i] += 1.0

    # Apply log weighting (PPMI-like)
    total = cooccurrence.sum()
    if total == 0:
        return {"status": "error", "message": "No co-occurrence data found. Upload recipes first."}

    row_sums = cooccurrence.sum(axis=1)
    col_sums = cooccurrence.sum(axis=0)

    for i in range(n):
        for j in range(n):
            if cooccurrence[i][j] > 0 and row_sums[i] > 0 and col_sums[j] > 0:
                pmi = np.log2((cooccurrence[i][j] * total) / (row_sums[i] * col_sums[j]) + 1e-10)
                cooccurrence[i][j] = max(0, pmi)  # PPMI
            else:
                cooccurrence[i][j] = 0.0

    # Truncated SVD
    actual_dims = min(dimensions, n - 1, cooccurrence.shape[1] - 1)
    if actual_dims < 2:
        actual_dims = 2

    svd = TruncatedSVD(n_components=actual_dims, random_state=42)
    embeddings_matrix = svd.fit_transform(cooccurrence)

    # Normalize
    norms = np.linalg.norm(embeddings_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings_matrix = embeddings_matrix / norms

    # Store in memory
    _model_state["embeddings"] = {}
    for ing in ingredients:
        idx = ing_index[ing.name]
        _model_state["embeddings"][ing.name] = embeddings_matrix[idx].tolist()

    elapsed = round(time.time() - start, 2)

    _model_state["trained"] = True
    _model_state["model_type"] = "TruncatedSVD (PPMI)"
    _model_state["last_trained"] = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    _model_state["dimensions"] = actual_dims
    _model_state["ingredients_count"] = n

    logger.info(f"Training complete: {n} ingredients, {actual_dims}D, {elapsed}s")

    return {
        "status": "success",
        "model_type": "TruncatedSVD (PPMI)",
        "dimensions": actual_dims,
        "ingredients_trained": n,
        "training_time_seconds": elapsed,
    }
