from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from datetime import datetime, timezone
from app.core.database import Base


class AdaptationResult(Base):
    __tablename__ = "adaptation_results"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    source_cuisine = Column(String(100), nullable=False)
    target_cuisine = Column(String(100), nullable=False)
    intensity = Column(Float, default=0.5)
    identity_score = Column(Float, nullable=True)
    compatibility_score = Column(Float, nullable=True)
    adaptation_distance = Column(Float, nullable=True)
    flavor_coherence = Column(Float, nullable=True)
    adapted_ingredients = Column(JSON, nullable=True)
    original_ingredients = Column(JSON, nullable=True)
    substitutions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
