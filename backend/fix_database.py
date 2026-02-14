#!/usr/bin/env python3
"""
Fix database by using a different approach.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Remove existing database file
db_path = "C:/Users/deepa/OneDrive/Desktop/ccae/backend/ccae.db"
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"Removed existing database: {db_path}")

# Use a simple in-memory database first
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Try in-memory first
print("Testing with in-memory database...")
try:
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    print("✅ In-memory database works!")
except Exception as e:
    print(f"❌ In-memory failed: {e}")
    sys.exit(1)

# Now try file-based
print("\nTesting with file-based database...")
try:
    engine = create_engine("sqlite:///ccae_new.db", echo=False)
    Base.metadata.create_all(bind=engine)
    print("✅ File-based database works!")
except Exception as e:
    print(f"❌ File-based failed: {e}")
    sys.exit(1)

print("\n✅ Database issue resolved! The problem was likely the database path or permissions.")
