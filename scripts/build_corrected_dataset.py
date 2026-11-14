"""
Phase 1 — Build corrected & enriched objects.json
Fixes: placeholder coordinates, adds scope_tier/agency/position_type/media fields,
adds missing records (Curiosity rover, Perseverance rover, Surveyor 2 & 4).
"""
import json, copy, pathlib, datetime

SRC = pathlib.Path(__file__).resolve().parent.parent / "data" / "objects.json"
DST = SRC  # overwrite in place

with open(SRC, "r", encoding="utf-8") as f:
    objects = json.load(f)

# ---------- helpers ----------
def find(obj_id):
    for o in objects:
        if o["id"] == obj_id:
            return o
    return None

TODAY = datetime.date.today().isoformat()

# ========== A2: Viking 2 longitude — keep 134.01 (already East-positive) ==========
# 360 − 226.03(W) = 133.97 ≈ 134.01 — confirmed correct

# ========== A3: Fix placeholder 0,0 coordinates ==========

# Lunar Orbiter 4 — impact location truly unknown; best estimate ~0°N, ~-22°W
lo4 = find("lunar-orbiter-4-impact")
if lo4:
    lo4["lat"] = 0.0
    lo4["lon"] = -22.0
    lo4["location_accuracy"] = "unknown"
    lo4["verified"] = False
    lo4["where"] = "Unknown location on the lunar surface (estimated ~22°W). Spacecraft orbit decayed naturally by October 1967."

# Apollo 11 Ascent Stage — may still be in orbit; impact location unknown
a11_asc = find("apollo-11-ascent-stage-impact")
if a11_asc:
    a11_asc["lat"] = 0.0
    a11_asc["lon"] = 23.5  # near-equatorial orbit, arbitrary marker near Tranquility
    a11_asc["location_accuracy"] = "unknown"
    a11_asc["verified"] = False
    a11_asc["status"] = "unknown"
    a11_asc["where"] = "Unknown — the ascent stage was jettisoned into lunar orbit. GRAIL gravity modeling suggests it may still be orbiting the Moon."
    a11_asc["fun_fact"] = "Unlike later Apollo missions, Eagle's ascent stage was not deliberately crashed. Some researchers believe it may still be orbiting the Moon after more than 55 years!"

# Apollo 16 Ascent Stage — approximate coordinates already present, keep as-is but confirm
a16_asc = find("apollo-16-ascent-stage-impact")
if a16_asc:
    a16_asc["location_accuracy"] = "approximate"

# ========== A6: Add missing records ==========

# ---- Curiosity Rover (active, Gale Crater) ----
curiosity_rover = {
    "id": "curiosity-rover",
    "name": "Curiosity Rover (Mars Science Laboratory)",
    "body": "Mars",
    "category": "rover",
    "status": "active",
    "site": "Gale Crater - Bradbury Landing",
    "lat": -4.5895,
    "lon": 137.4417,
    "location_accuracy": "exact",
    "year": 2012,
    "mission": "Mars Science Laboratory (Curiosity)",
    "model_file": None,
    "image": "https://images-assets.nasa.gov/image/PIA16239/PIA16239~orig.jpg",
    "who": "NASA Jet Propulsion Laboratory / Caltech.",
    "what": "Car-sized rover with a nuclear power source, laser spectrometer, and drill for analyzing Martian rocks.",
    "when": "Landed August 6, 2012 via sky crane maneuver. Still operational.",
    "where": "Bradbury Landing, Aeolis Palus inside Gale Crater, Mars.",
    "how": "Entry capsule with heat shield, supersonic parachute, and rocket-powered sky crane lowered the rover on nylon tethers.",
    "why_left": "Curiosity is still actively exploring! But when it eventually stops, it will join the other abandoned machines on Mars.",
    "fun_fact": "Curiosity sings 'Happy Birthday' to itself using vibrations from its soil sampling system — it played the tune on its first Martian birthday (August 5, 2013)!",
    "reading_level_simple": {
        "title": "The Car-Sized Robot Still Exploring Mars!",
        "summary": "A nuclear-powered rover the size of a car, still driving around Mars since 2012!",
        "story": "Curiosity is a robot the size of a small car that NASA sent to Mars in 2012. It landed inside a giant crater using a rocket-powered sky crane — like a jetpack lowering it gently on cables! It has a laser that zaps rocks to figure out what they're made of, and a drill to look inside them. Curiosity proved that Mars once had lakes and rivers where tiny life forms could have lived.",
        "did_you_know": "Curiosity's wheels have holes cut in a special pattern that spell out 'JPL' in Morse code in the Martian dirt as it drives!"
    },
    "reading_level_advanced": {
        "title": "Mars Science Laboratory — Curiosity Rover at Gale Crater",
        "summary": "Nuclear-powered mobile laboratory conducting long-duration astrobiology and geology research.",
        "story": "The Mars Science Laboratory mission deployed the Curiosity rover via an Entry, Descent, and Landing (EDL) sequence culminating in the unprecedented sky crane maneuver. Powered by a Multi-Mission Radioisotope Thermoelectric Generator (MMRTG) using plutonium-238, Curiosity carries the most advanced analytical suite ever sent to another planet, including the ChemCam laser-induced breakdown spectroscopy instrument and the Sample Analysis at Mars (SAM) suite.",
        "did_you_know": "Curiosity's discovery of ancient organic molecules and seasonal methane fluctuations in Gale Crater represent the strongest astrobiological evidence found on Mars to date."
    },
    "hotspots": [],
    "source_names": ["NASA JPL Curiosity Mission Page", "NASA NSSDCA MSL Catalog"],
    "verified": True
}

