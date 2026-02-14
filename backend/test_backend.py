#!/usr/bin/env python3
"""
Test script to initialize database and verify all CCAE backend endpoints.
"""

import requests
import json
import time
import pandas as pd
from io import StringIO

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, files=None):
    """Test an API endpoint."""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            r = requests.get(url)
        elif method == "POST":
            if files:
                r = requests.post(url, files=files)
            elif data:
                r = requests.post(url, json=data)
            else:
                r = requests.post(url)
        else:
            return None
            
        print(f"✓ {method} {endpoint} - Status: {r.status_code}")
        if r.status_code < 300:
            try:
                return r.json()
            except:
                return r.text
        else:
            print(f"  Error: {r.text}")
            return None
    except Exception as e:
        print(f"✗ {method} {endpoint} - Failed: {e}")
        return None

def create_sample_csv():
    """Create sample recipe CSV for testing."""
    csv_data = """recipe_name,cuisine,ingredients,instructions
Spaghetti Bolognese,italian,"spaghetti|ground beef|tomato sauce|onion|garlic|basil",Cook pasta and brown beef with sauce
Margherita Pizza,italian,"pizza dough|tomato sauce|mozzarella|basil",Bake pizza with cheese and basil
Chicken Tikka Masala,indian,"chicken|yogurt|garam masala|tomato|cream|rice",Marinate chicken and cook in creamy sauce
Palak Paneer,indian,"spinach|paneer|garam masala|cream|garlic",Cook spinach with cheese cubes
Beef Tacos,mexican,"ground beef|tortillas|cheese|lettuce|tomato|sour cream",Cook beef and serve in tortillas
Chicken Quesadilla,mexican,"chicken|tortillas|cheese|onions|peppers",Grill chicken with cheese in tortillas
Sushi Roll,japanese,"rice|nori|salmon|avocado|cucumber",Roll fish and vegetables in seaweed
Miso Soup,japanese,"tofu|miso paste|seaweed|green onions",Dissolve miso in hot water with tofu"""
    
    return csv_data.encode('utf-8')

def create_sample_molecules_csv():
    """Create sample molecule CSV for testing."""
    csv_data = """ingredient,molecule,category,intensity
garlic,allicin,sulfur,0.8
basil,linalool,terpene,0.6
tomato,glutamic_acid,amino_acid,0.7
onion,quercetin,flavonoid,0.5
chicken,inosine_monophosphate,nucleotide,0.9
rice,starch,carbohydrate,0.4
salmon,omega_3,fatty_acid,0.8
avocado,oleic_acid,fatty_acid,0.6
cumin,cuminaldehyde,terpene,0.7
turmeric,curcumin,polyphenol,0.8"""
    
    return csv_data.encode('utf-8')

