from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, Dict, Optional
import json
from pathlib import Path

from backend.executor import run_template, run_custom_code, TemplateExecutionError
from backend.registry import load_registry
from backend.validator import validate_params

app = FastAPI(title="VideoDB Meme Templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        "http://localhost",  # Docker nginx proxy
        "*"  # Allow all origins in production (consider restricting to your domain)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMPLATES = load_registry()
MEME_BANK_PATH = Path(__file__).parent / "meme_bank.json"

def load_meme_bank():
    """Load meme bank from JSON file"""
    if not MEME_BANK_PATH.exists():
        return []
    return json.loads(MEME_BANK_PATH.read_text(encoding="utf-8"))["meme_sources"]


def get_memes_collection(conn):
    """Get or create the 'Memes' collection"""
    # Try to find existing collection by name
    collections = conn.get_collections()
    for temp_coll in collections:
        # Check for name 'Memes' (case-insensitive)
        if temp_coll.name and temp_coll.name.strip().lower() == "memes":
            return conn.get_collection(temp_coll.id)
        
    # If not found, try to create it
    return conn.create_collection(name="Memes", description="Collection for memes from makememes.site")


class RunRequest(BaseModel):
    params: Dict[str, Any]


class RunCustomRequest(BaseModel):
    code: str
    params: Dict[str, Any]


class UploadFromUrlRequest(BaseModel):
    url: str
    name: str
    media_type: str = "video"  # video, image, or audio


class SyncMemeRequest(BaseModel):
    meme_id: str


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "http_error", "message": exc.detail}},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "message": "Unexpected error", "details": str(exc)}},
    )


@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    return {"status": "healthy", "service": "makememes-backend"}


@app.get("/api/templates")
async def list_templates():
    return {"templates": [tmpl.to_list_item() for tmpl in TEMPLATES.values()]}


@app.get("/api/templates/{template_id}")
async def get_template(template_id: str):
    template = TEMPLATES.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template.to_detail()


@app.post("/api/run/{template_id}")
async def run_template_endpoint(template_id: str, request: RunRequest, req: Request):
    template = TEMPLATES.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    api_key = req.headers.get("x-videodb-key") or req.headers.get("authorization")
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing VideoDB API key")
    if api_key.lower().startswith("bearer "):
        api_key = api_key[7:]

    cleaned, errors = validate_params(template.params_schema, request.params)
    if errors:
        raise HTTPException(status_code=422, detail={"message": "Invalid params", "errors": errors})

    try:
        result = run_template(template.code_path, template.template_id, api_key, cleaned)
        return result
    except TemplateExecutionError as e:
        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "code": e.code,
                    "message": e.message,
                    "details": e.details
                }
            }
        )


@app.post("/api/run-custom")
async def run_custom_code_endpoint(request: RunCustomRequest, req: Request):
    """Execute user-provided custom code"""
    api_key = req.headers.get("x-videodb-key") or req.headers.get("authorization")
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing VideoDB API key")
    if api_key.lower().startswith("bearer "):
        api_key = api_key[7:]

    # Basic validation - code must not be empty
    if not request.code or not request.code.strip():
        raise HTTPException(status_code=422, detail="Code cannot be empty")

    try:
        result = run_custom_code(request.code, api_key, request.params)
        return result
    except TemplateExecutionError as e:
        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "code": e.code,
                    "message": e.message,
                    "details": e.details
                }
            }
        )


