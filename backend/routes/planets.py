from fastapi import APIRouter
from backend.services.horizons import get_solar_system_state

router = APIRouter(prefix="/api/planets", tags=["Solar System"])

@router.get("")
async def get_planets():
    """Returns real-time or cached planetary positions from JPL Horizons."""
    return await get_solar_system_state()
