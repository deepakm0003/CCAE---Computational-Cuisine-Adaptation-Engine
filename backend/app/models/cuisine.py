from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime
from datetime import datetime, timezone
from app.core.database import Base


class Cuisine(Base):
    __tablename__ = "cuisines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    region = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CuisineEmbedding(Base):
    __tablename__ = "cuisine_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    cuisine_id = Column(Integer, ForeignKey("cuisines.id"), unique=True, nullable=False)
    embedding_vector = Column(JSON, nullable=True)
    ingredient_frequency = Column(JSON, nullable=True)
    molecule_distribution = Column(JSON, nullable=True)
    centrality_scores = Column(JSON, nullable=True)
    pca_2d = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
