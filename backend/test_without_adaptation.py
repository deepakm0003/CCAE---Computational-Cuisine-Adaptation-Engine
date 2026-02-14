#!/usr/bin/env python3
"""
Test database creation without adaptation model.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models.cuisine import Cuisine, CuisineEmbedding
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.molecule import FlavorMolecule, IngredientMolecule

print("Creating tables without adaptation model...")
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Success without adaptation model!")
except Exception as e:
    print(f"❌ Error: {e}")

print("\nNow testing with adaptation model...")
try:
    from app.models.adaptation import AdaptationResult
    Base.metadata.create_all(bind=engine)
    print("✅ Success with adaptation model!")
except Exception as e:
    print(f"❌ Error with adaptation model: {e}")