def main():
    print("🚀 Testing CCAE Backend")
    print("=" * 50)
    
    # 1. Test basic endpoints
    print("\n1. Testing basic endpoints...")
    test_endpoint("GET", "/")
    health = test_endpoint("GET", "/health")
    
    # 2. Initialize database
    print("\n2. Initializing database...")
    init_result = test_endpoint("POST", "/init-db")
    print(f"  Response: {init_result}")
    if init_result and init_result.get("status") == "success":
        print("✓ Database initialized successfully")
    else:
        print("✗ Database initialization failed")
        # Don't return, continue with testing
    
    # 3. Test health after DB init
    print("\n3. Testing health endpoint...")
    health = test_endpoint("GET", "/health")
    if health:
        print(f"  Database: {health.get('database')}")
        print(f"  Tables: {health.get('tables')}")
        print(f"  Cuisines: {health.get('cuisines')}")
        print(f"  Recipes: {health.get('recipes')}")
    
    # 4. Upload sample recipes
    print("\n4. Uploading sample recipes...")
    csv_content = create_sample_csv()
    files = {"file": ("recipes.csv", csv_content, "text/csv")}
    upload_result = test_endpoint("POST", "/upload/recipes", files=files)
    if upload_result:
        print(f"  Recipes inserted: {upload_result.get('recipes_inserted')}")
        print(f"  Ingredients inserted: {upload_result.get('ingredients_inserted')}")
        print(f"  Cuisines inserted: {upload_result.get('cuisines_inserted')}")
    
    # 5. Upload sample molecules
    print("\n5. Uploading sample molecules...")
    mol_content = create_sample_molecules_csv()
    files = {"file": ("molecules.csv", mol_content, "text/csv")}
    mol_result = test_endpoint("POST", "/upload/molecules", files=files)
    if mol_result:
        print(f"  Molecules inserted: {mol_result.get('molecules_inserted')}")
        print(f"  Mappings created: {mol_result.get('mappings_created')}")
    
    # 6. List cuisines
    print("\n6. Testing cuisine endpoints...")
    cuisines = test_endpoint("GET", "/cuisine/")
    if cuisines:
        print(f"  Found {len(cuisines)} cuisines")
        for c in cuisines[:3]:
            print(f"    - {c['name']}")
    
    # 7. Test cuisine identity
    if cuisines and len(cuisines) > 0:
        first_cuisine = cuisines[0]['name']
        print(f"\n7. Computing cuisine identity for: {first_cuisine}")
        identity = test_endpoint("GET", f"/cuisine/{first_cuisine}/identity")
        if identity:
            print(f"  Ingredient count: {identity.get('ingredient_count')}")
            print(f"  Recipe count: {identity.get('recipe_count')}")
            top_ings = identity.get('top_ingredients', [])[:3]
            for ing in top_ings:
                print(f"    - {ing['name']}: {ing['frequency']:.3f}")
    
    # 8. List recipes
    print("\n8. Testing recipe endpoints...")
    recipes = test_endpoint("GET", "/recipe/")
    if recipes:
        print(f"  Found {len(recipes)} recipes")
        for r in recipes[:3]:
            print(f"    - {r['name']} ({r['cuisine_name']})")
    
    # 9. Test preview endpoints
    if cuisines and len(cuisines) >= 2:
        print("\n9. Testing preview endpoints...")
        source = cuisines[0]['name']
        target = cuisines[1]['name']
        
        compat = test_endpoint("GET", f"/preview/compatibility?source={source}&target={target}")
        if compat:
            print(f"  Compatibility {source}->{target}: {compat.get('compatibility_score'):.3f}")
        
        impact = test_endpoint("GET", f"/preview/adaptation-impact?source={source}&target={target}")
        if impact:
            print(f"  Estimated identity change: {impact.get('estimated_identity_change'):.3f}")
    
    # 10. Test ML training
    print("\n10. Testing ML training...")
    ml_train = test_endpoint("POST", "/ml/train?dimensions=20")
    if ml_train:
        print(f"  Model trained: {ml_train.get('status')}")
        print(f"  Dimensions: {ml_train.get('dimensions')}")
        print(f"  Ingredients: {ml_train.get('ingredients_trained')}")
    
    # 11. Test ML status
    ml_status = test_endpoint("GET", "/ml/status")
    if ml_status:
        print(f"  Model trained: {ml_status.get('model_trained')}")
        print(f"  Model type: {ml_status.get('model_type')}")
    
    # 12. Test transferability
    print("\n11. Testing transferability matrix...")
    transfer = test_endpoint("GET", "/transferability/")
    if transfer:
        cuisines_list = transfer.get('cuisines', [])
        matrix = transfer.get('matrix', [])
        print(f"  Matrix size: {len(cuisines_list)}x{len(matrix)}")
        if len(cuisines_list) >= 2:
            print(f"  Example similarity: {cuisines_list[0]} -> {cuisines_list[1]}: {matrix[0][1]:.3f}")
    
    # 13. Test adaptation (if we have recipes)
    recipes = test_endpoint("GET", "/recipe/")
    if recipes and len(recipes) > 0 and cuisines and len(cuisines) >= 2:
        print("\n12. Testing adaptation engine...")
        recipe = recipes[0]
        source_cuisine = recipe['cuisine_name']
        target_cuisine = [c['name'] for c in cuisines if c['name'] != source_cuisine][0]
        
        adapt_data = {
            "recipe_id": recipe['id'],
            "source_cuisine": source_cuisine,
            "target_cuisine": target_cuisine,
            "intensity": 0.5
        }
        
        adapt_result = test_endpoint("POST", "/adapt", data=adapt_data)
        if adapt_result:
            print(f"  Adaptation {source_cuisine} -> {target_cuisine}")
            print(f"  Identity score: {adapt_result.get('identity_score'):.3f}")
            print(f"  Compatibility: {adapt_result.get('compatibility_score'):.3f}")
            print(f"  Substitutions: {len(adapt_result.get('substitutions', []))}")
    
    # 14. Test full recomputation
    print("\n13. Testing full pipeline recomputation...")
    recompute = test_endpoint("POST", "/recompute-all")
    if recompute:
        print(f"  Status: {recompute.get('status')}")
        results = recompute.get('results', {})
        if 'embeddings' in results:
            print(f"  Embeddings: {results['embeddings'].get('cuisines_processed', 0)} cuisines")
        if 'ml_training' in results:
            print(f"  ML: {results['ml_training'].get('status')}")
    
    print("\n" + "=" * 50)
    print("🎉 Backend testing complete!")
    print(f"📚 API Documentation: {BASE_URL}/docs")
    print(f"🔍 Alternative docs: {BASE_URL}/redoc")

if __name__ == "__main__":
    main()
