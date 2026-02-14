"""
MVP Identity Engine with Exact Mathematical Formulas

Formulas Implemented:
1. TF (Term Frequency): TF_i = count_i / total_count
2. Molecular Distribution: M_j = Σ(TF_i × molecule_i,j)
3. Centrality: C(i) = deg(i) / (N-1)
4. Cosine Similarity: cos(A,B) = (A·B) / (||A|| × ||B||)
5. Identity Score: IS = cos(V_r, V_source)
6. Compatibility Score: CS = cos(V_r, V_target)
"""

import numpy as np
import networkx as nx
from collections import Counter, defaultdict
from sqlalchemy.orm import Session
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from scipy.spatial.distance import cosine
from typing import Dict, List, Tuple, Any

from app.models.cuisine import Cuisine, CuisineEmbedding
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.molecule import FlavorMolecule, IngredientMolecule
from app.core.config import logger


def compute_term_frequency(ingredients: List[str]) -> Dict[str, float]:
    """
    Compute TF (Term Frequency) for ingredients.
    
    Formula: TF_i = count_i / total_count
    """
    total = len(ingredients)
    if total == 0:
        return {}
    
    counter = Counter(ingredients)
    return {ingredient: count / total for ingredient, count in counter.items()}


def compute_molecular_distribution(
    ingredient_frequencies: Dict[str, float],
    db: Session
) -> Dict[str, float]:
    """
    Compute molecular distribution across ingredients.
    
    Formula: M_j = Σ(TF_i × molecule_i,j)
    """
    molecule_scores = defaultdict(float)
    
    # Get all ingredient names
    ingredient_names = list(ingredient_frequencies.keys())
    
    # Query molecules for these ingredients
    ingredient_objs = db.query(Ingredient).filter(
        Ingredient.name.in_(ingredient_names)
    ).all()
    
    ingredient_map = {ing.name: ing.id for ing in ingredient_objs}
    
    # Get molecule mappings
    mappings = db.query(IngredientMolecule, FlavorMolecule).join(
        FlavorMolecule, IngredientMolecule.molecule_id == FlavorMolecule.id
    ).filter(
        IngredientMolecule.ingredient_id.in_(list(ingredient_map.values()))
    ).all()
    
    for im, molecule in mappings:
        # Find which ingredient this belongs to
        for ing_name, ing_id in ingredient_map.items():
            if ing_id == im.ingredient_id:
                tf = ingredient_frequencies.get(ing_name, 0.0)
                molecule_scores[molecule.name] += tf * im.intensity_score
                break
    
    # Normalize
    total = sum(molecule_scores.values())
    if total > 0:
        molecule_scores = {k: v / total for k, v in molecule_scores.items()}
    
    return dict(molecule_scores)


def compute_centrality_scores(recipes: List[Recipe], db: Session) -> Dict[str, float]:
    """
    Compute degree centrality for ingredients.
    
    Formula: C(i) = deg(i) / (N-1)
    """
    G = nx.Graph()
    
    # Build co-occurrence graph
    for recipe in recipes:
        ingredients = (
            db.query(Ingredient.name)
            .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
            .filter(RecipeIngredient.recipe_id == recipe.id)
            .all()
        )
        
        names = [row[0] for row in ingredients]
        
        # Add edges between co-occurring ingredients
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                if G.has_edge(names[i], names[j]):
                    G[names[i]][names[j]]["weight"] += 1
                else:
                    G.add_edge(names[i], names[j], weight=1)
    
    # Compute degree centrality
    if G.number_of_nodes() > 1:
        centrality = nx.degree_centrality(G)
        return {k: round(v, 4) for k, v in centrality.items()}
    
    return {}


def create_cuisine_vector(
    ingredient_frequencies: Dict[str, float],
    molecular_distribution: Dict[str, float]
) -> np.ndarray:
    """
    Create cuisine embedding vector by stacking ingredient and molecule vectors.
    """
    # Combine all features
    all_features = set(ingredient_frequencies.keys()) | set(molecular_distribution.keys())
    
    vector = []
    for feature in all_features:
        ing_val = ingredient_frequencies.get(feature, 0.0)
        mol_val = molecular_distribution.get(feature, 0.0)
        vector.append(ing_val + mol_val)
    
    return np.array(vector, dtype=float)