@app.get("/api/assets")
async def list_assets(req: Request, kind: Optional[str] = None):
    api_key = req.headers.get("x-videodb-key") or req.headers.get("authorization")
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing VideoDB API key")
    if api_key.lower().startswith("bearer "):
        api_key = api_key[7:]

    try:
        import videodb
        conn = videodb.connect(api_key=api_key)
        memes_coll = get_memes_collection(conn)
        print(f"Loading assets from collection: {memes_coll.name} ({memes_coll.id})")

        # Fetch videos
        videos = []
        try:
            for video in memes_coll.get_videos():
                videos.append({
                    "id": video.id,
                    "name": video.name or f"Video {video.id}",
                    "duration": getattr(video, 'length', None)
                })
        except Exception as e:
            print(f"Error fetching videos: {e}")
            pass

        # Fetch images
        images = []
        try:
            for image in memes_coll.get_images():
                images.append({
                    "id": image.id,
                    "name": image.name or f"Image {image.id}"
                })
        except Exception as e:
            print(f"Error fetching images: {e}")
            pass

        # Fetch audio
        audio = []
        try:
            for aud in memes_coll.get_audios():
                audio.append({
                    "id": aud.id,
                    "name": aud.name or f"Audio {aud.id}"
                })
        except Exception as e:
            print(f"Error fetching audio: {e}")
            pass

        assets = {
            "videos": videos,
            "images": images,
            "audio": audio,
        }

        if kind:
            return {kind: assets.get(kind, [])}

        return assets

    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "fetch_error", "message": "Failed to fetch assets from VideoDB", "details": str(e)}}
        )


@app.get("/api/meme-bank")
async def list_meme_sources():
    """List all available meme sources"""
    meme_sources = load_meme_bank()
    
    # Add preview information to each meme
    for meme in meme_sources:
        # Use preview_url if available, otherwise fallback to source_url
        preview_url = meme.get("preview_url") or meme.get("source_url")
        if preview_url:
            is_hls = preview_url.endswith(".m3u8") or "manifest" in preview_url
            meme["preview"] = {
                "url": preview_url,
                "type": "hls" if is_hls else "mp4"
            }
        else:
            meme["preview"] = None
            
    return {"meme_sources": meme_sources}


@app.get("/api/meme-bank/check")
async def check_meme_availability(req: Request):
    """Check which memes are available in user's VideoDB collection"""
    api_key = req.headers.get("x-videodb-key") or req.headers.get("authorization")
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing VideoDB API key")
    if api_key.lower().startswith("bearer "):
        api_key = api_key[7:]

    try:
        import videodb
        conn = videodb.connect(api_key=api_key)
        coll = get_memes_collection(conn)

        # Get all videos from user's collection
        user_videos = []
        try:
            for video in coll.get_videos():
                user_videos.append({
                    "id": video.id,
                    "name": video.name or f"Video {video.id}",
                })
        except Exception:
            pass

        # Load meme sources and check availability
        meme_sources = load_meme_bank()
        availability = {}

        for meme in meme_sources:
            # Check if user has a video with matching name
            matching_video = None
            for video in user_videos:
                video_name_lower = video["name"].lower()
                meme_name_lower = meme["name"].lower()

                # Check if video name contains meme name
                if meme_name_lower in video_name_lower:
                    matching_video = video
                    break

            availability[meme["id"]] = {
                "available": matching_video is not None,
                "asset_id": matching_video["id"] if matching_video else None,
                "asset_name": matching_video["name"] if matching_video else None
            }

        return {"availability": availability}

    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "check_error", "message": "Failed to check meme availability", "details": str(e)}}
        )