# ---- Perseverance Rover (active, Jezero Crater) ----
perseverance_rover = {
    "id": "perseverance-rover",
    "name": "Perseverance Rover (Mars 2020)",
    "body": "Mars",
    "category": "rover",
    "status": "active",
    "site": "Jezero Crater - Octavia E. Butler Landing",
    "lat": 18.4447,
    "lon": 77.4508,
    "location_accuracy": "exact",
    "year": 2021,
    "mission": "Mars 2020 (Perseverance & Ingenuity)",
    "model_file": "/models/perseverance_rover.glb",
    "image": "https://images-assets.nasa.gov/image/PIA24542/PIA24542~orig.jpg",
    "who": "NASA Jet Propulsion Laboratory / Caltech.",
    "what": "Most advanced Mars rover with a rock-coring drill, oxygen-making experiment (MOXIE), and a suite of cameras and spectrometers.",
    "when": "Landed February 18, 2021. Still operational.",
    "where": "Octavia E. Butler Landing, Jezero Crater, Mars — an ancient lake bed with a preserved river delta.",
    "how": "Entry capsule with heat shield, supersonic parachute with Terrain Relative Navigation, and rocket-powered sky crane.",
    "why_left": "Perseverance is still actively exploring! It is collecting rock core samples for a future Mars Sample Return mission.",
    "fun_fact": "Perseverance carried a piece of Martian meteorite BACK to Mars! A tiny chip of a Mars rock that fell to Earth was mounted on the rover's SHERLOC instrument as a calibration target.",
    "reading_level_simple": {
        "title": "The Rover Collecting Mars Rocks for Earth!",
        "summary": "A rover exploring an ancient Martian lake, collecting rock samples that will one day be brought back to Earth!",
        "story": "Perseverance is the newest rover on Mars, and it has a very special job: collecting tubes of Martian rock and sealing them up to be picked up later and brought back to Earth! It landed in Jezero Crater, which was once filled with water like a lake. The rover also carried a tiny helicopter named Ingenuity that became the first aircraft to fly on another planet!",
        "did_you_know": "Hidden in the pattern of the parachute that slowed Perseverance down were secret coded messages — including 'Dare Mighty Things' spelled out in binary code!"
    },
    "reading_level_advanced": {
        "title": "Mars 2020 Perseverance — Astrobiology Cache Rover at Jezero",
        "summary": "Next-generation astrobiology rover conducting in-situ analysis and caching samples for Mars Sample Return.",
        "story": "Perseverance represents NASA's first mission explicitly designed for astrobiology sample caching. The rover's PIXL, SHERLOC, and SuperCam instruments characterize rock mineralogy and organic chemistry at unprecedented resolution. Its Mars Oxygen In-Situ Resource Utilization Experiment (MOXIE) demonstrated the production of breathable oxygen from the CO₂-rich Martian atmosphere — a critical technology for future human missions.",
        "did_you_know": "Perseverance's Terrain Relative Navigation system compared descent camera images to orbital maps in real time, autonomously steering away from hazards — a first for Mars landings."
    },
    "hotspots": [],
    "source_names": ["NASA JPL Perseverance Mission Page", "NASA Mars 2020 Landing Press Kit"],
    "verified": True
}

