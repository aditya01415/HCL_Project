from .health import router as health_router
from .resume import router as resume_router
from .job import router as job_router
from .matching import router as matching_router

__all__ = [
    "health_router",
    "resume_router",
    "job_router",
    "matching_router",
]
