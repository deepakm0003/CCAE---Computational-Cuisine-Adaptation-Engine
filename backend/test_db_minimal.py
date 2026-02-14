#!/usr/bin/env python3
"""
Minimal database test to isolate the issue.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class TestTable(Base):
    __tablename__ = "test_table"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))

def main():
    print("Testing minimal database setup...")
    
    # Use same database URL as config
    DATABASE_URL = "sqlite:///C:/Users/deepa/OneDrive/Desktop/ccae/backend/ccae.db"
    
    try:
        engine = create_engine(DATABASE_URL, echo=True)
        Base.metadata.create_all(bind=engine)
        print("✅ Minimal test successful!")
        return 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
