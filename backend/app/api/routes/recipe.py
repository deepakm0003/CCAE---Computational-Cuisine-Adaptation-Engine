from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.cuisine import Cuisine
from app.schemas.schemas import RecipeOut

router = APIRouter(prefix="/recipe", tags=["Recipe"])


@router.get("/", response_model=List[RecipeOut])
def list_recipes(cuisine: str = None, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    """List recipes, optionally filtered by cuisine."""
    query = db.query(Recipe)
    if cuisine:
        c = db.query(Cuisine).filter(Cuisine.name == cuisine.lower()).first()
        if c:
            query = query.filter(Recipe.cuisine_id == c.id)
    recipes = query.offset(offset).limit(limit).all()

    results = []
    for r in recipes:
        ings = (
            db.query(Ingredient.name)
            .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
            .filter(RecipeIngredient.recipe_id == r.id)
            .all()
        )
        cuisine_obj = db.query(Cuisine).filter(Cuisine.id == r.cuisine_id).first()
        results.append(RecipeOut(
            id=r.id,
            name=r.name,
            cuisine_id=r.cuisine_id,
            instructions=r.instructions,
            created_at=r.created_at,
            ingredients=[i[0] for i in ings],
            cuisine_name=cuisine_obj.name if cuisine_obj else None,
        ))
    return results


@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Get a single recipe by ID."""
    r = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recipe not found")

    ings = (
        db.query(Ingredient.name)
        .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
        .filter(RecipeIngredient.recipe_id == r.id)
        .all()
    )
    cuisine_obj = db.query(Cuisine).filter(Cuisine.id == r.cuisine_id).first()
    return RecipeOut(
        id=r.id,
        name=r.name,
        cuisine_id=r.cuisine_id,
        instructions=r.instructions,
        created_at=r.created_at,
        ingredients=[i[0] for i in ings],
        cuisine_name=cuisine_obj.name if cuisine_obj else None,
    )
