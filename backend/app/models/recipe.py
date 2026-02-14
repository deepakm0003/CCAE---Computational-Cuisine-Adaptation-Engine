from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime, timezone
from app.core.database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    cuisine_id = Column(Integer, ForeignKey("cuisines.id"), nullable=False)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
