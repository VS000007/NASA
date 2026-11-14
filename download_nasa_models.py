import urllib.request
import urllib.parse
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent / "static" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

models = {
    "apollo_lunar_module.glb": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Apollo%20Lunar%20Module/Apollo%20Lunar%20Module.glb",
    "ingenuity_helicopter.glb": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Ingenuity%20Mars%20Helicopter/Ingenuity%20Mars%20Helicopter.glb",
    "opportunity_rover.glb": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B)/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B).glb",
    "perseverance_rover.glb": "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Mars%202020%20Perseverance%20Rover/Mars%202020%20Perseverance%20Rover.glb"
}

headers = {"User-Agent": "SpaceArchaeologists-Hackathon/1.0"}

for name, url in models.items():
    dest = MODELS_DIR / name
    if dest.exists() and dest.stat().st_size > 1000:
        print(f"[EXISTS] {name} ({dest.stat().st_size:,} bytes)")
        continue
    print(f"Downloading {name} from {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if data[:4] == b"glTF":
                dest.write_bytes(data)
                print(f"[SUCCESS] Downloaded {name}: {len(data):,} bytes (Valid GLTF binary)")
            else:
                print(f"[WARN] {name} received non-GLTF header: {data[:20]}")
    except Exception as e:
        print(f"[ERROR] Failed {name}: {e}")
