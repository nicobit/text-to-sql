from fastapi import APIRouter, status, Response

router = APIRouter(tags=["health"])


@router.get("/health", summary="Liveness probe", status_code=status.HTTP_204_NO_CONTENT)
def liveness(_: Response) -> None:
    """
    • Used by k8s liveness/readiness probes, Azure Front Door, etc.  
    • Returns **204 No Content** so it’s small and cache-safe.  
    • Add extra checks (DB ping, Redis PING, etc.) as needed.
    """
    # Example of a quick dependency check:
    # try:
    #     database.ping()
    # except Exception:
    #     raise HTTPException(status_code=503, detail="database unavailable")
    return None