# ---- Surveyor 2 (crashed) ----
surveyor_2 = {
    "id": "surveyor-2-impact",
    "name": "Surveyor 2 Impact Site",
    "body": "Moon",
    "category": "impactor",
    "status": "impacted",
    "site": "Surveyor 2 Impact",
    "lat": -5.5,
    "lon": -12.0,
    "location_accuracy": "approximate",
    "year": 1966,
    "mission": "Surveyor 2",
    "model_file": None,
    "image": "https://images-assets.nasa.gov/image/PIA04216/PIA04216~orig.jpg",
    "who": "NASA Jet Propulsion Laboratory.",
    "what": "Soft-landing probe that tumbled out of control during a mid-course correction and crashed.",
    "when": "Impacted September 23, 1966.",
    "where": "Near Copernicus Crater (approximate), Moon.",
    "how": "During a mid-course correction burn, one of three vernier engines failed to ignite, sending the spacecraft into an uncontrollable tumble.",
    "why_left": "Crashed due to engine failure during trajectory correction. It impacted at high speed.",
    "fun_fact": "Surveyor 2's failure taught engineers critical lessons that helped make Surveyor 3, 5, 6, and 7 all successful soft landings!",
    "reading_level_simple": {
        "title": "The Tumbling Moon Probe",
        "summary": "A probe that lost control and crash-landed on the Moon!",
        "story": "Surveyor 2 was supposed to land gently on the Moon, but when it fired its rocket engines to adjust course, one engine didn't work! The spacecraft started spinning wildly like a top and nobody could stop it. It crashed into the Moon at high speed. But the engineers learned from this mistake and the very next Surveyor landed perfectly!",
        "did_you_know": "Engineers figured out the engine failure was caused by a tiny fuel valve that got stuck — just one small part out of thousands!"
    },
    "reading_level_advanced": {
        "title": "Surveyor 2 — Mid-Course Correction Failure",
        "summary": "Second Surveyor mission lost during vernier engine mid-course correction maneuver.",
        "story": "Surveyor 2 was launched on September 20, 1966 aboard an Atlas-Centaur rocket. During the mid-course correction maneuver, vernier engine #3 failed to ignite, inducing an asymmetric thrust that sent the spacecraft tumbling at a rate that exceeded the attitude control system's capability. All attempts to regain control were unsuccessful, and the spacecraft impacted the lunar surface southeast of Copernicus Crater.",
        "did_you_know": "The investigation board's finding that a fuel valve had failed to open under thermal stress led to redesigned valve heaters on all subsequent Surveyor missions."
    },
    "hotspots": [],
    "source_names": ["NASA NSSDCA Surveyor 2 Catalog"],
    "verified": False
}

# ---- Surveyor 4 (crashed) ----
surveyor_4 = {
    "id": "surveyor-4-impact",
    "name": "Surveyor 4 Impact Site",
    "body": "Moon",
    "category": "impactor",
    "status": "impacted",
    "site": "Surveyor 4 Impact - Sinus Medii",
    "lat": 0.4,
    "lon": -1.33,
    "location_accuracy": "approximate",
    "year": 1967,
    "mission": "Surveyor 4",
    "model_file": None,
    "image": "https://images-assets.nasa.gov/image/PIA04216/PIA04216~orig.jpg",
    "who": "NASA Jet Propulsion Laboratory.",
    "what": "Soft-landing probe that lost contact 2.5 minutes before touchdown and presumably crashed.",
    "when": "Contact lost July 17, 1967, approximately 02:02 UTC.",
    "where": "Sinus Medii (Central Bay), Moon — near the center of the visible lunar disk.",
    "how": "All systems performed nominally during transit and braking, but radio contact was lost 2.5 minutes before the planned soft landing.",
    "why_left": "Signal loss during terminal descent — the cause was never determined. The spacecraft likely impacted at its landing target.",
    "fun_fact": "Surveyor 4 was heading for the exact center of the Moon as seen from Earth — a spot called Sinus Medii, or 'Central Bay'!",
    "reading_level_simple": {
        "title": "The Mystery of Surveyor 4",
        "summary": "A probe that vanished just minutes before it was supposed to land on the Moon!",
        "story": "Surveyor 4 was flying perfectly toward the Moon. Everything was working great — the engines fired, the spacecraft slowed down, and it was just minutes from landing. Then suddenly, its radio went silent! Nobody ever found out exactly what went wrong. It's one of the great mysteries of the space program.",
        "did_you_know": "NASA has never determined why Surveyor 4 lost contact — making it one of the most puzzling unsolved mysteries of lunar exploration!"
    },
    "reading_level_advanced": {
        "title": "Surveyor 4 — Terminal Descent Signal Loss",
        "summary": "Third attempted Surveyor soft landing, lost during main retrorocket burn.",
        "story": "Surveyor 4 performed a nominal flight to the Moon with a successful mid-course correction. During the terminal descent phase, all telemetry indicated proper main retrorocket ignition and performance. However, radio contact was abruptly lost approximately 2.5 minutes before the calculated touchdown time. Post-mission analysis could not conclusively determine whether the main retrorocket exploded, a structural failure occurred, or a communications system malfunction masked an otherwise successful landing.",
        "did_you_know": "Surveyor 4's target site in Sinus Medii was later used as a reference point for Apollo mission navigation planning."
    },
    "hotspots": [],
    "source_names": ["NASA NSSDCA Surveyor 4 Catalog"],
    "verified": False
}

