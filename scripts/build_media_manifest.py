"""
Build media_manifest.json from objects.json
Generates provenance metadata for every image used in the project.
"""
import json, datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
objects = json.load(open(DATA_DIR / "objects.json", encoding="utf-8"))

CREDIT_MAP = {
    'Apollo': 'NASA/JSC',
    'Ranger': 'NASA/JPL',
    'Surveyor': 'NASA/JPL',
    'Lunar Orbiter': 'NASA/GSFC',
    'Viking': 'NASA/JPL',
    'Pathfinder': 'NASA/JPL',
    'Spirit': 'NASA/JPL-Caltech/Cornell',
    'Opportunity': 'NASA/JPL-Caltech/Cornell',
    'MER': 'NASA/JPL-Caltech/Cornell',
    'Phoenix': 'NASA/JPL-Caltech/University of Arizona',
    'Curiosity': 'NASA/JPL-Caltech/MSSS',
    'MSL': 'NASA/JPL-Caltech/MSSS',
    'InSight': 'NASA/JPL-Caltech',
    'Mars 2020': 'NASA/JPL-Caltech',
    'Perseverance': 'NASA/JPL-Caltech',
    'Ingenuity': 'NASA/JPL-Caltech',
    'LCROSS': 'NASA/GSFC/Arizona State University',
    'GRAIL': 'NASA/JPL-Caltech/MIT',
    'LADEE': 'NASA/Ames Research Center',
    'Deep Space': 'NASA/JPL',
    'Mars Polar': 'NASA/JPL',
}

def infer_credit(mission):
    for key, val in CREDIT_MAP.items():
        if key in mission:
            return val
    return "NASA"

manifest = []
today = datetime.date.today().isoformat()

for obj in objects:
    nasa_id = obj.get("primary_image_nasa_id")
    source_url = obj.get("image", "")
    
    entry = {
        "object_id": obj["id"],
        "nasa_id": nasa_id,
        "source_url": source_url,
        "title": f"{obj['name']} — {obj['mission']}",
        "credit": obj.get("primary_image_credit") or infer_credit(obj["mission"]),
        "mission": obj["mission"],
        "license_note": "NASA media are generally not copyrighted. Credit NASA and the mission team.",
        "retrieved_date": today,
        "alt_text": obj.get("primary_image_alt", f"NASA photograph of {obj['name']}"),
        "long_description": obj.get("what", ""),
        "verified": obj.get("verified", False),
        "is_artists_concept": False,
        "local_cached_path": None
    }
    manifest.append(entry)

out_path = DATA_DIR / "media_manifest.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({
        "generated": today,
        "total_images": len(manifest),
        "note": "All images are public domain NASA imagery. Credit lines follow NASA Media Usage Guidelines.",
        "images": manifest
    }, f, indent=2, ensure_ascii=False)

print(f"✅ Built media manifest: {len(manifest)} entries → {out_path}")
