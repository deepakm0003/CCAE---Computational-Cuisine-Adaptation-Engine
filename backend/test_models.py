#!/usr/bin/env python3
"""
Test importing models individually to find the issue.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Testing model imports...")

try:
    print("1. Importing config...")
    from app.core.config import DATABASE_URL
    print("   ✅ Config OK")
except Exception as e:
    print(f"   ❌ Config failed: {e}")
    sys.exit(1)

try:
    print("2. Importing database...")
    from app.core.database import engine, Base
    print("   ✅ Database OK")
except Exception as e:
    print(f"   ❌ Database failed: {e}")
    sys.exit(1)

try:
    print("3. Importing cuisine model...")
    from app.models.cuisine import Cuisine, CuisineEmbedding
    print("   ✅ Cuisine model OK")
except Exception as e:
    print(f"   ❌ Cuisine model failed: {e}")
    sys.exit(1)

try:
    print("4. Importing recipe model...")
    from app.models.recipe import Recipe
    print("   ✅ Recipe model OK")
except Exception as e:
    print(f"   ❌ Recipe model failed: {e}")
    sys.exit(1)

try:
    print("5. Importing ingredient model...")
    from app.models.ingredient import Ingredient, RecipeIngredient
    print("   ✅ Ingredient model OK")
except Exception as e:
    print(f"   ❌ Ingredient model failed: {e}")
    sys.exit(1)

try:
    print("6. Importing molecule model...")
    from app.models.molecule import FlavorMolecule, IngredientMolecule
    print("   ✅ Molecule model OK")
except Exception as e:
    print(f"   ❌ Molecule model failed: {e}")
    sys.exit(1)

try:
    print("7. Importing adaptation model...")
    from app.models.adaptation import AdaptationResult
    print("   ✅ Adaptation model OK")
except Exception as e:
    print(f"   ❌ Adaptation model failed: {e}")
    sys.exit(1)

try:
    print("8. Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("   ✅ All tables created successfully!")
except Exception as e:
    print(f"   ❌ Table creation failed: {e}")
    sys.exit(1)

print("\n🎉 All models imported and tables created successfully!")
