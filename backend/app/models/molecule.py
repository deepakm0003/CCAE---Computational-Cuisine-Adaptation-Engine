from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from datetime import datetime, timezone
from app.core.database import Base


class FlavorMolecule(Base):
    __tablename__ = "flavor_molecules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=True)
    formula = Column(String(100), nullable=True)
    flavor_descriptor = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class IngredientMolecule(Base):
    __tablename__ = "ingredient_molecules"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    molecule_id = Column(Integer, ForeignKey("flavor_molecules.id"), nullable=False)
    intensity_score = Column(Float, default=0.0)