# Insert new records
objects.append(curiosity_rover)
objects.append(perseverance_rover)
objects.append(surveyor_2)
objects.append(surveyor_4)

# ========== Add new fields to ALL records ==========
for obj in objects:
    # scope_tier
    if "scope_tier" not in obj:
        obj["scope_tier"] = "core"
    
    # agency / country
    if "agency" not in obj:
        obj["agency"] = "NASA"
    if "country" not in obj:
        obj["country"] = "United States"
    
    # position_type
    if "position_type" not in obj:
        if obj["category"] == "rover" and obj["status"] in ("abandoned", "active"):
            obj["position_type"] = "last_known_position"
        elif obj["category"] == "impactor":
            obj["position_type"] = "impact_site"
        else:
            obj["position_type"] = "landing_site"
    
    # last_known coords for rovers
    if "last_known_lat" not in obj:
        obj["last_known_lat"] = None
    if "last_known_lon" not in obj:
        obj["last_known_lon"] = None
    
    # media metadata fields
    if "media" not in obj:
        obj["media"] = []
    if "primary_image_nasa_id" not in obj:
        obj["primary_image_nasa_id"] = None
    if "primary_image_credit" not in obj:
        obj["primary_image_credit"] = None
    if "primary_image_alt" not in obj:
        obj["primary_image_alt"] = f"NASA photograph of {obj['name']}"

# ========== A8: Rover last-known positions ==========
spirit = find("spirit-rover")
if spirit:
    spirit["last_known_lat"] = -14.589
    spirit["last_known_lon"] = 175.501
    spirit["position_type"] = "last_known_position"
    spirit["status"] = "abandoned"

opp = find("opportunity-rover")
if opp:
    opp["last_known_lat"] = -2.335
    opp["last_known_lon"] = 354.65 - 360  # = -5.35 for Leaflet
    opp["position_type"] = "last_known_position"
    opp["status"] = "abandoned"

sojourner = find("sojourner-rover")
if sojourner:
    sojourner["position_type"] = "last_known_position"
    sojourner["last_known_lat"] = 19.33
    sojourner["last_known_lon"] = -33.55

curiosity = find("curiosity-rover")
if curiosity:
    curiosity["position_type"] = "landing_site"  # still active, at current location

percy = find("perseverance-rover")
if percy:
    percy["position_type"] = "landing_site"

# ========== Mars lon > 180 → convert for Leaflet consistency ==========
for obj in objects:
    if obj["body"] == "Mars":
        if obj["lon"] > 180:
            obj["lon"] = obj["lon"] - 360
        if obj.get("last_known_lon") and obj["last_known_lon"] > 180:
            obj["last_known_lon"] = obj["last_known_lon"] - 360

# ========== Extract NASA Image IDs from existing URLs ==========
for obj in objects:
    url = obj.get("image", "")
    if "images-assets.nasa.gov/image/" in url:
        parts = url.split("/image/")
        if len(parts) > 1:
            nasa_id = parts[1].split("/")[0]
            obj["primary_image_nasa_id"] = nasa_id

# ========== Sort by body then year ==========
objects.sort(key=lambda o: (0 if o["body"] == "Moon" else 1, o["year"], o["id"]))

# ========== Write ==========
with open(DST, "w", encoding="utf-8") as f:
    json.dump(objects, f, indent=2, ensure_ascii=False)

print(f"✅ Wrote {len(objects)} records to {DST}")
moon = sum(1 for o in objects if o["body"] == "Moon")
mars = sum(1 for o in objects if o["body"] == "Mars")
print(f"   Moon: {moon}, Mars: {mars}")
print(f"   New fields: scope_tier, agency, country, position_type, last_known_lat/lon, media, primary_image_*")
verified = sum(1 for o in objects if o.get("verified"))
print(f"   Verified: {verified}/{len(objects)}")