@app.post("/api/meme-bank/sync")
async def sync_meme_to_collection(request: SyncMemeRequest, req: Request):
    """Sync (upload) a meme source to user's VideoDB collection with one click"""
    api_key = req.headers.get("x-videodb-key") or req.headers.get("authorization")
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing VideoDB API key")
    if api_key.lower().startswith("bearer "):
        api_key = api_key[7:]

    # Load meme sources
    meme_sources = load_meme_bank()
    meme = next((m for m in meme_sources if m["id"] == request.meme_id), None)

    if not meme:
        raise HTTPException(status_code=404, detail=f"Meme source '{request.meme_id}' not found in meme bank")

    if not meme.get("source_url"):
        raise HTTPException(status_code=400, detail=f"Meme source '{request.meme_id}' has no configured source URL.")

    try:
        import videodb
        conn = videodb.connect(api_key=api_key)
        memes_coll = get_memes_collection(conn)
        print(memes_coll.name)

        # Upload based on media type
        media_type = meme.get("media_type", "video")
        source_url = meme["source_url"]
        name = meme["name"]

        if media_type == "video":
            asset = memes_coll.upload(url=source_url, name=name)
            print(asset)
        elif media_type == "image":
            asset = memes_coll.upload(url=source_url, media_type="image", name=name)
        elif media_type == "audio":
            asset = memes_coll.upload(url=source_url, media_type="audio", name=name)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid media_type '{media_type}'")

        return {
            "asset_id": asset.id,
            "name": asset.name,
            "media_type": media_type,
            "meme_id": request.meme_id,
            "collection_name": memes_coll.name,
            "collection_id": memes_coll.id
        }

    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "sync_error", "message": "Failed to sync meme to VideoDB", "details": str(e)}}
        )


@app.post("/api/meme-bank/sync-all")
async def sync_all_memes_to_collection(req: Request):
    """Sync all missing meme sources to user's VideoDB collection"""
    api_key = req.headers.get("x-videodb-key") or req.headers.get("authorization")
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing VideoDB API key")
    if api_key.lower().startswith("bearer "):
        api_key = api_key[7:]

    try:
        import videodb
        conn = videodb.connect(api_key=api_key)
        coll = get_memes_collection(conn)

        # Get existing videos to avoid duplicates
        existing_videos = []
        try:
            for video in coll.get_videos():
                existing_videos.append(video.name.lower() if video.name else "")
        except Exception:
            pass

        # Load meme sources
        meme_sources = load_meme_bank()
        synced = []
        skipped = []

        for meme in meme_sources:
            meme_name = meme["name"]
            if meme_name.lower() in existing_videos:
                skipped.append(meme["id"])
                continue

            if not meme.get("source_url"):
                continue

            # Upload based on media type
            media_type = meme.get("media_type", "video")
            source_url = meme["source_url"]

            if media_type == "video":
                coll.upload(url=source_url, name=meme_name)
            elif media_type == "image":
                coll.upload(url=source_url, media_type="image", name=meme_name)
            elif media_type == "audio":
                coll.upload(url=source_url, media_type="audio", name=meme_name)
            
            synced.append(meme["id"])

        return {
            "synced": synced,
            "skipped": skipped,
            "total_synced": len(synced),
            "total_skipped": len(skipped)
        }

    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "sync_all_error", "message": "Failed to sync all memes to VideoDB", "details": str(e)}}
        )


@app.post("/api/upload-from-url")
async def upload_from_url(request: UploadFromUrlRequest, req: Request):
    """Upload media from URL to VideoDB (for custom user uploads)"""
    api_key = req.headers.get("x-videodb-key") or req.headers.get("authorization")
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing VideoDB API key")
    if api_key.lower().startswith("bearer "):
        api_key = api_key[7:]

    try:
        import videodb
        conn = videodb.connect(api_key=api_key)
        coll = get_memes_collection(conn)

        # Upload based on media type
        if request.media_type == "video":
            asset = coll.upload(url=request.url, name=request.name)
            return {
                "asset_id": asset.id,
                "name": asset.name,
                "media_type": "video"
            }
        elif request.media_type == "image":
            asset = coll.upload(url=request.url, media_type="image", name=request.name)
            return {
                "asset_id": asset.id,
                "name": asset.name,
                "media_type": "image"
            }
        elif request.media_type == "audio":
            asset = coll.upload(url=request.url, media_type="audio", name=request.name)
            return {
                "asset_id": asset.id,
                "name": asset.name,
                "media_type": "audio"
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid media_type. Must be 'video', 'image', or 'audio'")

    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "upload_error", "message": "Failed to upload media to VideoDB", "details": str(e)}}
        )


# Static files removed - frontend is now a separate Next.js app
# Run frontend with: cd frontend && npm run dev
