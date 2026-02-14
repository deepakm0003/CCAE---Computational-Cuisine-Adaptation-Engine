from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import MLTrainResponse, MLStatusOut
from app.ml.trainer import train_ingredient_embeddings, get_model_status

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.post("/train", response_model=MLTrainResponse)
def train_model(dimensions: int = 50, db: Session = Depends(get_db)):
    """Train ingredient embedding model using co-occurrence + Truncated SVD."""
    result = train_ingredient_embeddings(db, dimensions)
    if result.get("status") == "error":
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=result.get("message", "Training failed"))
    return MLTrainResponse(**result)


@router.get("/status", response_model=MLStatusOut)
def model_status():
    """Get current ML model training status."""
    return MLStatusOut(**get_model_status())
