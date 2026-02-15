#!/usr/bin/env python3
"""
Test creating tables for each model individually.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, Column, Integer, String, Text, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime, timezone

from pathlib import Path

# Use a portable, repo-local SQLite file so tests run on Linux and CI
db_path = Path(__file__).resolve().parent / "ccae_test.db"
DATABASE_URL = f"sqlite:///{db_path.as_posix()}"
engine = create_engine(DATABASE_URL, echo=False)

class Base(DeclarativeBase):
    pass

# Test 1: Simple Cuisine model
class Cuisine(Base):
    __tablename__ = "cuisines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    region = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

print("Testing individual table creation...")

try:
    print("1. Creating cuisines table...")
    Cuisine.__table__.create(engine, checkfirst=True)
    print("   ✅ Cuisines table OK")
except Exception as e:
    print(f"   ❌ Cuisines failed: {e}")
    sys.exit(1)

# Test 2: Simple Ingredient model
class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

try:
    print("2. Creating ingredients table...")
    Ingredient.__table__.create(engine, checkfirst=True)
    print("   ✅ Ingredients table OK")
except Exception as e:
    print(f"   ❌ Ingredients failed: {e}")
    sys.exit(1)

# Test 3: Simple Recipe model
class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    cuisine_id = Column(Integer, ForeignKey("cuisines.id"), nullable=False)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

try:
    print("3. Creating recipes table...")
    Recipe.__table__.create(engine, checkfirst=True)
    print("   ✅ Recipes table OK")
except Exception as e:
    print(f"   ❌ Recipes failed: {e}")
    sys.exit(1)

print("\n✅ All basic tables created successfully!")
print("The issue might be with relationships or complex columns.")
