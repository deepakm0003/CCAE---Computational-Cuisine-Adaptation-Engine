import pandas as pd
import io
from sqlalchemy.orm import Session
from app.models.cuisine import Cuisine
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.molecule import FlavorMolecule, IngredientMolecule
from app.core.config import logger


def normalize_name(name: str) -> str:
    return name.strip().lower().replace("_", " ")


def get_or_create_cuisine(db: Session, name: str) -> Cuisine:
    name = normalize_name(name)
    cuisine = db.query(Cuisine).filter(Cuisine.name == name).first()
    if not cuisine:
        cuisine = Cuisine(name=name)
        db.add(cuisine)
        db.flush()
    return cuisine


def get_or_create_ingredient(db: Session, name: str) -> Ingredient:
    name = normalize_name(name)
    ingredient = db.query(Ingredient).filter(Ingredient.name == name).first()
    if not ingredient:
        ingredient = Ingredient(name=name)
        db.add(ingredient)
        db.flush()
    return ingredient


def get_or_create_molecule(db: Session, name: str, category: str = None) -> FlavorMolecule:
    name = normalize_name(name)
    molecule = db.query(FlavorMolecule).filter(FlavorMolecule.name == name).first()
    if not molecule:
        molecule = FlavorMolecule(name=name, category=category)
        db.add(molecule)
        db.flush()
    return molecule


def ingest_recipes_csv(db: Session, file_content: bytes, filename: str) -> dict:
    """
    Parse CSV with format: recipe_name,cuisine,ingredient1|ingredient2|ingredient3
    Also supports: recipe_name,cuisine,ingredients,instructions
    """
    errors = []
    recipes_inserted = 0
    ingredients_inserted = 0
    cuisines_inserted = 0
    mappings_created = 0

    try:
        content = file_content.decode("utf-8")
        df = pd.read_csv(io.StringIO(content))
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        logger.info(f"Parsing CSV: {filename}, columns: {list(df.columns)}, rows: {len(df)}")

        # Detect column names
        recipe_col = None
        cuisine_col = None
        ingredients_col = None
        instructions_col = None

        for col in df.columns:
            if "recipe" in col or "name" in col:
                recipe_col = col
            elif "cuisine" in col or "region" in col:
                cuisine_col = col
            elif "ingredient" in col:
                ingredients_col = col
            elif "instruction" in col or "step" in col or "method" in col:
                instructions_col = col

        if not recipe_col or not cuisine_col:
            return {"status": "error", "errors": [f"CSV must have recipe/name and cuisine columns. Found: {list(df.columns)}"]}

        existing_cuisines = {c.name for c in db.query(Cuisine).all()}
        existing_ingredients = {i.name for i in db.query(Ingredient).all()}

        for idx, row in df.iterrows():
            try:
                recipe_name = str(row[recipe_col]).strip()
                cuisine_name = normalize_name(str(row[cuisine_col]))

                if not recipe_name or recipe_name == "nan":
                    continue

                # Cuisine
                if cuisine_name not in existing_cuisines:
                    cuisines_inserted += 1
                    existing_cuisines.add(cuisine_name)
                cuisine = get_or_create_cuisine(db, cuisine_name)

                # Recipe
                recipe = Recipe(
                    name=recipe_name,
                    cuisine_id=cuisine.id,
                    instructions=str(row[instructions_col]).strip() if instructions_col and pd.notna(row.get(instructions_col)) else None,
                )
                db.add(recipe)
                db.flush()
                recipes_inserted += 1

                # Ingredients
                if ingredients_col and pd.notna(row.get(ingredients_col)):
                    raw = str(row[ingredients_col])
                    sep = "|" if "|" in raw else ","
                    ingredient_names = [s.strip() for s in raw.split(sep) if s.strip()]

                    for ing_name in ingredient_names:
                        ing_name_norm = normalize_name(ing_name)
                        if ing_name_norm not in existing_ingredients:
                            ingredients_inserted += 1
                            existing_ingredients.add(ing_name_norm)
                        ingredient = get_or_create_ingredient(db, ing_name)
                        ri = RecipeIngredient(recipe_id=recipe.id, ingredient_id=ingredient.id)
                        db.add(ri)
                        mappings_created += 1

            except Exception as e:
                errors.append(f"Row {idx}: {str(e)}")

        db.commit()
        logger.info(f"Ingestion complete: {recipes_inserted} recipes, {ingredients_inserted} ingredients, {cuisines_inserted} cuisines")

    except Exception as e:
        db.rollback()
        logger.error(f"Ingestion failed: {str(e)}")
        return {"status": "error", "errors": [str(e)]}

    return {
        "status": "success",
        "recipes_inserted": recipes_inserted,
        "ingredients_inserted": ingredients_inserted,
        "cuisines_inserted": cuisines_inserted,
        "mappings_created": mappings_created,
        "errors": errors,
    }


