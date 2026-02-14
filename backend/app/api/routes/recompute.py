from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db, init_db
from app.services.identity import compute_all_embeddings, compute_pca_2d
from app.services.transferability import compute_transferability_matrix, clear_cache
from app.ml.trainer import train_ingredient_embeddings
from app.core.config import logger

router = APIRouter(tags=["Recompute"])


@router.post("/init-db")
def init_database():
    """Manually initialize database tables."""
    try:
        from app.core.database import engine, Base
        Base.metadata.create_all(bind=engine)
        return {"status": "success", "message": "Database tables created"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/recompute-all")
def recompute_all(db: Session = Depends(get_db)):
    """Full pipeline recomputation: embeddings, PCA, transferability, ML."""
    results = {}

    # 1. Cuisine embeddings
    logger.info("Step 1: Computing cuisine embeddings...")
    emb_result = compute_all_embeddings(db)
    results["embeddings"] = emb_result

    # 2. PCA 2D
    logger.info("Step 2: Computing PCA 2D projections...")
    compute_pca_2d(db)
    results["pca_2d"] = "completed"

    # 3. Transferability matrix
    logger.info("Step 3: Computing transferability matrix...")
    clear_cache()
    trans_result = compute_transferability_matrix(db)
    results["transferability"] = {"cuisines": len(trans_result.get("cuisines", []))}

    # 4. ML training
    logger.info("Step 4: Training ML model...")
    ml_result = train_ingredient_embeddings(db)
    results["ml_training"] = ml_result

    logger.info("Full recomputation complete.")
    return {"status": "success", "results": results}
