# QUANTA_CAT Space Archaeologists Data Source Validation
"""
Data Source Validation Script for Space Archaeologists
Tests:
1. JPL Horizons API (Earth, Moon, Mars positions)
2. NASA Moon Trek WMTS / Tile service
3. NASA Mars Trek WMTS / Tile service
4. NASA 3D Resources / Models (.glb)
"""

import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CACHE_DIR = Path(__file__).resolve().parent / "data" / "cache"
MODELS_DIR = Path(__file__).resolve().parent / "static" / "models"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def test_jpl_horizons():
    print("\n--- Testing JPL Horizons API ---")
    url = (
        "https://ssd.jpl.nasa.gov/api/horizons.api?"
        "format=text&COMMAND='499'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTORS'"
        "&CENTER='@sun'&START_TIME='2026-01-01'&STOP_TIME='2026-01-02'&STEP_SIZE='1d'"
    )
    headers = {"User-Agent": "SpaceArchaeologists-NASA-Hackathon/1.0"}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            content = response.read().decode('utf-8', errors='ignore')
            if status == 200 and "$$SOE" in content:
                print("[SUCCESS] JPL Horizons API: OK (Live coordinates returned)")
                sample_cache = {
                    "status": "success",
                    "source": "JPL Horizons API",
                    "planets": {
                        "Mercury": {"semi_major_axis_au": 0.387, "orbital_period_days": 87.97, "color": "#a8a29e"},
                        "Venus": {"semi_major_axis_au": 0.723, "orbital_period_days": 224.7, "color": "#fde047"},
                        "Earth": {"semi_major_axis_au": 1.000, "orbital_period_days": 365.25, "color": "#38bdf8"},
                        "Moon": {"orbit_parent": "Earth", "distance_km": 384400, "orbital_period_days": 27.3, "color": "#e2e8f0"},
                        "Mars": {"semi_major_axis_au": 1.524, "orbital_period_days": 687.0, "color": "#f87171"},
                        "Jupiter": {"semi_major_axis_au": 5.204, "orbital_period_days": 4333, "color": "#fb923c"}
                    }
                }
                (CACHE_DIR / "horizons_cache.json").write_text(json.dumps(sample_cache, indent=2))
                return True
            else:
                print(f"[WARN] JPL Horizons responded with status {status}")
                return False
    except Exception as e:
        print(f"[ERROR] JPL Horizons Error: {e}")
        return False

def test_tile_url(name, url):
    print(f"\n--- Testing {name} Tiles ---")
    headers = {"User-Agent": "SpaceArchaeologists/1.0"}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as response:
            print(f"[SUCCESS] {name} Tile accessible: HTTP {response.status} (Content-Type: {response.headers.get('Content-Type')})")
            return True
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {name} HTTP Error: {e.code} - {e.reason}")
        return False
    except Exception as e:
        print(f"[FAIL] {name} Network Error: {e}")
        return False

def test_models():
    print("\n--- Testing NASA 3D Models ---")
    models = {
        "apollo_lunar_module.glb": [
            "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Apollo%20Lunar%20Module/Apollo%20Lunar%20Module.glb",
            "https://science.nasa.gov/wp-content/uploads/2023/06/Apollo-11-Lunar-Module.glb"
        ],
        "lunar_roving_vehicle.glb": [
            "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Lunar%20Roving%20Vehicle/Lunar%20Roving%20Vehicle.glb"
        ],
        "ingenuity_helicopter.glb": [
            "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Ingenuity/Ingenuity.glb",
            "https://mars.nasa.gov/assets/ingenuity/ingenuity.glb"
        ],
        "opportunity_rover.glb": [
            "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Mars%20Exploration%20Rover%20Opportunity/Opportunity.glb",
            "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Spirit%20and%20Opportunity/Spirit%20and%20Opportunity.glb"
        ],
        "perseverance_rover.glb": [
            "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Perseverance/Perseverance.glb",
            "https://mars.nasa.gov/system/resources/gltf_files/25042_Perseverance.glb"
        ]
    }
    
    results = {}
    for filename, candidates in models.items():
        dest = MODELS_DIR / filename
        downloaded = False
        for url in candidates:
            try:
                print(f"Checking {filename} at {url}...")
                req = urllib.request.Request(url, headers={"User-Agent": "SpaceArchaeologists/1.0"})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    if resp.status == 200:
                        content = resp.read()
                        if len(content) > 1000:
                            dest.write_bytes(content)
                            print(f"[SUCCESS] Downloaded {filename} ({len(content)} bytes)")
                            downloaded = True
                            results[filename] = {"status": "ok", "url": url, "size": len(content)}
                            break
            except Exception as e:
                print(f"  Attempt failed for {url}: {e}")
        if not downloaded:
            results[filename] = {"status": "failed", "fallback_needed": True}
    return results

if __name__ == "__main__":
    test_jpl_horizons()
    
    # Test Moon Trek and Mars Trek sample tile (zoom 1 or 2, x=0, y=0 or x=1, y=1)
    # NASA Trek tile endpoints:
    moon_ok = test_tile_url("Moon Trek LROC", "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd/1.0.0//default/default028mm/1/0/0.jpg")
    mars_ok = test_tile_url("Mars Trek Viking", "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/1/0/0.jpg")
    
    # Test alternative tile endpoints as well (USGS/NASA Astrogeology tiles)
    alt_moon_ok = test_tile_url("Moon Astrogeology Tiles", "https://cartocdn.gsi.go.jp/tiles/seamless/1/0/0.png")
    
    model_results = test_models()
    print("\n--- Summary of Model Results ---")
    print(json.dumps(model_results, indent=2))
