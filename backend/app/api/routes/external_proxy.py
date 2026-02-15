from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import requests
from typing import Optional

router = APIRouter()

# In-memory API key (kept simple for local dev). Set via POST /external/set-key
_API_KEY: Optional[str] = None


class ApiKeyRequest(BaseModel):
    api_key: str


@router.post("/external/set-key")
def set_api_key(body: ApiKeyRequest):
    global _API_KEY
    _API_KEY = body.api_key
    return {"status": "ok", "masked_key": (_API_KEY[:4] + "..." + _API_KEY[-4:])}


@router.get("/external/key")
def get_key_masked():
    if not _API_KEY:
        raise HTTPException(status_code=404, detail="API key not set")
    return {"masked_key": (_API_KEY[:4] + "..." + _API_KEY[-4:])}


@router.api_route("/external/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(full_path: str, request: Request):
    """Generic proxy that forwards the incoming request to the target URL.

    The client should include a query parameter `base` with the full base URL to target,
    e.g. /external/recipe/recipesinfo?base=http://cosylab.iiitd.edu.in:6969/recipe2-api
    """
    if not _API_KEY:
        raise HTTPException(status_code=400, detail="API key not configured. POST to /external/set-key first.")

    base = request.query_params.get("base")
    if not base:
        raise HTTPException(status_code=400, detail="Missing `base` query parameter with target base URL")

    # Build target URL
    if base.endswith("/"):
        base = base[:-1]
    target_url = f"{base}/{full_path}"

    # Forward headers (but override Authorization)
    headers = {k: v for k, v in request.headers.items() if k.lower() not in ("host", "content-length")}
    headers["Authorization"] = f"Bearer {_API_KEY}"

    # Forward body if present
    body = await request.body()

    try:
        resp = requests.request(
            method=request.method,
            url=target_url,
            headers=headers,
            params={k: v for k, v in request.query_params.items() if k != "base"},
            data=body if body else None,
            timeout=15,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=str(e))

    return (resp.content, resp.status_code, resp.headers.items())
