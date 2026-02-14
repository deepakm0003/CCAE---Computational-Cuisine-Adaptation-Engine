import numpy as np
from sqlalchemy.orm import Session
from app.models.cuisine import Cuisine, CuisineEmbedding
from app.services.adaptation import _cosine_similarity
from app.core.config import logger

# In-memory cache
_cache = {"matrix": None, "cuisines": None}


def compute_transferability_matrix(db: Session) -> dict:
    """Compute pairwise cosine similarity between all cuisine embeddings."""
    embeddings = (
        db.query(CuisineEmbedding, Cuisine)
        .join(Cuisine, CuisineEmbedding.cuisine_id == Cuisine.id)
        .filter(CuisineEmbedding.embedding_vector.isnot(None))
        .all()
    )

    if len(embeddings) < 2:
        return {"cuisines": [], "matrix": []}

    cuisine_names = []
    vectors = []

    max_len = max(len(e.embedding_vector or []) for e, _ in embeddings)

    for emb, cuisine in embeddings:
        cuisine_names.append(cuisine.name)
        vec = list(emb.embedding_vector or [])
        vec.extend([0.0] * (max_len - len(vec)))
        vectors.append(np.array(vec, dtype=float))

    n = len(vectors)
    matrix = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i == j:
                matrix[i][j] = 1.0
            elif j > i:
                sim = _cosine_similarity(vectors[i], vectors[j])
                matrix[i][j] = round(sim, 4)
                matrix[j][i] = round(sim, 4)

    # Cache
    _cache["matrix"] = matrix
    _cache["cuisines"] = cuisine_names

    logger.info(f"Transferability matrix computed: {n}x{n}")
    return {"cuisines": cuisine_names, "matrix": matrix}


def get_cached_transferability() -> dict:
    """Return cached matrix if available."""
    if _cache["matrix"] is not None:
        return {"cuisines": _cache["cuisines"], "matrix": _cache["matrix"]}
    return None


def clear_cache():
    _cache["matrix"] = None
    _cache["cuisines"] = None
