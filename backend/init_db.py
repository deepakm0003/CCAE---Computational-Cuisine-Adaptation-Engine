#!/usr/bin/env python3
"""
Standalone database initialization script.
Run this to create all database tables.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models import cuisine, recipe, ingredient, molecule, adaptation

def main():
    print("Initializing CCAE database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # List all tables
        print("\nCreated tables:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