def ingest_recipes_json(db: Session, file_content: bytes, filename: str) -> dict:
    """Parse JSON array of recipes: [{name, cuisine, ingredients: [...], instructions}]"""
    import json

    errors = []
    recipes_inserted = 0
    ingredients_inserted = 0
    cuisines_inserted = 0
    mappings_created = 0

    try:
        data = json.loads(file_content.decode("utf-8"))
        if not isinstance(data, list):
            data = [data]

        logger.info(f"Parsing JSON: {filename}, records: {len(data)}")

        for idx, item in enumerate(data):
            try:
                recipe_name = item.get("name", item.get("recipe_name", "")).strip()
                cuisine_name = item.get("cuisine", item.get("cuisine_name", "")).strip()
                ingredients_list = item.get("ingredients", [])
                instructions = item.get("instructions", "")

                if not recipe_name or not cuisine_name:
                    errors.append(f"Record {idx}: missing name or cuisine")
                    continue

                cuisine = get_or_create_cuisine(db, cuisine_name)
                cuisines_inserted += 1

                recipe = Recipe(name=recipe_name, cuisine_id=cuisine.id, instructions=instructions)
                db.add(recipe)
                db.flush()
                recipes_inserted += 1

                for ing in ingredients_list:
                    ing_name = ing if isinstance(ing, str) else ing.get("name", "")
                    quantity = ing.get("quantity", "") if isinstance(ing, dict) else ""
                    if not ing_name.strip():
                        continue
                    ingredient = get_or_create_ingredient(db, ing_name)
                    ingredients_inserted += 1
                    ri = RecipeIngredient(recipe_id=recipe.id, ingredient_id=ingredient.id, quantity=quantity)
                    db.add(ri)
                    mappings_created += 1

            except Exception as e:
                errors.append(f"Record {idx}: {str(e)}")

        db.commit()

    except Exception as e:
        db.rollback()
        return {"status": "error", "errors": [str(e)]}

    return {
        "status": "success",
        "recipes_inserted": recipes_inserted,
        "ingredients_inserted": ingredients_inserted,
        "cuisines_inserted": cuisines_inserted,
        "mappings_created": mappings_created,
        "errors": errors,
    }


def ingest_molecules_csv(db: Session, file_content: bytes, filename: str) -> dict:
    """Parse CSV: ingredient,molecule,category,intensity"""
    errors = []
    molecules_inserted = 0
    mappings_created = 0

    try:
        content = file_content.decode("utf-8")
        df = pd.read_csv(io.StringIO(content))
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        logger.info(f"Parsing molecules CSV: {filename}, columns: {list(df.columns)}, rows: {len(df)}")

        ingredient_col = None
        molecule_col = None
        category_col = None
        intensity_col = None

        for col in df.columns:
            if "ingredient" in col:
                ingredient_col = col
            elif "molecule" in col or "compound" in col:
                molecule_col = col
            elif "category" in col or "type" in col:
                category_col = col
            elif "intensity" in col or "score" in col:
                intensity_col = col

        if not ingredient_col or not molecule_col:
            return {"status": "error", "molecules_inserted": 0, "mappings_created": 0,
                    "errors": [f"CSV must have ingredient and molecule columns. Found: {list(df.columns)}"]}

        for idx, row in df.iterrows():
            try:
                ing_name = str(row[ingredient_col]).strip()
                mol_name = str(row[molecule_col]).strip()
                category = str(row[category_col]).strip() if category_col and pd.notna(row.get(category_col)) else None
                intensity = float(row[intensity_col]) if intensity_col and pd.notna(row.get(intensity_col)) else 1.0

                if not ing_name or ing_name == "nan" or not mol_name or mol_name == "nan":
                    continue

                ingredient = get_or_create_ingredient(db, ing_name)
                molecule = get_or_create_molecule(db, mol_name, category)
                molecules_inserted += 1

                existing = db.query(IngredientMolecule).filter(
                    IngredientMolecule.ingredient_id == ingredient.id,
                    IngredientMolecule.molecule_id == molecule.id,
                ).first()

                if not existing:
                    im = IngredientMolecule(
                        ingredient_id=ingredient.id,
                        molecule_id=molecule.id,
                        intensity_score=intensity,
                    )
                    db.add(im)
                    mappings_created += 1

            except Exception as e:
                errors.append(f"Row {idx}: {str(e)}")

        db.commit()

    except Exception as e:
        db.rollback()
        return {"status": "error", "molecules_inserted": 0, "mappings_created": 0, "errors": [str(e)]}

    return {
        "status": "success",
        "molecules_inserted": molecules_inserted,
        "mappings_created": mappings_created,
        "errors": errors,
    }