def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Compute cosine similarity between two vectors.
    
    Formula: cos(A,B) = (A·B) / (||A|| × ||B||)
    """
    if vec_a is None or vec_b is None:
        return 0.0
    
    # Pad vectors to same length
    max_len = max(len(vec_a), len(vec_b))
    a_padded = np.zeros(max_len)
    b_padded = np.zeros(max_len)
    a_padded[:len(vec_a)] = vec_a
    b_padded[:len(vec_b)] = vec_b
    
    # Compute cosine similarity
    norm_a = np.linalg.norm(a_padded)
    norm_b = np.linalg.norm(b_padded)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return float(np.dot(a_padded, b_padded) / (norm_a * norm_b))


def compute_pca_2d(vectors: List[np.ndarray]) -> List[List[float]]:
    """
    Compute 2D PCA projection of vectors for visualization.
    """
    if len(vectors) < 2:
        return [[0.0, 0.0] for _ in vectors]
    
    # Pad all vectors to same length
    max_len = max(len(v) for v in vectors)
    matrix = []
    
    for v in vectors:
        padded = np.zeros(max_len)
        padded[:len(v)] = v
        matrix.append(padded)
    
    X = np.array(matrix)
    
    # Standardize and apply PCA
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    n_components = min(2, X_scaled.shape[0], X_scaled.shape[1])
    pca = PCA(n_components=n_components)
    X_2d = pca.fit_transform(X_scaled)
    
    return X_2d.tolist()


def compute_cuisine_identity(db: Session, cuisine_name: str) -> Dict[str, Any]:
    """
    Compute complete identity profile for a cuisine using exact mathematical formulas.
    """
    logger.info(f"Computing identity for cuisine: {cuisine_name}")
    
    # Get cuisine
    cuisine = db.query(Cuisine).filter(Cuisine.name == cuisine_name.lower()).first()
    if not cuisine:
        return {"error": f"Cuisine '{cuisine_name}' not found"}
    
    # Get all recipes for this cuisine
    recipes = db.query(Recipe).filter(Recipe.cuisine_id == cuisine.id).all()
    if not recipes:
        return {"error": f"No recipes found for cuisine '{cuisine_name}'"}
    
    # Get all ingredients for these recipes
    recipe_ids = [r.id for r in recipes]
    ingredient_rows = (
        db.query(Ingredient.name)
        .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
        .filter(RecipeIngredient.recipe_id.in_(recipe_ids))
        .all()
    )
    
    all_ingredients = [row[0] for row in ingredient_rows]
    
    if not all_ingredients:
        return {"error": f"No ingredients found for cuisine '{cuisine_name}'"}
    
    # 1. Compute Term Frequency (TF)
    ingredient_frequencies = compute_term_frequency(all_ingredients)
    
    # 2. Compute Molecular Distribution
    molecular_distribution = compute_molecular_distribution(ingredient_frequencies, db)
    
    # 3. Compute Centrality Scores
    centrality_scores = compute_centrality_scores(recipes, db)
    
    # 4. Create Cuisine Embedding Vector
    cuisine_vector = create_cuisine_vector(ingredient_frequencies, molecular_distribution)
    
    # 5. Store in database
    embedding = db.query(CuisineEmbedding).filter(CuisineEmbedding.cuisine_id == cuisine.id).first()
    if not embedding:
        embedding = CuisineEmbedding(cuisine_id=cuisine.id)
        db.add(embedding)
    
    embedding.embedding_vector = cuisine_vector.tolist()
    embedding.ingredient_frequency = ingredient_frequencies
    embedding.molecule_distribution = molecular_distribution
    embedding.centrality_scores = centrality_scores
    
    # Compute PCA 2D (will be updated when all cuisines are computed)
    embedding.pca_2d = cuisine_vector[:2].tolist() if len(cuisine_vector) >= 2 else [0.0, 0.0]
    
    db.commit()
    
    # Prepare response
    top_ingredients = [
        {
            "name": name,
            "frequency": round(freq, 4),
            "centrality": centrality_scores.get(name, 0.0)
        }
        for name, freq in sorted(ingredient_frequencies.items(), key=lambda x: -x[1])[:20]
    ]
    
    return {
        "cuisine": cuisine.name,
        "recipe_count": len(recipes),
        "ingredient_count": len(ingredient_frequencies),
        "top_ingredients": top_ingredients,
        "molecule_distribution": {k: round(v, 4) for k, v in molecular_distribution.items()},
        "centrality_scores": centrality_scores,
        "embedding_2d": embedding.pca_2d,
        "vector_dimension": len(cuisine_vector)
    }


def compute_all_cuisine_identities(db: Session) -> Dict[str, Any]:
    """
    Compute identities for all cuisines and update PCA 2D projections.
    """
    logger.info("Computing identities for all cuisines...")
    
    cuisines = db.query(Cuisine).all()
    results = {}
    vectors = []
    cuisine_names = []
    
    # Compute identity for each cuisine
    for cuisine in cuisines:
        result = compute_cuisine_identity(db, cuisine.name)
        if "error" not in result:
            results[cuisine.name] = {
                "ingredient_count": result["ingredient_count"],
                "recipe_count": result["recipe_count"]
            }
            
            # Collect vectors for PCA
            embedding = db.query(CuisineEmbedding).filter(
                CuisineEmbedding.cuisine_id == cuisine.id
            ).first()
            if embedding and embedding.embedding_vector:
                vectors.append(np.array(embedding.embedding_vector))
                cuisine_names.append(cuisine.name)
    
    # Update PCA 2D for all cuisines
    if len(vectors) > 1:
        pca_2d_results = compute_pca_2d(vectors)
        
        for i, cuisine_name in enumerate(cuisine_names):
            cuisine = db.query(Cuisine).filter(Cuisine.name == cuisine_name).first()
            embedding = db.query(CuisineEmbedding).filter(
                CuisineEmbedding.cuisine_id == cuisine.id
            ).first()
            if embedding:
                embedding.pca_2d = pca_2d_results[i]
        
        db.commit()
        logger.info(f"Updated PCA 2D for {len(cuisine_names)} cuisines")
    
    return {
        "cuisines_processed": len(results),
        "details": results
    }
