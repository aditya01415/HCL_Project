from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    """
    Health check endpoint to verify service availability.
    """
    return {
        "status": "ok",
        "service": "AI Resume Screening Service"
    }
