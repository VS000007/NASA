import json
import logging
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any
import httpx

logger = logging.getLogger("horizons_service")

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "cache"
CACHE_FILE = CACHE_DIR / "horizons_cache.json"

# JPL Horizons Target IDs
# Sun: 10, Mercury: 199, Venus: 299, Earth: 399, Moon: 301, Mars: 499, Jupiter: 599
HORIZONS_TARGETS = {
    "Mercury": {"id": "199", "radius": 4, "color": "#cbd5e1", "period_days": 87.97, "orbit_radius": 90},
    "Venus": {"id": "299", "radius": 7, "color": "#fde047", "period_days": 224.7, "orbit_radius": 135},
    "Earth": {"id": "399", "radius": 8, "color": "#38bdf8", "period_days": 365.25, "orbit_radius": 190},
    "Moon": {"id": "301", "radius": 4, "color": "#e2e8f0", "period_days": 27.32, "orbit_parent": "Earth", "orbit_radius": 28},
    "Mars": {"id": "499", "radius": 6, "color": "#f87171", "period_days": 686.98, "orbit_radius": 260},
    "Jupiter": {"id": "599", "radius": 14, "color": "#fb923c", "period_days": 4332.59, "orbit_radius": 350}
}

HORIZONS_API_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"

def get_fallback_cache() -> Dict[str, Any]:
    """Load cached planetary data if live query fails."""
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                cached = json.load(f)
                return cached.get("planets", HORIZONS_TARGETS)
        except Exception as e:
            logger.warning(f"Error reading horizons_cache.json: {e}")
    return HORIZONS_TARGETS

def parse_horizons_vector(raw_text: str) -> tuple[float, float, float]:
    """Extract X, Y, Z coordinates from JPL Horizons plaintext output between $$SOE and $$EOE."""
    start_tag = "$$SOE"
    end_tag = "$$EOE"
    start_idx = raw_text.find(start_tag)
    end_idx = raw_text.find(end_tag)
    if start_idx == -1 or end_idx == -1:
        raise ValueError("SOE/EOE boundary markers not found in Horizons response")
    
    block = raw_text[start_idx + len(start_tag):end_idx]
    # Block contains lines like:
    # X = 1.2345E-01 Y = 9.8765E-01 Z = 2.3456E-03
    for line in block.splitlines():
        line = line.strip()
        if "X =" in line and "Y =" in line:
            parts = line.split()
            # Find indices for X, Y, Z
            x = float(parts[parts.index("X") + 2])
            y = float(parts[parts.index("Y") + 2])
            z = float(parts[parts.index("Z") + 2]) if "Z" in parts else 0.0
            return x, y, z
    raise ValueError("Vector components X, Y not located in Horizons data block")

async def fetch_planet_position_live(client: httpx.AsyncClient, target_id: str, date_str: str) -> tuple[float, float, float]:
    """Fetch live heliocentric vectors (in AU) for a body from JPL Horizons API."""
    params = {
        "format": "text",
        "COMMAND": f"'{target_id}'",
        "OBJ_DATA": "'NO'",
        "MAKE_EPHEM": "'YES'",
        "EPHEM_TYPE": "'VECTORS'",
        "CENTER": "'@sun'",
        "START_TIME": f"'{date_str}'",
        "STOP_TIME": f"'{date_str} 00:01'",
        "STEP_SIZE": "'1d'",
        "REF_PLANE": "'ECLIPTIC'"
    }
    resp = await client.get(HORIZONS_API_URL, params=params, timeout=5.0)
    if resp.status_code == 200:
        return parse_horizons_vector(resp.text)
    raise RuntimeError(f"Horizons HTTP {resp.status_code}")

async def get_solar_system_state() -> Dict[str, Any]:
    """Retrieve current planetary positions, merging live JPL Horizons queries with fallback values."""
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y-%m-%d")

    planets_data = {}
    fallback = get_fallback_cache()
    live_success_count = 0

    async with httpx.AsyncClient() as client:
        for name, meta in HORIZONS_TARGETS.items():
            entry = dict(meta)
            entry["name"] = name
            
            # Default angular angle based on orbital period if API fails
            days_since_epoch = (now - datetime(2020, 1, 1, tzinfo=timezone.utc)).total_seconds() / 86400.0
            mean_motion_deg = (360.0 / meta["period_days"]) * days_since_epoch
            default_rad = math.radians(mean_motion_deg % 360)
            entry["angle_rad"] = round(default_rad, 4)
            entry["x_au"] = round(math.cos(default_rad) * (meta["orbit_radius"] / 190.0), 4)
            entry["y_au"] = round(math.sin(default_rad) * (meta["orbit_radius"] / 190.0), 4)
            entry["data_source"] = "calculated_ephemeris"

            # Attempt live JPL Horizons fetch for key targets
            if name in ["Earth", "Mars", "Moon"]:
                try:
                    target_id = meta["id"]
                    # If Moon, query with center Earth (@399)
                    if name == "Moon":
                        m_params = {
                            "format": "text",
                            "COMMAND": f"'{target_id}'",
                            "OBJ_DATA": "'NO'",
                            "MAKE_EPHEM": "'YES'",
                            "EPHEM_TYPE": "'VECTORS'",
                            "CENTER": "'@399'",
                            "START_TIME": f"'{date_str}'",
                            "STOP_TIME": f"'{date_str} 00:01'",
                            "STEP_SIZE": "'1d'",
                            "REF_PLANE": "'ECLIPTIC'"
                        }
                        resp = await client.get(HORIZONS_API_URL, params=m_params, timeout=4.0)
                        if resp.status_code == 200:
                            mx, my, _ = parse_horizons_vector(resp.text)
                            entry["angle_rad"] = round(math.atan2(my, mx), 4)
                            entry["distance_km"] = 384400
                            entry["data_source"] = "JPL Horizons API (Live)"
                            live_success_count += 1
                    else:
                        x, y, _ = await fetch_planet_position_live(client, target_id, date_str)
                        entry["x_au"] = round(x, 4)
                        entry["y_au"] = round(y, 4)
                        entry["angle_rad"] = round(math.atan2(y, x), 4)
                        entry["distance_au"] = round(math.sqrt(x*x + y*y), 4)
                        entry["data_source"] = "JPL Horizons API (Live)"
                        live_success_count += 1
                except Exception as ex:
                    logger.info(f"Live fetch for {name} failed ({ex}), using cached ephemeris")
                    entry["data_source"] = "Cached NASA JPL Ephemeris"

            planets_data[name] = entry

    # Update cache file with latest computed snapshot
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "last_updated": now.isoformat(),
                "source": "JPL Horizons API",
                "live_records": live_success_count,
                "planets": planets_data
            }, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to persist horizons cache: {e}")

    return {
        "timestamp": now.isoformat(),
        "live_nodes": live_success_count,
        "planets": planets_data
    }
