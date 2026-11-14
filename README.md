# Space Archaeologists — Abandoned but Not Forgotten

> Storytelling about NASA's discarded equipment on the Moon and Mars.  
> Audience: school-age space enthusiasts (ages 7–16).

## 🚀 Overview

An interactive web experience that lets users explore every piece of hardware NASA has left behind on the Moon and Mars. Navigate a realistic solar system, descend onto high-resolution NASA surface maps, inspect 3D models of real spacecraft, and discover the stories behind each abandoned machine.

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Solar System    │────▶│  Surface Map     │────▶│  Object Viewer   │
│  (Canvas 2D)    │     │  (Leaflet + Trek)│     │  (model-viewer)  │
│  JPL Horizons   │     │  Timeline/Filter │     │  Stories/Voice   │
└─────────────────┘     └──────────────────┘     └──────────────────┘
         │                       │                        │
         └───────────── FastAPI Backend ──────────────────┘
                     data/objects.json (66 records)
```

## 📦 Tech Stack

| Component | Technology |
|---|---|
| Frontend | Vanilla JS, Leaflet.js, Google `<model-viewer>` |
| Backend | Python FastAPI, Uvicorn |
| Data | JSON dataset, JPL Horizons API, NASA Image API |
| Maps | NASA Moon Trek + Mars Trek WMTS tiles |
| 3D Models | Official NASA 3D Resources (GLB format) |
| Deploy | Vercel (serverless Python + static) |

## 🗂️ Dataset

- **66 records** (47 Moon, 19 Mars)
- Scope tier: CORE (NASA hardware)
- Fields: coordinates, mission, dual reading levels (ages 7-10 / 11-16), archaeological matrix (who/what/when/where/how/why), fun facts
- Verified coordinates from NASA NSSDCA, LROC, HiRISE
- 5 real NASA 3D models (Apollo LM, Viking Lander, Opportunity, Perseverance, Ingenuity)

## ✨ Features

### Interactive
- 🌍 Animated solar system with realistic 3D-shaded planets
- 🗺️ Moon and Mars surface maps with NASA Trek tile streaming
- 📍 Site-grouped markers with position types (landing site / last known / impact)
- ⏱️ Chronological timeline slider (1962–2026) with play/pause
- 🔍 Real-time search and category filtering
- 🛰️ Interactive 3D model viewer with component hotspots
- 📷 Before/after image comparison slider
- 🪐 "Fly to this machine" → NASA Eyes on the Solar System
- 📋 Caption panel with full image provenance
- 🔊 Voice narration (Web Speech API)

### Accessibility
- ⌨️ Full keyboard navigation on maps and controls
- 📋 List/table alternative view for all artifacts
- 🏷️ ARIA landmarks, labels, and live regions
- 🔗 Skip-nav link
- 🎯 Focus-visible indicators on all interactive elements
- 🧘 `prefers-reduced-motion` support
- 📝 Text descriptions for maps and media
- 🗣️ Screen reader compatible

### Data Integrity
- ✅ 59/66 records verified against NASA primary sources
- 🏷️ Scope tier labeling (core/neighbour/bonus)
- 📏 Consistent East-positive longitude convention
- ⚠️ Unverified records flagged with warning badge
- 📜 Full media manifest with image provenance

## 🛠️ Setup

```bash
# Clone and enter
cd NASA

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env to add your NASA_API_KEY (get one at https://api.nasa.gov)

# Run locally
python -m uvicorn backend.main:app --reload --port 8000

# Open http://localhost:8000
```

## 📁 Project Structure

```
├── api/                    # Vercel serverless entry point
├── backend/
│   ├── main.py             # FastAPI app
│   ├── routes/
│   │   ├── objects.py      # Artifact API with Pydantic models
│   │   └── planets.py      # Solar system positions
│   └── services/
│       └── horizons.py     # JPL Horizons integration
├── data/
│   ├── objects.json        # Master dataset (66 records)
│   └── media_manifest.json # Image provenance manifest
├── public/
│   ├── index.html          # Main SPA
│   ├── credits.html        # Credits & Sources page
│   ├── css/style.css       # All styling including a11y
│   ├── js/
│   │   ├── solar_system.js # Solar system canvas renderer
│   │   ├── surface_map.js  # Leaflet map controller
│   │   ├── object_viewer.js# 3D viewer & story cards
│   │   ├── accessibility.js# Skip nav, keyboard, table view
│   │   └── media_panel.js  # Caption dialog, slider, Eyes
│   └── models/             # NASA 3D GLB models
├── scripts/
│   ├── build_corrected_dataset.py
│   ├── build_media_manifest.py
│   └── validate_dataset.py
├── vercel.json
├── requirements.txt
├── CHANGELOG.md
└── README.md
```

## 📜 Data Sources

| Source | Usage | Key Required |
|---|---|---|
| [JPL Horizons API](https://ssd.jpl.nasa.gov/horizons/) | Planet positions | No |
| [NASA Image API](https://images-api.nasa.gov) | Mission imagery | No |
| [NASA Moon Trek](https://trek.nasa.gov/moon/) | Lunar surface tiles | api.nasa.gov key |
| [NASA Mars Trek](https://trek.nasa.gov/mars/) | Mars surface tiles | api.nasa.gov key |
| [NASA 3D Resources](https://nasa3d.arc.nasa.gov) | GLB models | No |
| [NASA Eyes](https://eyes.nasa.gov) | Interactive embeds | No |
| [NSSDCA](https://nssdc.gsfc.nasa.gov) | Mission catalogs | No |

## ♿ Accessibility Statement

This project follows WCAG 2.1 Level AA guidelines:
- All interactive elements are keyboard-operable
- Map content has a list/table alternative
- Color is not the sole means of conveying information
- All images have alt text
- Animations respect `prefers-reduced-motion`
- Text is selectable in content areas

## 📄 License

All NASA imagery and data are public domain per [NASA Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
Project code is open source.
