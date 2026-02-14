#!/usr/bin/env python3
"""
Initialize working database with simplified models.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, Column, Integer, String, Text, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from datetime import datetime, timezone
import pandas as pd

# Database setup
DATABASE_URL = "sqlite:///ccae_working.db"
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# Simplified models
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
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

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

def init_database():
    """Initialize the database with all tables."""
    print("🔧 Initializing CCAE database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # List tables
        print("\n📋 Created tables:")
        for table_name in Base.metadata.tables.keys():
            print(f"   - {table_name}")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def load_sample_data():
    """Load sample data for testing."""
    print("\n📊 Loading sample data...")
    db = SessionLocal()
    
    try:
        # Sample cuisines
        cuisines_data = [
            {"name": "italian", "region": "Southern Europe", "description": "Pasta, pizza, olive oil"},
            {"name": "indian", "region": "South Asia", "description": "Spices, curries, diverse flavors"},
            {"name": "mexican", "region": "North America", "description": "Chilies, corn, bold flavors"},
            {"name": "japanese", "region": "East Asia", "description": "Umami, fresh, minimalist"}
        ]
        
        for c_data in cuisines_data:
            if not db.query(Cuisine).filter(Cuisine.name == c_data["name"]).first():
                cuisine = Cuisine(**c_data)
                db.add(cuisine)
        
        # Sample ingredients
        ingredients_data = [
            {"name": "tomato", "category": "vegetable"},
            {"name": "garlic", "category": "aromatic"},
            {"name": "basil", "category": "herb"},
            {"name": "pasta", "category": "grain"},
            {"name": "cheese", "category": "dairy"},
            {"name": "chicken", "category": "protein"},
            {"name": "rice", "category": "grain"},
            {"name": "cumin", "category": "spice"},
            {"name": "turmeric", "category": "spice"},
            {"name": "chili", "category": "spice"},
            {"name": "avocado", "category": "fruit"},
            {"name": "soy sauce", "category": "sauce"},
            {"name": "salmon", "category": "protein"},
            {"name": "seaweed", "category": "vegetable"}
        ]
        
        for i_data in ingredients_data:
            if not db.query(Ingredient).filter(Ingredient.name == i_data["name"]).first():
                ingredient = Ingredient(**i_data)
                db.add(ingredient)
        
        # Sample recipes
        italian = db.query(Cuisine).filter(Cuisine.name == "italian").first()
        indian = db.query(Cuisine).filter(Cuisine.name == "indian").first()
        mexican = db.query(Cuisine).filter(Cuisine.name == "mexican").first()
        japanese = db.query(Cuisine).filter(Cuisine.name == "japanese").first()
        
        recipes_data = [
            {"name": "Spaghetti Bolognese", "cuisine_id": italian.id, "instructions": "Cook pasta, brown beef, add tomato sauce"},
            {"name": "Margherita Pizza", "cuisine_id": italian.id, "instructions": "Dough, tomato sauce, mozzarella, basil"},
            {"name": "Chicken Tikka Masala", "cuisine_id": indian.id, "instructions": "Marinate chicken, cook in creamy tomato sauce"},
            {"name": "Palak Paneer", "cuisine_id": indian.id, "instructions": "Spinach curry with cottage cheese"},
            {"name": "Beef Tacos", "cuisine_id": mexican.id, "instructions": "Seasoned beef in tortillas with toppings"},
            {"name": "Guacamole", "cuisine_id": mexican.id, "instructions": "Mashed avocado with lime and spices"},
            {"name": "Sushi Roll", "cuisine_id": japanese.id, "instructions": "Rice and fish in seaweed"},
            {"name": "Miso Soup", "cuisine_id": japanese.id, "instructions": "Fermented soybean paste with tofu"}
        ]
        
        for r_data in recipes_data:
            if not db.query(Recipe).filter(Recipe.name == r_data["name"]).first():
                recipe = Recipe(**r_data)
                db.add(recipe)
        
        db.commit()
        
        # Add recipe-ingredient relationships
        recipe_ingredients_data = [
            ("Spaghetti Bolognese", "pasta", "200g"),
            ("Spaghetti Bolognese", "tomato", "2"),
            ("Spaghetti Bolognese", "garlic", "2 cloves"),
            ("Margherita Pizza", "tomato", "1 cup"),
            ("Margherita Pizza", "cheese", "200g"),
            ("Margherita Pizza", "basil", "10 leaves"),
            ("Chicken Tikka Masala", "chicken", "500g"),
            ("Chicken Tikka Masala", "garlic", "3 cloves"),
            ("Chicken Tikka Masala", "turmeric", "1 tsp"),
            ("Palak Paneer", "spinach", "500g"),
            ("Palak Paneer", "garlic", "2 cloves"),
            ("Palak Paneer", "turmeric", "1 tsp"),
            ("Beef Tacos", "chili", "2"),
            ("Beef Tacos", "tomato", "2"),
            ("Guacamole", "avocado", "3"),
            ("Guacamole", "chili", "1"),
            ("Sushi Roll", "rice", "2 cups"),
            ("Sushi Roll", "salmon", "200g"),
            ("Sushi Roll", "seaweed", "2 sheets"),
            ("Miso Soup", "soy sauce", "2 tbsp"),
            ("Miso Soup", "seaweed", "10g")
        ]
        
        for recipe_name, ingredient_name, quantity in recipe_ingredients_data:
            recipe = db.query(Recipe).filter(Recipe.name == recipe_name).first()
            ingredient = db.query(Ingredient).filter(Ingredient.name == ingredient_name).first()
            
            if recipe and ingredient:
                existing = db.query(RecipeIngredient).filter(
                    RecipeIngredient.recipe_id == recipe.id,
                    RecipeIngredient.ingredient_id == ingredient.id
                ).first()
                
                if not existing:
                    ri = RecipeIngredient(
                        recipe_id=recipe.id,
                        ingredient_id=ingredient.id,
                        quantity=quantity
                    )
                    db.add(ri)
        
        db.commit()
        print("✅ Sample data loaded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading sample data: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if init_database():
        load_sample_data()
        print("\n🎉 Database ready for use!")
    else:
        print("\n💥 Database initialization failed!")
        sys.exit(1)
