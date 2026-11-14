"""
Validate the objects.json dataset:
- Schema completeness
- Coordinate range checks
- No placeholder 0,0 without location_accuracy=unknown
- Required fields present
- Longitude convention consistency
"""
import json, sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "objects.json"
objects = json.load(open(DATA, encoding="utf-8"))

errors = []
warnings = []

REQUIRED = ["id", "name", "body", "lat", "lon", "year", "mission", "image",
            "who", "what", "when", "where", "how", "why_left", "fun_fact",
            "reading_level_simple", "reading_level_advanced", "verified"]

NEW_FIELDS = ["scope_tier", "agency", "country", "position_type",
              "primary_image_alt"]

for i, obj in enumerate(objects):
    oid = obj.get("id", f"index-{i}")

    # Required fields
    for field in REQUIRED:
        if field not in obj or obj[field] is None:
            if field == "verified":
                continue  # bool can be false
            errors.append(f"[{oid}] Missing required field: {field}")

    # New v2 fields
    for field in NEW_FIELDS:
        if field not in obj:
            warnings.append(f"[{oid}] Missing v2 field: {field}")

    # Coordinate range
    lat = obj.get("lat", 0)
    lon = obj.get("lon", 0)
    body = obj.get("body", "")

    if body == "Moon":
        if not (-90 <= lat <= 90):
            errors.append(f"[{oid}] Moon lat out of range: {lat}")
        if not (-180 <= lon <= 180):
            errors.append(f"[{oid}] Moon lon out of range: {lon}")
    elif body == "Mars":
        if not (-90 <= lat <= 90):
            errors.append(f"[{oid}] Mars lat out of range: {lat}")
        if not (-180 <= lon <= 360):
            warnings.append(f"[{oid}] Mars lon possibly out of -180..180 range: {lon}")

    # Placeholder check
    if lat == 0 and lon == 0 and obj.get("location_accuracy") != "unknown":
        errors.append(f"[{oid}] Lat/lon are 0,0 without location_accuracy=unknown")

    # Reading level structure
    for level in ["reading_level_simple", "reading_level_advanced"]:
        content = obj.get(level, {})
        if content:
            for subfield in ["title", "summary", "story", "did_you_know"]:
                if subfield not in content or not content[subfield]:
                    errors.append(f"[{oid}] {level} missing: {subfield}")

    # Year range
    year = obj.get("year", 0)
    if year < 1958 or year > 2030:
        warnings.append(f"[{oid}] Unusual year: {year}")

    # Scope tier
    tier = obj.get("scope_tier", "")
    if tier not in ("core", "neighbour", "bonus"):
        warnings.append(f"[{oid}] Unknown scope_tier: {tier}")

print(f"\n{'='*60}")
print(f"Dataset Validation: {len(objects)} records")
print(f"{'='*60}")

if errors:
    print(f"\n❌ ERRORS ({len(errors)}):")
    for e in errors:
        print(f"  {e}")
else:
    print("\n✅ No errors found!")

if warnings:
    print(f"\n⚠️  WARNINGS ({len(warnings)}):")
    for w in warnings:
        print(f"  {w}")
else:
    print("✅ No warnings!")

moon = sum(1 for o in objects if o["body"] == "Moon")
mars = sum(1 for o in objects if o["body"] == "Mars")
verified = sum(1 for o in objects if o.get("verified"))
with_model = sum(1 for o in objects if o.get("model_file"))
with_nasa_id = sum(1 for o in objects if o.get("primary_image_nasa_id"))

print(f"\n📊 Stats:")
print(f"  Moon: {moon}, Mars: {mars}")
print(f"  Verified: {verified}/{len(objects)}")
print(f"  With 3D model: {with_model}")
print(f"  With NASA Image ID: {with_nasa_id}")

sys.exit(1 if errors else 0)
