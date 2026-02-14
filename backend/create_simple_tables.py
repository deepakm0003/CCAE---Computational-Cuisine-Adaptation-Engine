#!/usr/bin/env python3
"""
Create simplified tables without relationships to isolate the issue.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, Column, Integer, String, Text, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime, timezone

DATABASE_URL = "sqlite:///C:/Users/deepa/OneDrive/Desktop/ccae/backend/ccae_simple.db"
engine = create_engine(DATABASE_URL, echo=False)

class Base(DeclarativeBase):
    pass

# Simplified models without relationships
class Cuisine(Base):
    __tablename__ = "cuisines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    region = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    cuisine_id = Column(Integer, ForeignKey("cuisines.id"), nullable=False)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity = Column(String(100), nullable=True)

class FlavorMolecule(Base):
    __tablename__ = "flavor_molecules"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=True)
    formula = Column(String(100), nullable=True)
    flavor_descriptor = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class IngredientMolecule(Base):
    __tablename__ = "ingredient_molecules"
    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    molecule_id = Column(Integer, ForeignKey("flavor_molecules.id"), nullable=False)
    intensity_score = Column(Float, default=0.0)

class CuisineEmbedding(Base):
    __tablename__ = "cuisine_embeddings"
    id = Column(Integer, primary_key=True, index=True)
    cuisine_id = Column(Integer, ForeignKey("cuisines.id"), unique=True, nullable=False)
    embedding_vector = Column(JSON, nullable=True)
    ingredient_frequency = Column(JSON, nullable=True)
    molecule_distribution = Column(JSON, nullable=True)
    centrality_scores = Column(JSON, nullable=True)
    pca_2d = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AdaptationResult(Base):
    __tablename__ = "adaptation_results"
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    source_cuisine = Column(String(100), nullable=False)
    target_cuisine = Column(String(100), nullable=False)
    intensity = Column(Float, default=0.5)
    identity_score = Column(Float, nullable=True)
    compatibility_score = Column(Float, nullable=True)
    adaptation_distance = Column(Float, nullable=True)
    flavor_coherence = Column(Float, nullable=True)
    adapted_ingredients = Column(JSON, nullable=True)
    original_ingredients = Column(JSON, nullable=True)
    substitutions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

def main():
    print("Creating simplified database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All simplified tables created successfully!")
        
        print("\nCreated tables:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
        return 0
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
