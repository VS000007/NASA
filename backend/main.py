import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment configuration
load_dotenv()

app = FastAPI(
    title="Space Archaeologists API",
    description="Backend API for NASA Space Archaeologists Hackathon Project",
    version="1.0.0"
)

# CORS setup for open frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "project": "Space Archaeologists",
        "description": "NASA Abandoned Equipment Storytelling Platform",
        "version": "1.0.0"
    }

# Register API routes
from backend.routes.objects import router as objects_router
from backend.routes.planets import router as planets_router
app.include_router(objects_router)
app.include_router(planets_router)

# Mount static frontend files
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "public" if (BASE_DIR / "public").exists() else BASE_DIR / "static"

if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

from fastapi.responses import FileResponse, JSONResponse

@app.exception_handler(404)
async def not_found_spa_handler(request, exc):
    # If not an API request, serve the main SPA index.html
    if not request.url.path.startswith("/api"):
        index_file = STATIC_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return JSONResponse(status_code=404, content={"detail": "Not Found"})

# Mount local static files if present (for local dev)
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
