from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import CORS_ORIGINS, logger, DEBUG
from app.core.database import get_db, init_db, engine, Base
from app.models import Cuisine, Recipe, Ingredient, FlavorMolecule, AdaptationResult

from app.api.routes.upload import router as upload_router
from app.api.routes.cuisine import router as cuisine_router
from app.api.routes.recipe import router as recipe_router
from app.api.routes.adapt import router as adapt_router
from app.api.routes.preview import router as preview_router
from app.api.routes.transferability import router as transferability_router
from app.api.routes.ml import router as ml_router
from app.api.routes.recompute import router as recompute_router
from app.api.routes.mvp import router as mvp_router

app = FastAPI(
    title="CCAE - Computational Cuisine Adaptation Engine",
    description="Production backend for AI-powered cross-cultural recipe adaptation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router)
app.include_router(cuisine_router)
app.include_router(recipe_router)
app.include_router(adapt_router)
app.include_router(preview_router)
app.include_router(transferability_router)
app.include_router(ml_router)
app.include_router(recompute_router)
app.include_router(mvp_router)


@app.on_event("startup")
def on_startup():
    logger.info("Starting CCAE Backend...")
    # init_db()  # Temporarily disabled to isolate startup issue
    logger.info("CCAE Backend ready.")


@app.get("/", tags=["Root"])
def root():
    return {
        "name": "CCAE - Computational Cuisine Adaptation Engine",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health(db: Session = Depends(get_db)):
    """Health check with database stats."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    tables = len(Base.metadata.tables)
    cuisines = db.query(Cuisine).count()
    recipes = db.query(Recipe).count()
    ingredients = db.query(Ingredient).count()
    molecules = db.query(FlavorMolecule).count()

    return {
        "status": "healthy",
        "database": db_status,
        "tables": tables,
        "cuisines": cuisines,
        "recipes": recipes,
        "ingredients": ingredients,
        "molecules": molecules,
    }
