from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.preview import get_compatibility_preview, get_adaptation_impact, get_ingredient_risk
from app.schemas.schemas import CompatibilityPreview, AdaptationImpact, IngredientRisk

router = APIRouter(prefix="/preview", tags=["Preview"])


@router.get("/compatibility", response_model=CompatibilityPreview)
def compatibility(
    source: str = Query(..., description="Source cuisine name"),
    target: str = Query(..., description="Target cuisine name"),
    db: Session = Depends(get_db),
):
    """Preview compatibility between two cuisines."""
    return get_compatibility_preview(db, source, target)


@router.get("/adaptation-impact", response_model=AdaptationImpact)
def adaptation_impact(
    source: str = Query(...),
    target: str = Query(...),
    intensity: float = Query(0.5, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
):
    """Estimate adaptation impact before running full adaptation."""
    return get_adaptation_impact(db, source, target, intensity)


@router.get("/ingredient-risk", response_model=List[IngredientRisk])
def ingredient_risk(
    cuisine: str = Query(..., description="Cuisine name"),
    db: Session = Depends(get_db),
):
    """Assess ingredient risk levels for a cuisine."""
    return get_ingredient_risk(db, cuisine)
