from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import AdaptationRequest
from app.services.adaptation import adapt_recipe

router = APIRouter(prefix="/adapt", tags=["Adaptation"])


@router.post("/")
def run_adaptation(req: AdaptationRequest, db: Session = Depends(get_db)):
    """Run full recipe adaptation."""
    result = adapt_recipe(db, req.recipe_id, req.source_cuisine, req.target_cuisine, req.intensity)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
