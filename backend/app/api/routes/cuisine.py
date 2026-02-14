from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.cuisine import Cuisine
from app.schemas.schemas import CuisineOut, CuisineIdentityOut
from app.services.identity import compute_cuisine_identity

router = APIRouter(prefix="/cuisine", tags=["Cuisine"])


@router.get("/", response_model=List[CuisineOut])
def list_cuisines(db: Session = Depends(get_db)):
    """List all cuisines in the database."""
    return db.query(Cuisine).order_by(Cuisine.name).all()


@router.get("/{name}/identity")
def get_cuisine_identity(name: str, db: Session = Depends(get_db)):
    """Compute and return full identity profile for a cuisine."""
    result = compute_cuisine_identity(db, name)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Cuisine '{name}' not found")
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
