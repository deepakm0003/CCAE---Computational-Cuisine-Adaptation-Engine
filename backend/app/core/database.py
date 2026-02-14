from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import DATABASE_URL, logger

# Ensure we're using a simple SQLite setup
connect_args = {"check_same_thread": False, "timeout": 20}
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import cuisine, recipe, ingredient, molecule, adaptation
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
