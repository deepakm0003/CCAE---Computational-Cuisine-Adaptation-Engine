from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter()

# Default paths where the Postman collections were attached
RDB_PATH = Path.home() / "Downloads" / "rdb2_postman_collection.json"
FLAVOR_PATH = Path.home() / "Downloads" / "FlavorDB API - Complete Collection.postman_collection.json"


def _load_json(path: Path):
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
    try:
        with path.open("r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/postman/list")
def list_postman_files():
    return {
        "rdb_present": RDB_PATH.exists(),
        "flavordb_present": FLAVOR_PATH.exists(),
        "rdb_path": str(RDB_PATH),
        "flavordb_path": str(FLAVOR_PATH),
    }


@router.get("/postman/rdb")
def get_rdb_collection():
    return _load_json(RDB_PATH)


@router.get("/postman/flavordb")
def get_flavordb_collection():
    return _load_json(FLAVOR_PATH)
