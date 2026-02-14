import numpy as np
import networkx as nx
from collections import Counter
from sqlalchemy.orm import Session
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from scipy.spatial.distance import cosine

from app.models.cuisine import Cuisine, CuisineEmbedding
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.molecule import FlavorMolecule, IngredientMolecule
from app.core.config import logger


def compute_cuisine_identity(db: Session, cuisine_name: str) -> dict:
    """Compute full identity profile for a cuisine from real DB data."""
    cuisine = db.query(Cuisine).filter(Cuisine.name == cuisine_name.lower()).first()
    if not cuisine:
        return None

    # 1. Get all recipes for this cuisine
    recipes = db.query(Recipe).filter(Recipe.cuisine_id == cuisine.id).all()
    if not recipes:
        return {"cuisine": cuisine.name, "error": "No recipes found for this cuisine"}

    recipe_ids = [r.id for r in recipes]

    # 2. Aggregate ingredient frequency
    ri_rows = (
        db.query(RecipeIngredient, Ingredient)
        .join(Ingredient, RecipeIngredient.ingredient_id == Ingredient.id)
        .filter(RecipeIngredient.recipe_id.in_(recipe_ids))
        .all()
    )

    ingredient_counter = Counter()
    ingredient_ids = set()
    for ri, ing in ri_rows:
        ingredient_counter[ing.name] += 1
        ingredient_ids.add(ing.id)

    total = sum(ingredient_counter.values())
    if total == 0:
        return {"cuisine": cuisine.name, "error": "No ingredients found"}

    # TF normalization
    ingredient_freq = {k: v / total for k, v in ingredient_counter.items()}

    # 3. Aggregate molecule distribution
    mol_rows = (
        db.query(IngredientMolecule, FlavorMolecule)
        .join(FlavorMolecule, IngredientMolecule.molecule_id == FlavorMolecule.id)
        .filter(IngredientMolecule.ingredient_id.in_(list(ingredient_ids)))
        .all()
    )

    molecule_counter = Counter()
    for im, mol in mol_rows:
        category = mol.category or mol.name
        molecule_counter[category] += im.intensity_score

    mol_total = sum(molecule_counter.values()) or 1.0
    molecule_dist = {k: round(v / mol_total, 4) for k, v in molecule_counter.most_common(20)}

    # 4. Build ingredient co-occurrence graph
    G = nx.Graph()
    for recipe in recipes:
        r_ingredients = (
            db.query(Ingredient.name)
            .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
            .filter(RecipeIngredient.recipe_id == recipe.id)
            .all()
        )
        names = [row[0] for row in r_ingredients]
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                if G.has_edge(names[i], names[j]):
                    G[names[i]][names[j]]["weight"] += 1
                else:
                    G.add_edge(names[i], names[j], weight=1)

    # 5. Compute degree centrality
    centrality = {}
    if G.number_of_nodes() > 0:
        centrality = nx.degree_centrality(G)
        centrality = {k: round(v, 4) for k, v in sorted(centrality.items(), key=lambda x: -x[1])[:30]}

    # 6. Generate feature vector (ingredient freq + molecule dist)
    all_keys = sorted(set(list(ingredient_freq.keys()) + list(molecule_dist.keys())))
    feature_vector = []
    for key in all_keys:
        feature_vector.append(ingredient_freq.get(key, 0.0) + molecule_dist.get(key, 0.0))

    # 7. Store embedding
    embedding = db.query(CuisineEmbedding).filter(CuisineEmbedding.cuisine_id == cuisine.id).first()
    if not embedding:
        embedding = CuisineEmbedding(cuisine_id=cuisine.id)
        db.add(embedding)

    embedding.embedding_vector = feature_vector
    embedding.ingredient_frequency = ingredient_freq
    embedding.molecule_distribution = molecule_dist
    embedding.centrality_scores = centrality
    embedding.pca_2d = feature_vector[:2] if len(feature_vector) >= 2 else feature_vector

    db.commit()

    top_ingredients = [
        {"name": k, "frequency": round(v, 4), "centrality": centrality.get(k, 0.0)}
        for k, v in sorted(ingredient_freq.items(), key=lambda x: -x[1])[:20]
    ]

    return {
        "cuisine": cuisine.name,
        "top_ingredients": top_ingredients,
        "molecule_distribution": molecule_dist,
        "centrality_scores": centrality,
        "embedding_2d": embedding.pca_2d,
        "ingredient_count": len(ingredient_freq),
        "recipe_count": len(recipes),
    }


def compute_all_embeddings(db: Session) -> dict:
    """Recompute embeddings for all cuisines."""
    cuisines = db.query(Cuisine).all()
    results = {}
    for c in cuisines:
        logger.info(f"Computing identity for: {c.name}")
        result = compute_cuisine_identity(db, c.name)
        if result:
            results[c.name] = result.get("ingredient_count", 0)
    return {"cuisines_processed": len(results), "details": results}


def compute_pca_2d(db: Session):
    """Run PCA on all cuisine embeddings for 2D visualization."""
    embeddings = db.query(CuisineEmbedding).all()
    if len(embeddings) < 2:
        return

    # Pad vectors to same length
    max_len = max(len(e.embedding_vector or []) for e in embeddings)
    vectors = []
    for e in embeddings:
        vec = list(e.embedding_vector or [])
        vec.extend([0.0] * (max_len - len(vec)))
        vectors.append(vec)

    X = np.array(vectors)
    if X.shape[0] < 2:
        return

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    n_components = min(2, X_scaled.shape[0], X_scaled.shape[1])
    pca = PCA(n_components=n_components)
    X_2d = pca.fit_transform(X_scaled)

    for i, emb in enumerate(embeddings):
        emb.pca_2d = X_2d[i].tolist()

    db.commit()
    logger.info(f"PCA 2D computed for {len(embeddings)} cuisines")
