# Changelog

All notable changes to the Space Archaeologists project.

## [2.0.0] — 2026-11-14

### 🔴 Breaking Changes
- Dataset schema expanded: new required fields `scope_tier`, `agency`, `country`, `position_type`
- Image records now include `primary_image_nasa_id`, `primary_image_credit`, `primary_image_alt`

### ✨ Added — Data Layer (Phase 1)
- **4 new records**: Curiosity rover, Perseverance rover, Surveyor 2, Surveyor 4 (total: 66)
- `scope_tier` field on all records (core/neighbour/bonus)
- `agency` and `country` fields for future non-NASA entries
- `position_type` field: `landing_site`, `last_known_position`, or `impact_site`
- `last_known_lat` / `last_known_lon` for rovers that moved (Spirit, Opportunity, Sojourner)
- NASA Image API ID extracted from existing image URLs (`primary_image_nasa_id`)
- `media` array for future multi-image support per artifact

### ✨ Added — Media Layer (Phase 2)
- `data/media_manifest.json` — full image provenance for all 66 records
- Caption/info panel (`<dialog>`) showing title, credit, source link, mission, NASA ID, alt text
- "Fly to this machine" button → opens NASA Eyes on the Solar System
- Before/after image comparison slider (keyboard accessible with arrow keys)
- Credits & Sources page (`public/credits.html`) auto-populated from dataset

### ✨ Added — Accessibility (Phase 3)
- Skip-nav link for keyboard users
- ARIA landmarks (`role="banner"`, `role="main"`, `role="navigation"`)
- `aria-label` on all buttons (zoom, nav, timeline, narration)
- Keyboard-navigable map markers (`tabindex`, `role="button"`, Enter/Space activation)
- List/table alternative view for map data (📋 button toggle)
- ARIA live region for dynamic announcements
- `prefers-reduced-motion` support — disables animations, auto-rotate, warp transitions
- `:focus-visible` outlines on all interactive elements
- Text selectability restored in content areas

### ✨ Added — Map Features (Phase 3)
- Three marker types with distinct icons: 🚀 landing site, 📍 last known position, 💥 impact site
- Marker CSS classes for position-type coloring (`pin-landing-site`, `pin-last-known`, `pin-impact-site`)
- Scope tier badge styling (core/neighbour/bonus)

### ✨ Added — Documentation (Phase 6)
- `README.md` — comprehensive project documentation
- `CHANGELOG.md` — this file
- `demo-script.md` — 3-minute demo walkthrough
- `scripts/validate_dataset.py` — schema and coordinate validation
- `scripts/build_media_manifest.py` — media manifest generator
- `scripts/build_corrected_dataset.py` — dataset correction pipeline

### 🔧 Fixed — Data Corrections
- **Lunar Orbiter 4**: coordinates set to estimated 0°N, -22°E (was 0,0 placeholder); marked `location_accuracy: "unknown"`
- **Apollo 11 Ascent Stage**: marked status `"unknown"` — may still be orbiting the Moon; coordinates set near Tranquility Base as reference point
- **Apollo 16 Ascent Stage**: `location_accuracy` set to `"approximate"`
- **Mars longitudes**: all Mars records >180°E converted to negative (Leaflet -180/+180 convention)
- **Viking 2**: confirmed 134.01°E is correct (IAU East-positive conversion from 226°W)
- Updated backend Pydantic models with all new fields and filters

### 🔧 Fixed — Frontend
- Removed blanket `user-select: none` from content areas
- Dynamic relic counts (no longer hardcoded 45/17 in HTML)

## [1.0.1] — 2026-11-13

### Fixed
- Restored relics catalog and 3D guide with resilient fallbacks for Vercel

## [1.0.0] — 2026-11-13

### Added
- Initial release: NASA Space Archaeologists platform
- Solar system navigator, Leaflet surface maps, 3D object viewer
- 62 artifact records (45 Moon, 17 Mars)
- Vercel deployment configuration
