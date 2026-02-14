import os
import logging
from pathlib import Path

# Use the working database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///ccae_working.db")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002").split(",")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("ccae")
