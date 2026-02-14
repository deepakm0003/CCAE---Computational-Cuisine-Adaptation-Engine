from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ingestion import ingest_recipes_csv, ingest_recipes_json, ingest_molecules_csv
from app.schemas.schemas import UploadResponse, MoleculeUploadResponse

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/recipes", response_model=UploadResponse)
async def upload_recipes(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload recipes from CSV or JSON file."""
    content = await file.read()
    filename = file.filename or ""

    if filename.endswith(".json"):
        result = ingest_recipes_json(db, content, filename)
    else:
        result = ingest_recipes_csv(db, content, filename)

    return UploadResponse(**result)


@router.post("/molecules", response_model=MoleculeUploadResponse)
async def upload_molecules(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload molecule data from CSV. Format: ingredient,molecule,category,intensity"""
    content = await file.read()
    result = ingest_molecules_csv(db, content, file.filename or "")
    return MoleculeUploadResponse(**result)
