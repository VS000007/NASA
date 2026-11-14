import json
from pathlib import Path
from typing import List, Optional, Literal
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/objects", tags=["Space Objects"])

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "objects.json"

class ReadingLevelContent(BaseModel):
    title: str = Field(..., description="Kid-friendly heading")
    summary: str = Field(..., description="Brief one-sentence takeaway")
    story: str = Field(..., description="Full story tailored to the age bracket")
    did_you_know: str = Field(..., description="Memorable curiosity hook")

class HotspotItem(BaseModel):
    title: str = Field(..., description="Component label")
    position: str = Field(..., description="XYZ coordinate string for model-viewer")
    normal: Optional[str] = Field("0 1 0", description="Normal vector string")
    text: str = Field(..., description="Kid-friendly component explanation")

class MediaItem(BaseModel):
    nasa_id: Optional[str] = Field(None, description="NASA Image API identifier")
    source_url: Optional[str] = Field(None, description="Direct URL to source image")
    title: Optional[str] = Field(None, description="Image title")
    credit: Optional[str] = Field(None, description="Credit line e.g. NASA/JPL-Caltech")
    mission: Optional[str] = Field(None, description="Mission the image shows")
    license_note: Optional[str] = Field(None, description="Usage/license notes")
    retrieved_date: Optional[str] = Field(None, description="ISO date when image was retrieved")
    alt_text: Optional[str] = Field(None, description="Accessible alt text")
    long_description: Optional[str] = Field(None, description="Extended description for screen readers")
    verified: Optional[bool] = Field(False, description="Image verified to match the claimed object")
    is_artists_concept: Optional[bool] = Field(False, description="True if this is a rendering/concept art")
    local_path: Optional[str] = Field(None, description="Local cached path after build")

class SpaceObject(BaseModel):
    id: str = Field(..., description="Unique slug identifier")
    name: str = Field(..., description="Display name of the equipment")
    body: Literal["Moon", "Mars"] = Field(..., description="Celestial body")
    category: Optional[str] = Field("lander stage")
    status: Optional[str] = Field("abandoned")
    site: Optional[str] = Field(None, description="Landing site name for grouping")
    lat: float = Field(..., description="Surface latitude in degrees")
    lon: float = Field(..., description="Surface longitude in degrees (East-positive)")
    location_accuracy: Optional[str] = Field("exact", description="exact, approximate, or unknown")
    year: int = Field(...)
    mission: str = Field(...)
    model_file: Optional[str] = Field(None)
    image: str = Field(...)
    who: str = Field(...)
    what: str = Field(...)
    when: str = Field(...)
    where: str = Field(...)
    how: str = Field(...)
    why_left: str = Field(...)
    fun_fact: str = Field(...)
    reading_level_simple: ReadingLevelContent
    reading_level_advanced: ReadingLevelContent
    hotspots: Optional[List[HotspotItem]] = Field(default=[])
    source_names: Optional[List[str]] = Field(default=[])
    verified: Optional[bool] = Field(True)
    # New v2 fields
    scope_tier: Optional[str] = Field("core", description="core, neighbour, or bonus")
    agency: Optional[str] = Field("NASA")
    country: Optional[str] = Field("United States")
    position_type: Optional[str] = Field("landing_site", description="landing_site, last_known_position, or impact_site")
    last_known_lat: Optional[float] = Field(None)
    last_known_lon: Optional[float] = Field(None)
    media: Optional[List[MediaItem]] = Field(default=[])
    primary_image_nasa_id: Optional[str] = Field(None)
    primary_image_credit: Optional[str] = Field(None)
    primary_image_alt: Optional[str] = Field(None)

def load_objects_data() -> List[dict]:
    if not DATA_PATH.exists():
        raise HTTPException(status_code=500, detail="Data file objects.json not found")
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read objects dataset: {e}")

@router.get("", response_model=List[SpaceObject])
async def get_all_objects(
    body: Optional[Literal["Moon", "Mars"]] = Query(None),
    scope_tier: Optional[str] = Query(None, description="Filter by scope tier"),
    category: Optional[str] = Query(None, description="Filter by category"),
):
    """Retrieve all NASA discarded space artifacts with optional filters."""
    data = load_objects_data()
    if body:
        data = [i for i in data if i.get("body", "").lower() == body.lower()]
    if scope_tier:
        data = [i for i in data if i.get("scope_tier", "core").lower() == scope_tier.lower()]
    if category:
        data = [i for i in data if i.get("category", "").lower() == category.lower()]
    return data

@router.get("/{object_id}", response_model=SpaceObject)
async def get_object_by_id(object_id: str):
    """Retrieve a single space artifact by its unique ID."""
    data = load_objects_data()
    for item in data:
        if item.get("id") == object_id:
            return item
    raise HTTPException(status_code=404, detail=f"Space object '{object_id}' not found")
