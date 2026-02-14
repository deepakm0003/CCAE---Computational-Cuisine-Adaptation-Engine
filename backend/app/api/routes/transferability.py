from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import TransferabilityMatrix
from app.services.transferability import compute_transferability_matrix, get_cached_transferability

router = APIRouter(prefix="/transferability", tags=["Transferability"])


@router.get("/", response_model=TransferabilityMatrix)
def get_transferability(db: Session = Depends(get_db)):
    """Get pairwise cuisine similarity matrix. Uses cache if available."""
    cached = get_cached_transferability()
    if cached:
        return cached
    return compute_transferability_matrix(db)
